const mongoose = require('mongoose');
const { Schema } = mongoose;

const VotingEventSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  admin: { type: Schema.Types.ObjectId, ref: 'User' },
  contractAddress: String,
  candidates: [{ type: Schema.Types.ObjectId, ref: 'Candidate' }],
  status: {
    type: String,
    enum: ['not_started', 'active', 'finished', 'paused'],
    default: 'not_started'
  },
  totalVotes: { type: Number, default: 0 },
  votedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  resultsPublished: { type: Boolean, default: false } // New field for result publishing control
}, { timestamps: true });

module.exports = mongoose.model('VotingEvent', VotingEventSchema);
