import express from "express";
import {
  submitHomework,
  getSubmissionsByHomeworkId,
  markAsChecked,
} from "../controllers/homeworkSubmissionController.js";
import { verifyToken } from "../middlewares/verifyToken.js"; // ✅ Your custom middleware

const router = express.Router();

// 🧑‍🎓 Student submits homework
router.post("/", verifyToken, submitHomework);

// 🧑‍🏫 Admin gets all submissions for a homework
router.get("/homework/:homeworkId", verifyToken, getSubmissionsByHomeworkId);

// ✅ Admin marks as checked (optional remarks)
router.put("/:id/check", verifyToken, markAsChecked);

export default router;
