// Helper to toggle submodule in progress
const toggleSubmoduleCompletion = (progress, submoduleId) => {
  const index = progress.completedSubmodules.findIndex(
    (s) => s.submoduleId.toString() === submoduleId
  );

  if (index > -1) {
    progress.completedSubmodules.splice(index, 1);
  } else {
    progress.completedSubmodules.push({ submoduleId, completed: true });
  }
};

// Helper to check if all submodules in a module are completed
const areAllSubmodulesCompleted = (module, completedSubmodules) => {
  const submoduleIds = module.submodules.map((sub) => sub._id.toString());

  return submoduleIds.every((id) =>
    completedSubmodules.find((s) => s.submoduleId.toString() === id)
  );
};

// Helper to recalculate progress percentage
const calculateProgressPercentage = (roadmap, completedSubmodules) => {
  const totalSubmodules = roadmap.modules.reduce(
    (count, mod) => count + mod.submodules.length,
    0
  );

  return totalSubmodules > 0
    ? parseFloat(
        ((completedSubmodules.length / totalSubmodules) * 100).toFixed(2)
      )
    : 0;
};

export {
  toggleSubmoduleCompletion,
  areAllSubmodulesCompleted,
  calculateProgressPercentage,
};
