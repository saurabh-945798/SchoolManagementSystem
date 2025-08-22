import express from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { checkTeacher } from '../middlewares/checkTeacher.js'; // ✅ Import added
import { getAssignedClasses } from '../controllers/teacherPortalController.js';
import { getTeacherProfile } from '../controllers/teacherAuthController.js';

const router = express.Router();

// ✅ Get logged-in teacher's profile (from token)
router.get('/me', verifyToken, checkTeacher, getTeacherProfile);

// ✅ Get all classes assigned to the logged-in teacher
router.get('/classes', verifyToken, checkTeacher, getAssignedClasses); // ✅ checkTeacher added

export default router;
