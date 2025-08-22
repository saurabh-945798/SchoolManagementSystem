import express from "express";
import {
  getClassDetailedReport,
  getAllClassSummaryReports,
  getAbsentStudents,
  getAllStudentsAttendance,
  getAllAttendanceWithResults,
  getLatestResultsForAllStudents,
} from "../controllers/reportController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

// ==========================================
// 📊 Admin Reporting Routes
// ==========================================

router.get(
  "/admin/class-summary",
  verifyToken,
  checkAdmin,
  getAllClassSummaryReports
);

router.get(
  "/admin/class-report/:className",
  verifyToken,
  checkAdmin,
  getClassDetailedReport
);

router.get(
  "/admin/absentees",
  verifyToken,
  checkAdmin,
  getAbsentStudents
);

router.get(
  "/admin/all-attendance",
  verifyToken,
  checkAdmin,
  getAllAttendanceWithResults
);

router.get(
  "/admin/latest-results",
  verifyToken,
  checkAdmin,
  getLatestResultsForAllStudents
);

export default router;
