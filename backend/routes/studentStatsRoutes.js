import express from "express";
import { getSectionWiseStrength } from "../controllers/studentStatsController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const router = express.Router();

router.get("/section-strength/:classLevel", verifyToken, checkAdmin, getSectionWiseStrength);

export default router;
