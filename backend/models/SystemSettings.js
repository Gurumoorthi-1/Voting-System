const mongoose = require('mongoose');
const { Schema } = mongoose;

const SystemSettingsSchema = new Schema({
    appName: { type: String, default: 'Voting System' },
    logoUrl: { type: String },
    isSystemPaused: { type: Boolean, default: false },
    backupFrequency: { type: String, default: 'weekly' },
    notificationsEnabled: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
