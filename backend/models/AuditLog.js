const mongoose = require('mongoose');
const { Schema } = mongoose;

const AuditLogSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetType: { type: String }, // e.g., 'User', 'VotingEvent'
    targetId: { type: Schema.Types.ObjectId },
    details: { type: Object },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
