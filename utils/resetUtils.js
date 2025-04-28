import Notification from '../models/notificationModel.js';
import Quiz from '../models/quizModel.js';
import Roadmap from '../models/roadmapModel.js';
import User from '../models/userModel.js';

const clearAllRoadmaps = async () => {
  try {
    const result = await Roadmap.deleteMany({});
    console.log(`Deleted ${result.deletedCount} Roadmaps.`);
  } catch (error) {
    console.error('Error deleting Roadmaps:', error);
  }
};
const clearAllUsers = async () => {
  try {
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} Users.`);
  } catch (error) {
    console.error('Error deleting Users:', error);
  }
};
const clearAllQuizes = async () => {
  try {
    const result = await Quiz.deleteMany({});
    console.log(`Deleted ${result.deletedCount} Quizzes.`);
  } catch (error) {
    console.error('Error deleting Quizzes:', error);
  }
};
const clearAllNotifications = async () => {
  try {
    const result = await Notification.deleteMany({});
    console.log(`Deleted ${result.deletedCount} Notification.`);
  } catch (error) {
    console.error('Error deleting Notification:', error);
  }
};

export {
  clearAllRoadmaps,
  clearAllUsers,
  clearAllQuizes,
  clearAllNotifications,
};
