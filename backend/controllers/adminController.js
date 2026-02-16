const VotingEvent = require('../models/VotingEvent');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { deployVotingContract } = require('../utils/contractDeployer');

const createLog = async (io, userId, action, targetType, targetId, details) => {
  try {
    const log = await AuditLog.create({ user: userId, action, targetType, targetId, details });
    // Populate user before emitting for real-time consistency
    const populatedLog = await AuditLog.findById(log._id).populate('user', 'email role');
    if (io) {
      io.emit('newLog', populatedLog);
    }
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
};

exports.getAdminStats = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const totalElections = await VotingEvent.countDocuments({ admin: adminId });
    const activeElections = await VotingEvent.countDocuments({ admin: adminId, status: 'active' });
    const totalVoters = await User.countDocuments({ role: 'voter' });

    const myEvents = await VotingEvent.find({ admin: adminId });
    const totalVotesCast = myEvents.reduce((acc, curr) => acc + (curr.totalVotes || 0), 0);
    const totalCandidates = myEvents.reduce((acc, curr) => acc + (curr.candidates ? curr.candidates.length : 0), 0);
    const voterTurnout = totalVoters > 0 ? ((totalVotesCast / (totalVoters * totalElections || 1)) * 100).toFixed(2) : 0;

    const recentActivity = await AuditLog.find({ user: adminId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalElections,
        totalVoters,
        activeElections,
        totalCandidates,
        totalVotes: totalVotesCast,
        voterTurnout: `${voterTurnout}%`,
      },
      recentActivity
    });
  } catch (err) {
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime } = req.body;
    const admin = req.user.id;
    const start = Math.floor(new Date(startTime).getTime() / 1000);
    const end = Math.floor(new Date(endTime).getTime() / 1000);

    console.log('Deploying contract for event:', title);
    const contractAddress = await deployVotingContract(admin, start, end, []);
    console.log('Contract deployed at:', contractAddress);

    const event = new VotingEvent({ title, description, startTime, endTime, admin, contractAddress });
    await event.save();

    await createLog(req.app.get('socketio'), req.user.id, 'CREATE_ELECTION', 'VotingEvent', event._id, { title });

    res.status(201).json({ message: 'Event created', event });
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const events = await VotingEvent.find({ admin: req.user.id }).populate('candidates');
    res.json({ events });
  } catch (err) {
    next(err);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const event = await VotingEvent.findById(req.params.id).populate('candidates');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, status } = req.body;
    const event = await VotingEvent.findByIdAndUpdate(req.params.id,
      { title, description, startTime, endTime, status },
      { new: true }
    );
    await createLog(req.app.get('socketio'), req.user.id, 'UPDATE_ELECTION', 'VotingEvent', req.params.id, { title });
    res.json({ message: 'Event updated', event });
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    await VotingEvent.findByIdAndDelete(req.params.id);
    await createLog(req.app.get('socketio'), req.user.id, 'DELETE_ELECTION', 'VotingEvent', req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

exports.toggleEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const event = await VotingEvent.findByIdAndUpdate(req.params.id, { status }, { new: true });
    const io = req.app.get('socketio');
    await createLog(io, req.user.id, 'TOGGLE_STATUS', 'VotingEvent', req.params.id, { status });

    // Emit real-time status update
    if (io) {
      io.emit('electionUpdate', { eventId: event._id, type: 'status', status });
    }

    res.json({ message: `Event status changed to ${status}`, event });
  } catch (err) {
    next(err);
  }
};

exports.toggleResultPublishing = async (req, res, next) => {
  try {
    const { resultsPublished } = req.body;
    const event = await VotingEvent.findByIdAndUpdate(req.params.id, { resultsPublished }, { new: true });
    const io = req.app.get('socketio');
    await createLog(io, req.user.id, 'TOGGLE_RESULT_PUBLISHING', 'VotingEvent', req.params.id, { resultsPublished });

    // Emit real-time publishing update
    if (io) {
      io.emit('electionUpdate', { eventId: event._id, type: 'publishing', resultsPublished });
    }

    res.json({ message: `Result publishing status changed`, event });
  } catch (err) {
    next(err);
  }
};

exports.addCandidate = async (req, res, next) => {
  try {
    const { name, party, photo, bio } = req.body;
    const eventId = req.params.id;
    const candidate = new Candidate({ event: eventId, name, party, photo, bio });
    await candidate.save();
    await VotingEvent.findByIdAndUpdate(eventId, { $push: { candidates: candidate._id } });

    await createLog(req.app.get('socketio'), req.user.id, 'ADD_CANDIDATE', 'Candidate', candidate._id, { name, eventId });

    const event = await VotingEvent.findById(eventId).populate('candidates');
    res.json({ candidates: event.candidates });
  } catch (err) {
    next(err);
  }
};

exports.updateCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const { name, party, photo, bio } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(candidateId, { name, party, photo, bio }, { new: true });
    await createLog(req.app.get('socketio'), req.user.id, 'UPDATE_CANDIDATE', 'Candidate', candidateId, { name });
    res.json({ candidate });
  } catch (err) {
    next(err);
  }
};

exports.removeCandidate = async (req, res, next) => {
  try {
    const { id, candidateId } = req.params;
    await Candidate.findByIdAndDelete(candidateId);
    await VotingEvent.findByIdAndUpdate(id, { $pull: { candidates: candidateId } });
    await createLog(req.app.get('socketio'), req.user.id, 'REMOVE_CANDIDATE', 'Candidate', candidateId, { eventId: id });
    const event = await VotingEvent.findById(id).populate('candidates');
    res.json({ candidates: event.candidates });
  } catch (err) {
    next(err);
  }
};

exports.getResults = async (req, res, next) => {
  try {
    const event = await VotingEvent.findById(req.params.id).populate('candidates');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const results = event.candidates.map(c => ({ candidate: c.name, votes: c.voteCount || 0 }));
    res.json({ results });
  } catch (err) {
    next(err);
  }
};
exports.getAdminLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
};
