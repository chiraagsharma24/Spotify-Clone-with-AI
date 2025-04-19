import express from "express";
import { getAIRecommendations } from "../controllers/ai.controller";
import { authenticateUser } from "../middleware/auth.middleware";

const router = express.Router();

// AI recommendations route
router.post("/recommendations", authenticateUser, getAIRecommendations);

export default router; 