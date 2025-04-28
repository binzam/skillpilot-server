import mongoose, { Schema } from 'mongoose';

const QuizSchema = new Schema(
  {
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    moduleId: { type: Schema.Types.ObjectId, required: true },
    quizTitle: { type: String, required: true, default: 'Quiz' },
    questions: [
      {
        question: { type: String, required: true },
        options: [
          {
            label: { type: String, required: true },
            text: { type: String, required: true },
          },
        ],
        correctOption: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', QuizSchema);
export default Quiz;
