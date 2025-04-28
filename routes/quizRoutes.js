import express from 'express';
import {
  getQuizById,
  submitQuiz,
  getQuizAttempt,
} from '../controllers/quizController.js';
import authenticateUser from '../middleware/authenticateUser.js';

const router = express.Router();

router.get('/:quizId', authenticateUser, getQuizById);
router.post('/submit', authenticateUser, submitQuiz);
router.get('/attempt/:attemptId', authenticateUser, getQuizAttempt);

export default router;
