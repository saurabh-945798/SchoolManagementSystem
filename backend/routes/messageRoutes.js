import express from "express";
import {
  createMessage,
  getAllMessages,
  getMessagesForStudent,
  markMessageAsRead,
} from "../controllers/messageController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";
import { checkTeacher } from "../middlewares/checkTeacher.js";

const router = express.Router();

router.post("/admin/create", verifyToken, checkAdmin, createMessage);
router.get("/admin/all", verifyToken, checkAdmin, getAllMessages);

router.post("/teacher/create", verifyToken, checkTeacher, createMessage);

// 🔔 Notification-aware message fetching
router.get("/student/:className/:section", verifyToken, getMessagesForStudent);
router.post("/student/mark-read", verifyToken, markMessageAsRead); // ✅

export default router;
