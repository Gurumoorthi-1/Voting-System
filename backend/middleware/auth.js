const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
