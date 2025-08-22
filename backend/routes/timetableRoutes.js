import express from "express";
import {
  createTimetable,
  getClassTimetable,
  getClassTimetableDay,
  getStudentTimetable,
  updateTimetable,
  deleteTimetable,
  deleteClassTimetable,
  addPeriod,
  removePeriod,
  getAllTimetables,
  updatePeriod,
  addPeriodById
} from "../controllers/timetableController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

/* ================================
   📅 Timetable CRUD
================================ */
// Get all timetables - public route
router.get("/", getAllTimetables);

// Create new timetable - admin only
router.post("/", verifyToken, checkAdmin, createTimetable);

// Get timetable for specific class & section - public route
router.get("/class/:classNum/:section", getClassTimetable);

// Get timetable for specific day - public route
router.get("/class/:classNum/:section/day", getClassTimetableDay);

// Get timetable for logged-in student - student only (just verifyToken)
router.get("/student", verifyToken, getStudentTimetable);

// Delete timetable for specific class & section - admin only
router.delete("/class/:classNum/:section", verifyToken, checkAdmin, deleteClassTimetable);

// Update timetable by ID - admin only
router.put("/id/:id", verifyToken, checkAdmin, updateTimetable);

// Delete timetable by ID - admin only
router.delete("/id/:id", verifyToken, checkAdmin, deleteTimetable);

/* ================================
   ⏰ Period Operations (By Class & Section)
================================ */
// Add period - admin only
router.post("/class/:classNum/:section/:day/period", verifyToken, checkAdmin, addPeriod);

// Update period - admin only
router.put("/class/:classNum/:section/:day/:periodNumber", verifyToken, checkAdmin, updatePeriod);

// Remove period - admin only
router.delete("/class/:classNum/:section/:day/:periodNumber", verifyToken, checkAdmin, removePeriod);

/* ================================
   ⏰ Period Operation (By Timetable ID)
================================ */
// Add a period directly by timetable ID - admin only
router.post("/id/:id/period", verifyToken, checkAdmin, addPeriodById);

export default router;
