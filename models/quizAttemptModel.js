import mongoose, { Schema } from 'mongoose';

const QuizAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    userAnswers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        selectedOption: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    score: { type: Number, required: true },
    isPassed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const QuizAttempt = mongoose.model('QuizAttempt', QuizAttemptSchema);
export default QuizAttempt;
