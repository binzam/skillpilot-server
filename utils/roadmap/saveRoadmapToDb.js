import Roadmap from '../../models/roadmapModel.js';
import associateUserWithRoadmap from './associateUserWithRoadmap.js';

export const saveRoadmapToDB = async (
  parsedRoadmap,
  userId
) => {
  const savedRoadmap = await Roadmap.create(parsedRoadmap);

  if (userId) {
    await associateUserWithRoadmap(userId, savedRoadmap._id);
  }
  return {
    roadmap: {
      roadmapTitle: savedRoadmap.roadmapTitle,
      modules: savedRoadmap.modules,
      _id: savedRoadmap._id,
      progressPercentage: 0,
    },
  };
};
export default saveRoadmapToDB;