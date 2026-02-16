const express = require('express');
const {
    createAdmin,
    listAdmins,
    updateAdmin,
    deleteAdmin,
    viewAllEvents,
    getStats,
    getAuditLogs,
    getSettings,
    updateSettings
} = require('../controllers/superAdminController');
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

router.use(auth, roleCheck(['superadmin']));

// Dashboard Stats
router.get('/stats', getStats);

// Admin Management
router.get('/admins', listAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);

// Audit Logs
router.get('/logs', getAuditLogs);

// System Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// View all
router.get('/events', viewAllEvents);

module.exports = router;
