import express from 'express';
import {
  handleTeacherLogin,
  adminCreateTeacher,
} from '../controllers/teacherAuthController.js';

const router = express.Router();

// Test route to check if route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Teacher Auth Route is working!' });
});

// 👨‍💼 Admin creates/registers a new teacher
router.post('/admin-create', adminCreateTeacher);

// 👩‍🏫 Teacher Login
router.post('/login', handleTeacherLogin);

export default router;
