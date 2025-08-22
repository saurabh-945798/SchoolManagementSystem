import express from "express";
import {
  createHomework,
  getHomeworkByStudentClass,
  deleteHomework,
} from "../controllers/homeworkController.js";
import { verifyToken } from "../middlewares/verifyToken.js"; // ✅ Your custom middleware

const router = express.Router();

// 🔒 Admin creates homework
router.post("/", verifyToken, createHomework);

// 📚 Student fetches homework (by classLevel)
router.get("/student/:classLevel", verifyToken, getHomeworkByStudentClass);

// ❌ Admin deletes homework
router.delete("/:id", verifyToken, deleteHomework);

export default router;
