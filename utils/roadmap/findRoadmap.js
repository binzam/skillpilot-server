import Roadmap from '../../models/roadmapModel.js';
import levenshtein from 'fast-levenshtein';
import associateUserWithRoadmap from './associateUserWithRoadmap.js';

export const findRoadmap = async (topic, userId) => {
  const exactMatch = await Roadmap.findOne({ roadmapTitle: topic });
  if (exactMatch) {
    if (userId)
      await associateUserWithRoadmap(userId, exactMatch._id);
    return exactMatch;
  }
  const allRoadmaps = await Roadmap.find({}, 'roadmapTitle');
  const closeMatches = allRoadmaps
    .map((doc) => ({
      title: doc.roadmapTitle,
      distance: levenshtein.get(
        topic.toLowerCase(),
        doc.roadmapTitle.toLowerCase()
      ),
      id: doc._id,
    }))
    .filter((match) => match.distance <= 3)
    .sort((a, b) => a.distance - b.distance);

  if (closeMatches && closeMatches.length > 0) {
    const similarRoadmap = await Roadmap.findById(closeMatches[0].id);
    if (similarRoadmap) {
      if (userId) {
        await associateUserWithRoadmap(userId, similarRoadmap._id);
      }
      return similarRoadmap;
    }
  }
  return null;
};

export default findRoadmap;
