import Roadmap from '../models/roadmapModel.js';
import findRoadmap from '../utils/roadmap/findRoadmap.js';
import generateRoadmap from '../utils/roadmap/generateRoadmap.js';
import User from '../models/userModel.js';
import Progress from '../models/progressModel.js';
import buildRoadmapResponse from '../utils/roadmap/buildRoadmapResponse.js';

const getRoadmap = async (req, res) => {
  const { topic } = req.body;
  const userId = req.user?.userId;

  if (!topic.trim()) {
    return res.status(400).json({ error: 'Topic is required' });
  }
  try {
    // 1. check for eexisting roadmap
    const existingRoadmap = await findRoadmap(topic, userId);
    if (existingRoadmap) {
      const progress = userId
        ? await Progress.findOne({
            userId,
            roadmapId: existingRoadmap._id,
          }).lean()
        : null;
      return res.status(200).json({
        roadmap: buildRoadmapResponse(existingRoadmap, progress),
      });
    }
    // 2. Generate new roadmap if not in db
    const generatedRoadmap = await generateRoadmap(topic, userId);
    // console.log('Generated Roadmap:', generatedRoadmap);
    if (!generatedRoadmap.success || !generatedRoadmap.roadmap) {
      return res.status(500).json({ error: 'Failed to generate roadmap' });
    }
   
    return res.status(200).json({
      roadmap: buildRoadmapResponse(generatedRoadmap.roadmap),
    });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
};

const getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().select('roadmapTitle');

    const total = await Roadmap.countDocuments();

    res.status(200).json({
      results: total,
      data: {
        roadmaps,
      },
    });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch roadmaps',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

const getRoadmapsByUserId = async (req, res) => {
  try {
    const authenticatedUserId = req.user?.userId;
    const targetUserId = req.params.id;

    if (
      !req.user ||
      authenticatedUserId?.toString() !== targetUserId.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'Unauthorized access to this users data.' });
    }
    const user = await User.findById(targetUserId).populate('roadmaps');
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }
    if (user.roadmaps.length === 0) {
      return res.status(200).json({ total: 0, roadmaps: [] });
    }
    const progresses = await Progress.find({ userId: targetUserId });

    const roadmapsWithProgress = user.roadmaps.map((roadmap) => {
      const progress = progresses.find(
        (p) => p.roadmapId.toString() === roadmap._id.toString()
      );

      const completedModules = progress?.completedModules || [];
      const completedSubmodules = progress?.completedSubmodules || [];

      const totalSubmodules = roadmap.modules.reduce(
        (count, mod) => count + mod.submodules.length,
        0
      );
      const completedSubmodulesCount = completedSubmodules.length;
      const progressPercentage =
        totalSubmodules > 0
          ? (completedSubmodulesCount / totalSubmodules) * 100
          : 0;

      const modulesWithProgress = roadmap.modules.map((mod) => {
        const isModuleCompleted =
          completedModules.find(
            (m) => m.moduleId.toString() === mod._id.toString()
          )?.completed || false;

        const submodulesWithProgress = mod.submodules.map((sub) => {
          const isSubmoduleCompleted =
            completedSubmodules.find(
              (s) => s.submoduleId.toString() === sub._id.toString()
            )?.completed || false;

          return {
            ...sub.toObject(),
            isCompleted: isSubmoduleCompleted,
          };
        });

        return {
          ...mod.toObject(),
          isCompleted: isModuleCompleted,
          submodules: submodulesWithProgress,
        };
      });

      return {
        roadmapId: roadmap._id,
        roadmapTitle: roadmap.roadmapTitle,
        isRoadmapCompleted: progress?.isRoadmapCompleted || false,
        progressPercentage,
        modules: modulesWithProgress,
        subscribedAt: progress?.createdAt || null,
        lastUpdated: progress?.updatedAt || null,
      };
    });

    res.status(200).json({
      total: roadmapsWithProgress.length,
      roadmaps: roadmapsWithProgress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user roadmaps' });
  }
};
const savePendingRoadmap = async (req, res) => {
  const userId = req.user?.userId;
  const { roadmapId } = req.body;

  if (!userId || !roadmapId) {
    return res.status(400).json({ message: 'Missing user or roadmapId' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const roadmap = await Roadmap.findById(roadmapId);
  if (!roadmap) {
    return res.status(404).json({ message: 'Roadmap not found' });
  }
  if (user.roadmaps.map((id) => id.toString()).includes(roadmapId)) {
    return res.status(200).json({ success: true });
  }
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { roadmaps: roadmapId } },
    { new: true }
  );
  const progress = await Progress.findOne({ userId, roadmapId });

  if (!progress) {
    await Progress.create({ userId, roadmapId });
  }

  return res.status(200).json({ success: true });
};
const deleteUserRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.user?.userId;

    await User.findByIdAndUpdate(userId, {
      $pull: { roadmaps: roadmapId },
    });

    await Progress.findOneAndDelete({
      userId,
      roadmapId,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({ error: 'Server error while deleting roadmap.' });
  }
};
export {
  getAllRoadmaps,
  getRoadmapsByUserId,
  getRoadmap,
  savePendingRoadmap,
  deleteUserRoadmap,
};
