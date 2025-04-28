import express from 'express';
import authenticateUser from '../middleware/authenticateUser.js';
import { getUser } from '../controllers/userController.js';
import { getUserNotifications } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/me', authenticateUser, getUser);
router.get('/:userId/notifications', authenticateUser, getUserNotifications);

export default router;
