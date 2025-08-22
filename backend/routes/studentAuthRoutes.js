// routes/studentAuthRoutes.js
import express from 'express';
import { studentLogin, getLoggedInStudent } from '../controllers/studentAuthController.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/login', studentLogin);

// ✅ Add this GET route
router.get('/me', verifyToken, getLoggedInStudent);

export default router;
