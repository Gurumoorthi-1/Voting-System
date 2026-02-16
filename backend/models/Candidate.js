const mongoose = require('mongoose');
const { Schema } = mongoose;

const CandidateSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'VotingEvent' },
  name: { type: String, required: true },
  party: { type: String },
  photo: { type: String }, // URL to photo
  bio: { type: String },
  details: String, // Keeping for backward compatibility
  voteCount: { type: Number, default: 0 } // Stores the number of votes received
});

module.exports = mongoose.model('Candidate', CandidateSchema);
