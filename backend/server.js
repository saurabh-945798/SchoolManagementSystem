// ✅ Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ For __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Route Imports
import adminRoutes from './routes/adminRoutes.js';
import teacherAuthRoutes from './routes/teacherAuthRoutes.js';
import teacherControllerRoutes from './routes/teacherRoutes.js';
import teacherPortalRoutes from './routes/teacherPortalRoutes.js';
import studentAuthRoutes from './routes/studentAuthRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import classRoutes from './routes/classRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import studentFeeRoutes from './routes/studentFeeRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import studentStatsRoutes from './routes/studentStatsRoutes.js';
import homeworkRoutes from './routes/homeworkRoutes.js';
import homeworkSubmissionRoutes from './routes/homeworkSubmissionRoutes.js';
import academicCalendarRoutes from './routes/academicCalendarRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js'; 
import timetableRoutes from './routes/timetableRoutes.js';

// ✅ New Offline Fees route import
import offlineFeeRoutes from './routes/offlineFeeRoutes.js';

// ✅ App Setup
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ MongoDB Connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('🎯 API is running');
});

// ✅ Mount All Routes

// Auth Routes
app.use('/api/auth/admin', adminRoutes);
app.use('/api/auth/teacher', teacherAuthRoutes);
app.use('/api/auth/student', studentAuthRoutes);

// Admin Functional Routes
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherControllerRoutes);
app.use('/api/teacher-portal', teacherPortalRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/student-fees', studentFeeRoutes);
app.use('/api/stats', studentStatsRoutes);

// Homework
app.use('/api/homework', homeworkRoutes);
app.use('/api/homework-submissions', homeworkSubmissionRoutes);

// Academic Calendar
app.use('/api/calendar', academicCalendarRoutes);

// Leave Application
app.use('/api/leaves', leaveRoutes);

// ✅ Complaints System
app.use('/api/complaints', complaintRoutes);

// ✅ Timetable System
app.use('/api/timetable', timetableRoutes);

// ✅ Offline Fees System
app.use('/api/offline-fees', offlineFeeRoutes);

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
