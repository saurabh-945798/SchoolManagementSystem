import express from "express";
import { getClassWiseResults } from "../controllers/resultReportController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

router.get(
  "/class-wise-results",
  verifyToken,
  checkAdmin,
  getClassWiseResults
);

export default router;
