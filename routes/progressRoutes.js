import express from 'express';
import authenticateUser from '../middleware/authenticateUser.js';
import { updateRoadmapProgress } from '../controllers/progressController.js';

const router = express.Router();

router.post('/update-progress', authenticateUser, updateRoadmapProgress);

export default router;
