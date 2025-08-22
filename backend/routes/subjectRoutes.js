import express from "express";
import {
  createSubject,
  getSubjectsByClass,
  getAllSubjects,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

// Admin Routes for Subject Management
router.post("/", verifyToken, checkAdmin, createSubject);
router.get("/all", verifyToken, checkAdmin, getAllSubjects);
router.get("/:className", verifyToken, checkAdmin, getSubjectsByClass);
router.put("/:id", verifyToken, checkAdmin, updateSubject);
router.delete("/:id", verifyToken, checkAdmin, deleteSubject);

export default router;
