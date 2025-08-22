import express from "express";
import {
  createComplaint,
  getAllComplaints,
  updateComplaintStatus,
  getMyComplaints,
  deleteComplaintByAdmin,
  deleteComplaintByStudent
} from "../controllers/complaintController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

// STUDENT ROUTES
router.post("/student/complaint", verifyToken, createComplaint);
router.get("/student/my-complaints", verifyToken, getMyComplaints);
router.delete("/student/complaints/:id", verifyToken, deleteComplaintByStudent); // ✅ Student delete

// ADMIN ROUTES
router.get("/admin/complaints", verifyToken, checkAdmin, getAllComplaints);
router.patch("/admin/complaints/:id/status", verifyToken, checkAdmin, updateComplaintStatus);
router.delete("/admin/complaints/:id", verifyToken, checkAdmin, deleteComplaintByAdmin); // ✅ Admin delete

export default router;
