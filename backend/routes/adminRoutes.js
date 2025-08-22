import express from 'express';
import { adminLogin } from '../controllers/adminController.js';
import { getDashboardSummary } from '../controllers/adminDashboardController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { checkAdmin } from '../middlewares/checkAdmin.js';

const router = express.Router();

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin Login
 * @access  Public
 */
router.post('/login', adminLogin);

/**
 * @route   GET /api/auth/admin/dashboard-summary
 * @desc    Get admin dashboard metrics like total students, teachers, fees, attendance stats, etc.
 * @access  Admin Only
 */
router.get('/dashboard-summary', verifyToken, checkAdmin, getDashboardSummary);

export default router;
