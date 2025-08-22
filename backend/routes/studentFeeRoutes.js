import express from "express";
import {
  getStudentFeeStructure,
  createRazorpayOrder,
  verifyPayment,
  recordFeePayment,
  getFeeHistory,
  getAllStudentPayments,
  getFeeStatusSummary,
  getClassWiseDefaulters, // ✅ New import
} from "../controllers/studentFeeController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

// 🔥 Log when file is loaded
console.log("✅ studentFeeRoutes.js loaded");

// =========================
// 🎓 STUDENT ROUTES
// =========================

// ✅ Get student's fee structure by ID
router.get(
  "/structure/:studentId",
  verifyToken,
  (req, res, next) => {
    console.log("📥 Route Hit: /structure/:studentId →", req.params.studentId);
    next();
  },
  getStudentFeeStructure
);

// ✅ Get student's fee payment history
router.get(
  "/history/:studentId",
  verifyToken,
  (req, res, next) => {
    console.log("📥 Route Hit: /history/:studentId →", req.params.studentId);
    next();
  },
  getFeeHistory
);

// ✅ Step 1: Create a Razorpay payment order
router.post(
  "/create-order",
  verifyToken,
  (req, res, next) => {
    console.log("📥 Route Hit: /create-order");
    next();
  },
  createRazorpayOrder
);

// ✅ Step 2: Verify Razorpay payment signature
router.post(
  "/verify-payment",
  verifyToken,
  (req, res, next) => {
    console.log("📥 Route Hit: /verify-payment");
    next();
  },
  verifyPayment
);

// ✅ Step 3: Record successful payment in DB
router.post(
  "/record-payment",
  verifyToken,
  (req, res, next) => {
    console.log("📥 Route Hit: /record-payment");
    console.log("🧾 Body:", req.body);
    next();
  },
  recordFeePayment
);

// =========================
// 🛠 ADMIN ROUTES
// =========================

// ✅ Admin route to get all student payments
router.get(
  "/admin/all-payments",
  verifyToken,
  checkAdmin,
  (req, res, next) => {
    console.log("📥 Route Hit: /admin/all-payments");
    next();
  },
  getAllStudentPayments
);

// ✅ Admin route to get list of students with full / partial fees
router.get(
  "/admin/fee-status-summary",
  verifyToken,
  checkAdmin,
  (req, res, next) => {
    console.log("📥 Route Hit: /admin/fee-status-summary");
    next();
  },
  getFeeStatusSummary
);

// ✅ Admin: Get class-wise fee defaulters
router.get(
  "/admin/class-wise-defaulters",
  verifyToken,
  checkAdmin,
  (req, res, next) => {
    console.log("📥 Route Hit: /admin/class-wise-defaulters");
    next();
  },
  getClassWiseDefaulters
);

export default router;
