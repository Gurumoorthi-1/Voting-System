const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashed, role: 'voter' });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const payload = { id: user._id.toString(), role: user.role, email: user.email };
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
    const token = jwt.sign(payload, secret.trim(), { expiresIn: '8h' });

    // Return user info along with token so frontend can navigate correctly
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.findOne();
    res.json({ settings });
  } catch (err) {
    next(err);
  }
};
