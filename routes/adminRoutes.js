import express from 'express';
import { getDashboardData } from '../controllers/adminController.js';
import authenticateUser from '../middleware/authenticateUser.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.get('/dashboard', authenticateUser, authorizeRole('admin'), getDashboardData);

export default router;
