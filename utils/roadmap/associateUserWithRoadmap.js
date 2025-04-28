import Progress from '../../models/progressModel.js';
import User from '../../models/userModel.js';

export const associateUserWithRoadmap = async (userId, roadmapId) => {
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { roadmaps: roadmapId } },

    { new: true }
  );

  const existingProgress = await Progress.findOne({ userId, roadmapId });
  if (!existingProgress) {
    await Progress.create({ userId, roadmapId });
  }
};
export default associateUserWithRoadmap;
