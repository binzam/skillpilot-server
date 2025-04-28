import express from 'express';
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', logoutUser);
router.get('/refresh-token', refreshAccessToken);

export default router;
