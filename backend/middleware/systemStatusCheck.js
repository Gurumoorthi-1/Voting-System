const SystemSettings = require('../models/SystemSettings');

module.exports = async (req, res, next) => {
    try {
        const settings = await SystemSettings.findOne();
        if (settings && settings.isSystemPaused && req.user.role === 'voter') {
            return res.status(503).json({ error: 'System is currently under maintenance. Please try again later.' });
        }
        next();
    } catch (err) {
        next(err);
    }
};
