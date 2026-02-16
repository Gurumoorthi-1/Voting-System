const mongoose = require('mongoose');
const { Schema } = mongoose;

const VoteRecordSchema = new Schema({
    voter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'VotingEvent', required: true },
    txHash: { type: String },
    referenceNumber: { type: String, unique: true },
    votedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VoteRecord', VoteRecordSchema);
