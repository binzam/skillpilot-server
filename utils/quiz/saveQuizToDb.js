import Quiz from '../../models/quizModel.js';

export const saveQuizToDB = async (parsedQuiz) => {
  const savedQuiz = await Quiz.create(parsedQuiz);

  return {
    quiz: savedQuiz,
  };
};
export default saveQuizToDB;
