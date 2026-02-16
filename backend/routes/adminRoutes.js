const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  addCandidate,
  updateCandidate,
  removeCandidate,
  getResults,
  getAdminStats,
  toggleResultPublishing,
  getAdminLogs
} = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { check, validationResult } = require('express-validator');
const router = express.Router();

router.use(auth, roleCheck(['admin']));

// Dashboard Stats
router.get('/stats', getAdminStats);
router.get('/logs', getAdminLogs);

// Election Management
router.post('/events',
  [
    check('title').notEmpty(),
    check('startTime').isISO8601(),
    check('endTime').isISO8601()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    createEvent(req, res, next);
  }
);

router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.patch('/events/:id/status', toggleEventStatus);
router.patch('/events/:id/results-publishing', toggleResultPublishing);

// Candidate Management
router.post('/events/:id/candidates', addCandidate);
router.put('/events/:id/candidates/:candidateId', updateCandidate);
router.delete('/events/:id/candidates/:candidateId', removeCandidate);

// Results
router.get('/events/:id/results', getResults);

module.exports = router;
