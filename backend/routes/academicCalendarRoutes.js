import express from "express";
import {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/academicCalendarController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js"; // ✅ Corrected

const router = express.Router();

/* ─── Admin Routes ─── */
router.post("/admin/create", verifyToken, checkAdmin, createEvent);
router.put("/admin/update/:id", verifyToken, checkAdmin, updateEvent);
router.delete("/admin/delete/:id", verifyToken, checkAdmin, deleteEvent);

/* ─── Student Route ─── */
router.get("/all", verifyToken, getAllEvents);

export default router;
