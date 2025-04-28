import Progress from '../models/progressModel.js';
import Roadmap from '../models/roadmapModel.js';
import {
  areAllSubmodulesCompleted,
  calculateProgressPercentage,
  toggleSubmoduleCompletion,
} from '../utils/progress/progressUtils.js';
import generateQuiz from '../utils/quiz/generateQuiz.js';

const updateRoadmapProgress = async (req, res) => {
  try {
    const { roadmapId, moduleId, submoduleId } = req.body;
    const userId = req.user?.userId;

    if (!userId || !roadmapId || !moduleId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let progress = await Progress.findOne({ userId, roadmapId });

    if (!progress) {
      progress = new Progress({
        userId,
        roadmapId,
        completedModules: [],
        completedSubmodules: [],
        isRoadmapCompleted: false,
      });
    }
    if (submoduleId) {
      toggleSubmoduleCompletion(progress, submoduleId);

      const roadmap = await Roadmap.findById(roadmapId);
      if (!roadmap) {
        return res.status(404).json({ message: 'Roadmap not found' });
      }
      const targetModule = roadmap.modules.find(
        (mod) => mod._id.toString() === moduleId
      );
      // console.log('targetModule>>>', targetModule);

      if (!targetModule) {
        return res.status(404).json({ message: 'Module not found' });
      }

      const allSubsCompleted = areAllSubmodulesCompleted(
        targetModule,
        progress.completedSubmodules
      );

      const moduleIndex = progress.completedModules.findIndex(
        (m) => m.moduleId.toString() === moduleId
      );

      if (allSubsCompleted && moduleIndex === -1) {
        progress.completedModules.push({ moduleId, completed: true });
        generateQuiz({
          targetModule,
          roadmapId,
          moduleId,
          userId,
        });
      } else if (!allSubsCompleted && moduleIndex > -1) {
        progress.completedModules.splice(moduleIndex, 1);
      }

      const allModuleIds = roadmap.modules.map((mod) => mod._id.toString());

      const allModulesCompleted = allModuleIds.every((modId) =>
        progress.completedModules.find(
          (m) => m.moduleId.toString() === modId && m.completed
        )
      );

      progress.progressPercentage = calculateProgressPercentage(
        roadmap,
        progress.completedSubmodules
      );
      progress.isRoadmapCompleted = allModulesCompleted;
    }
    await progress.save();
    return res.status(200).json({
      success: true,
      updatedProgress: progress.progressPercentage,
    });
  } catch (error) {
    console.error('Roadmap progress update error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

export { updateRoadmapProgress };
