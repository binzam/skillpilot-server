import express from 'express';
import { getUserNotifications } from '../controllers/notificationController.js';
import authenticateUser from '../middleware/authenticateUser.js';

const router = express.Router();

router.get('/:userId', authenticateUser, getUserNotifications);

export default router;
