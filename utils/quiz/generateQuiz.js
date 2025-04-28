import { CohereClientV2 } from 'cohere-ai';
import {
  cleanAndParseJson,
  generateQuizPrompt,
  isAIResponseQuiz,
} from '../utils.js';
import saveQuizToDB from './saveQuizToDb.js';
import { io } from '../../index.js';
import Notification from '../../models/notificationModel.js';
import Quiz from '../../models/quizModel.js';

const client = new CohereClientV2({ token: process.env.CO_API_KEY });

const generateQuizInBackground = async ({
  roadmapId,
  moduleId,
  targetModule,
}) => {
  const simpleModule = {
    module: targetModule.module,
    submodules: targetModule.submodules.map((submodule) => ({
      submodule: submodule.submodule,
      topics: submodule.topics,
    })),
  };
  const prompt = generateQuizPrompt(simpleModule);
  const response = await client.chat({
    model: 'command-a-03-2025',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
  const content = response.message?.content?.[0]?.text;
  if (!content) {
    console.error('Empty response from AI');
    return { success: false, quiz: null };
  }

  // console.log('Response content>>>', content);

  const parsed = cleanAndParseJson(content);
  if (!isAIResponseQuiz(parsed)) {
    console.error('Invalid quiz format from AI');
    return { success: false, quiz: null };
  }

  // console.log('parsedResponse>>>', parsed);

  const quizToSave = {
    roadmapId,
    moduleId,
    quizTitle: `Quiz: ${targetModule.module}`,
    questions: parsed.map((q) => ({
      question: q.question,
      options: q.options.map((opt) => ({
        label: opt.label,
        text: opt.text,
      })),
      correctOption: q.correctOption,
    })),
  };
  const { quiz } = await saveQuizToDB(quizToSave);
  return { success: true, quiz };
};
const sendNotificationIfNotExists = async ({
  userId,
  roadmapId,
  quizId,
  moduleTitle,
}) => {
  const existingNotification = await Notification.findOne({
    receiverUserId: userId,
    quizId,
  }).lean();

  if (!existingNotification) {
    const notification = {
      receiverUserId: userId,
      title: `Great job on completing '${moduleTitle}'!`,
      subTitle: 'A quiz has been prepared for you.',
      roadmapId,
      quizId,
    };
    const savedNotification = await Notification.create(notification);
    io.to(userId.toString()).emit('notification', savedNotification);
  }
};
const generateQuiz = async (data) => {
  try {
    const { userId, roadmapId, moduleId, targetModule } = data;
    let quiz = await Quiz.findOne({ roadmapId, moduleId }).lean();

    if (!quiz) {
      const result = await generateQuizInBackground({
        roadmapId,
        moduleId,
        targetModule,
      });
      if (!result.success || !result.quiz) {
        return { success: false, quiz: null };
      }
      quiz = result.quiz;
    }
    await sendNotificationIfNotExists({
      userId,
      roadmapId,
      quizId: quiz._id,
      moduleTitle: targetModule.module,
    });

    return { success: true, quiz };
  } catch (error) {
    console.error('Error checking or generating quiz:', error);
    return { success: false, quiz: null };
  }
};

export default generateQuiz;
