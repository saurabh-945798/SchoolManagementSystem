import express from "express";
import {
  createResult,
  bulkCreateResults,
  getResultByStudentId,
  deleteResult,
  getAllResults,
  getStudentsByClassSection,
  getResultByRollNo,
  updateResult, // ✅ Import update controller
} from "../controllers/resultController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

// ============================
// 🔐 Admin Protected Routes
// ============================

router.post("/create", verifyToken, checkAdmin, createResult);               // Create 1 result
router.post("/bulk", verifyToken, checkAdmin, bulkCreateResults);           // Bulk create results
router.get("/all", verifyToken, checkAdmin, getAllResults);                 // Get all results
router.get("/students/:classSection", verifyToken, checkAdmin, getStudentsByClassSection); // Get students by class-section
router.delete("/:id", verifyToken, checkAdmin, deleteResult);               // Delete result by ID
router.put("/:id", verifyToken, checkAdmin, updateResult);                  // ✅ Update result by ID

// ============================
// 🧑‍🎓 Student Routes (token required)
// ============================

router.get("/student/:studentId", verifyToken, getResultByStudentId);       // Student view by ID
router.get("/roll/:rollNo", verifyToken, getResultByRollNo);                // Student view by roll number

export default router;
