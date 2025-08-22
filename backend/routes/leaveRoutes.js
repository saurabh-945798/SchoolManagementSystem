import express from "express";
import {
  applyForLeave,
  getAllLeaves,
  getLeaveByStudent,
  updateLeaveStatus,
  uploadCertificate,
  deleteLeaveRequest,
} from "../controllers/leaveController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js"; // ✅ separate import
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

/* ─── Multer Setup for File Upload ─── */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/certificates";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-z0-9.\-]/gi, "_");
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".pdf") {
    return cb(new Error("Only PDF files allowed"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

/* ─── Routes ─── */
router.post("/upload-certificate", verifyToken, upload.single("certificate"), uploadCertificate);
router.post("/apply", verifyToken, applyForLeave);
router.get("/student/me", verifyToken, getLeaveByStudent);
router.get("/student/:studentId", verifyToken, getLeaveByStudent);
router.get("/admin/all", verifyToken, checkAdmin, getAllLeaves);
router.put("/admin/update/:id", verifyToken, checkAdmin, updateLeaveStatus);
router.delete("/admin/delete/:id", verifyToken, checkAdmin, deleteLeaveRequest);

export default router;
