import express from 'express';
import {
  getAllRoadmaps,
  getRoadmapsByUserId,
  getRoadmap,
  savePendingRoadmap,
  deleteUserRoadmap,
} from '../controllers/roadmapController.js';
import authenticateUser from '../middleware/authenticateUser.js';
import authenticateOptional from '../middleware/authenticateOptional.js';

const router = express.Router();

router.get('/', authenticateUser, getAllRoadmaps);
router.post('/get-roadmap', authenticateOptional, getRoadmap);
router.get('/user/:id', authenticateUser, getRoadmapsByUserId);
router.post('/save-pending-roadmap', authenticateUser, savePendingRoadmap);
router.delete('/:roadmapId', authenticateUser, deleteUserRoadmap);

export default router;
