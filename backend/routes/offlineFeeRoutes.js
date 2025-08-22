import express from "express";
import {
  getStudentByRoll,
  getFeeSummary,
  addOfflinePayment,
} from "../controllers/offlineFeeController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

// 🔹 Search student by roll number (admin only)
router.get("/student", verifyToken, checkAdmin, getStudentByRoll);

// 🔹 Fee summary for one student
// ✅ For admin: use checkAdmin
// ✅ For student portal: remove checkAdmin middleware
router.get("/summary/:studentId", verifyToken, getFeeSummary);

// 🔹 Add offline payment (admin only)
router.post("/add", verifyToken, checkAdmin, addOfflinePayment);

export default router;
