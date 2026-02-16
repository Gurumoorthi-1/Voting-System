const bcrypt = require('bcrypt');
const User = require('../models/User');
const VotingEvent = require('../models/VotingEvent');
const AuditLog = require('../models/AuditLog');
const SystemSettings = require('../models/SystemSettings');

const createLog = async (io, userId, action, targetType, targetId, details) => {
  try {
    const log = await AuditLog.create({ user: userId, action, targetType, targetId, details });
    // Populate user before emitting to ensure the frontend gets the email/role immediately
    const populatedLog = await AuditLog.findById(log._id).populate('user', 'email role');
    if (io) {
      io.emit('newLog', populatedLog);
    }
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const totalElections = await VotingEvent.countDocuments();
    const activeElections = await VotingEvent.countDocuments({ status: 'active' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalUsers = await User.countDocuments({}); // Count all users (admins + voters + superadmins)

    const recentActivities = await AuditLog.find()
      .populate('user', 'email')
      .sort({ createdAt: -1 })
      .limit(10);

    const settings = await SystemSettings.findOne();

    res.json({
      stats: { totalElections, totalAdmins, totalUsers, activeElections },
      recentActivities,
      systemStatus: settings ? (settings.isSystemPaused ? 'Paused' : 'Operational') : 'Operational'
    });
  } catch (err) {
    next(err);
  }
};

exports.createAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let admin = await User.findOne({ email });
    if (admin) return res.status(400).json({ error: 'Admin already exists' });
    const hashed = await bcrypt.hash(password, 10);
    admin = new User({ email, password: hashed, role: 'admin' });
    await admin.save();

    await createLog(req.app.get('socketio'), req.user.id, 'CREATE_ADMIN', 'Admin', admin._id, { email });

    res.status(201).json({ message: 'Admin created', admin });
  } catch (err) {
    next(err);
  }
};

exports.listAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json({ admins });
  } catch (err) {
    next(err);
  }
};

exports.updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const admin = await User.findByIdAndUpdate(id, updateData, { new: true });
    await createLog(req.app.get('socketio'), req.user.id, 'UPDATE_ADMIN', 'Admin', id, { email });

    res.json({ message: 'Admin updated', admin });
  } catch (err) {
    next(err);
  }
};

exports.deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    await createLog(req.app.get('socketio'), req.user.id, 'DELETE_ADMIN', 'Admin', id);
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { startDate, endDate, role, actionType } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (actionType) {
      query.action = actionType;
    }

    const logs = await AuditLog.find(query)
      .populate({
        path: 'user',
        select: 'email role'
      })
      .sort({ createdAt: -1 });

    res.json({ logs });
  } catch (err) {
    next(err);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json({ settings });
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    const io = req.app.get('socketio');
    await createLog(io, req.user.id, 'UPDATE_SETTINGS', 'SystemSettings', settings._id, req.body);

    if (io) {
      io.emit('settingsUpdate', settings);
    }

    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    next(err);
  }
};

exports.viewAllEvents = async (req, res, next) => {
  try {
    const events = await VotingEvent.find().populate('admin', 'email');
    res.json({ events });
  } catch (err) {
    next(err);
  }
};
