import express from "express";
import {
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  deleteFee,
  getFeeByClassName,
  getFeeByStudentId, // ✅ NEW controller import
} from "../controllers/feeController.js";

import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

// ========== Admin Fee Management ==========
router.post("/", verifyToken, checkAdmin, createFee);
router.get("/", verifyToken, checkAdmin, getAllFees);
router.get("/:id", verifyToken, checkAdmin, getFeeById);
router.put("/:id", verifyToken, checkAdmin, updateFee);
router.delete("/:id", verifyToken, checkAdmin, deleteFee);

// ========== Public / Student Routes ==========
router.get("/class/:className", getFeeByClassName); // Fee by class name (no auth)
router.get("/structure/:studentId", verifyToken, getFeeByStudentId); // ✅ Fee by student ID (with auth)

export default router;
