import express from "express";
import {
  markAttendance,
  getClassAttendance,
  getStudentAttendanceById,
  getAbsentees,
  getAttendanceByClassName, // ✅ NEW detailed report for one class
  getAllAttendanceForAdmin, // ✅ Existing overall admin report
  sendAbsentSMS,
} from "../controllers/attendanceController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

/**
 * ========================
 * Teacher Routes
 * ========================
 */

// ✅ Mark attendance for a class
router.post("/mark", verifyToken, markAttendance);

// ✅ Get attendance for a specific class-section (e.g., "6A")
router.get("/class/:classSection", verifyToken, getClassAttendance);

// ✅ Get attendance of a specific student by ID
router.get("/student/by-id/:studentId", verifyToken, getStudentAttendanceById);

/**
 * ========================
 * Admin Routes
 * ========================
 */

// ✅ Get absentees list (optional query: classSection, date)
// Example: /api/attendance/absent?classSection=10A&date=2025-08-14
router.get("/absent", verifyToken, checkAdmin, getAbsentees);

// ✅ Old style absentee route (by params, if still needed)
router.get(
  "/absentees/:classSection/:date",
  verifyToken,
  checkAdmin,
  getAbsentees
);

// ✅ Send SMS/WhatsApp message to absent students' parents
router.post("/send-message", verifyToken, checkAdmin, sendAbsentSMS);

// ✅ Classwise detailed attendance (full details + overall %)
router.get(
  "/classwise/:className",
  verifyToken,
  checkAdmin,
  getAttendanceByClassName
);

// ✅ Full admin attendance report (all classes, summary)
router.get("/admin-report", verifyToken, checkAdmin, getAllAttendanceForAdmin);

export default router;
