const express = require('express');
const { register, login, profile, getSettings } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const router = express.Router();

router.get('/settings', getSettings);
router.post('/register',
  [check('email').isEmail(), check('password').isLength({ min: 6 })],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    register(req, res, next);
  }
);

router.post('/login', login);
router.get('/profile', auth, profile);

module.exports = router;
