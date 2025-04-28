export const buildRoadmapResponse = (roadmap, progress = null) => {
  const baseResponse = {
    roadmapId: roadmap._id,
    roadmapTitle: roadmap.roadmapTitle,
    modules: roadmap.modules,
    progressPercentage: 0,
    isRoadmapCompleted: false,
    subscribed: false,
    subscribedAt: new Date().toISOString(),
  };

  if (!progress) return baseResponse;

  const modulesWithProgress = roadmap.modules.map((mod) => {
    const moduleCompleted =
      progress?.completedModules.some(
        (m) => m.moduleId.toString() === mod._id.toString()
      ) ?? false;

    const submodulesWithProgress = mod.submodules.map((sub) => ({
      ...(sub.toObject?.() ?? sub),
      isCompleted:
        progress?.completedSubmodules.some(
          (s) => s.submoduleId.toString() === sub._id.toString()
        ) ?? false,
    }));

    return {
      ...(mod.toObject?.() ?? mod),
      isCompleted: moduleCompleted,
      submodules: submodulesWithProgress,
    };
  });

  return {
    ...baseResponse,
    modules: modulesWithProgress,
    progressPercentage: progress?.progressPercentage ?? 0,
    isRoadmapCompleted: progress?.isRoadmapCompleted ?? false,
    subscribed: true,
    subscribedAt: progress?.createdAt ?? null,
    lastUpdated: progress?.updatedAt ?? null,
  };
};
export default buildRoadmapResponse;
