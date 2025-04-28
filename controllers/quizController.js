import QuizAttempt from '../models/quizAttemptModel.js';
import Quiz from '../models/quizModel.js';
const getQuizById = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.userId;
  try {
    const quiz = await Quiz.findById(quizId).select('-questions.correctOption');
    const existingAttempt = await QuizAttempt.findOne({ quizId, userId });

    if (existingAttempt) {
      return res
        .status(200)
        .json({ alreadyTaken: true, attemptId: existingAttempt._id });
    }

    return res.status(200).json({ alreadyTaken: false, quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quiz',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { quizId, userAnswers } = req.body;
    const userId = req.user.userId;

    if (!quizId || !Array.isArray(userAnswers || !userId)) {
      return res.status(400).json({ message: 'Invalid data submitted.' });
    }
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let correctCount = 0;
    const userAnswersWithResult = userAnswers
      .map((answer) => {
        const question = quiz.questions.id(answer.questionId);
        if (!question) {
          return null;
        }
        const isCorrect = question.correctOption === answer.selectedOption;
        if (isCorrect) correctCount++;

        return {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          isCorrect,
        };
      })
      .filter(Boolean);

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = score >= 70;

    const quizAttempt = await QuizAttempt.create({
      userId,
      quizId,
      userAnswers: userAnswersWithResult,
      score,
      isPassed,
    });

    return res
      .status(201)
      .json({ success: true, quizAttempt: quizAttempt._id });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit quiz',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
const getQuizAttempt = async (req, res) => {
  // const userId = req.user.userId;
  const attempt = await QuizAttempt.findById(req.params.attemptId).populate({
    path: 'quizId',
    model: 'Quiz',
    select: 'questions quizTitle',
  });
  if (!attempt) {
    return res.status(404).json({ message: 'Quiz attempt not found' });
  }
  const attemptData = {
    score: attempt.score,
    isPassed: attempt.isPassed,
    userAnswers: attempt.userAnswers,
    quiz: {
      quizTitle: attempt.quizId.quizTitle,
      questions: attempt.quizId.questions.map((question) => ({
        _id: question._id,
        question: question.question,
        options: question.options,
        correctOption: question.correctOption,
      })),
    },
  };

  return res.json(attemptData);
};

export { getQuizById, submitQuiz, getQuizAttempt };
