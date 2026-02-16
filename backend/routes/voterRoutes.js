const express = require('express');
const { listActiveEvents, getEventDetails, castVote, viewResults, getMyVotes } = require('../controllers/voterController');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const systemStatusCheck = require('../middleware/systemStatusCheck');
const router = express.Router();

router.use(auth, roleCheck(['voter']), systemStatusCheck);

router.get('/events', listActiveEvents);
router.get('/events/:id', getEventDetails);
router.post('/events/:id/vote', castVote);
router.get('/events/:id/results', viewResults);
router.get('/my-votes', getMyVotes);

module.exports = router;
