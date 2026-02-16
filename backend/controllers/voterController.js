const VotingEvent = require('../models/VotingEvent');
const Candidate = require('../models/Candidate');
const VoteRecord = require('../models/VoteRecord');
const web3Helper = require('../utils/web3Helper');
const crypto = require('crypto');

exports.listActiveEvents = async (req, res, next) => {
  try {
    const events = await VotingEvent.find({
      $or: [
        { status: { $in: ['active', 'finished', 'not_started', 'paused', 'inactive'] } },
        { resultsPublished: true }
      ]
    }).sort({ createdAt: -1 }).populate('candidates');

    // Add "hasVoted" flag for each event
    const eventsWithStatus = events.map(event => {
      const votedBy = event.votedBy || [];
      const userId = req.user ? req.user.id : null;
      // Use .some() and .toString() to correctly compare ObjectId with string ID
      const hasVoted = userId ? votedBy.some(id => id.toString() === userId.toString()) : false;
      return {
        ...event.toObject(),
        hasVoted
      };
    });

    res.json({ events: eventsWithStatus, voterName: req.user ? req.user.email : 'Unknown Voter' });
  } catch (err) {
    next(err);
  }
};

exports.getEventDetails = async (req, res, next) => {
  try {
    const event = await VotingEvent.findById(req.params.id).populate('candidates');
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const hasVoted = event.votedBy.includes(req.user.id);
    res.json({ event, candidates: event.candidates, hasVoted });
  } catch (err) {
    next(err);
  }
};

exports.castVote = async (req, res, next) => {
  try {
    const { candidateId } = req.body;
    const event = await VotingEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.status !== 'active') {
      return res.status(400).json({ error: 'Election is not active' });
    }

    if (event.votedBy.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have already voted' });
    }

    // Backend calls smart contract to vote
    const txHash = await web3Helper.vote(event.contractAddress, req.user.id, candidateId);

    // Increment Candidate vote count
    const candidate = await Candidate.findById(candidateId);
    if (candidate) {
      candidate.voteCount = (candidate.voteCount || 0) + 1;
      await candidate.save();
    }

    // Update DB
    event.votedBy.push(req.user.id);
    event.totalVotes += 1;
    await event.save();

    // Create Vote Record (Receipt)
    const refNum = crypto.randomBytes(4).toString('hex').toUpperCase();
    const record = new VoteRecord({
      voter: req.user.id,
      event: event._id,
      txHash,
      referenceNumber: `VOTE-${refNum}-${Date.now().toString().slice(-4)}`
    });
    await record.save();

    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) {
      io.emit('voteUpdate', { eventId: event._id });
    }

    res.json({ message: 'Vote recorded successfully', txHash, referenceNumber: record.referenceNumber });
  } catch (err) {
    next(err);
  }
};

exports.getMyVotes = async (req, res, next) => {
  try {
    const votes = await VoteRecord.find({ voter: req.user.id })
      .populate('event', 'title startTime')
      .sort({ votedAt: -1 });
    res.json({ votes });
  } catch (err) {
    next(err);
  }
};

exports.viewResults = async (req, res, next) => {
  try {
    const event = await VotingEvent.findById(req.params.id).populate('candidates');
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (!event.resultsPublished) {
      return res.status(403).json({ error: 'Results have not been published by the administrator yet.' });
    }

    // Fetch real votes from database (Mocking Smart Contract behavior)
    const results = event.candidates.map(c => ({
      candidate: c.name,
      party: c.party,
      votes: c.voteCount || 0,
      percentage: 0
    }));

    // Normalize percentages
    const total = results.reduce((a, b) => a + b.votes, 0) || 1;
    results.forEach(r => r.percentage = ((r.votes / total) * 100).toFixed(1));

    const winner = results.sort((a, b) => b.votes - a.votes)[0];

    res.json({ results, winner, totalVotes: event.totalVotes });
  } catch (err) {
    next(err);
  }
};
