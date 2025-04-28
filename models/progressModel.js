import mongoose, { Schema } from 'mongoose';

const ModuleProgressSchema = new Schema(
  {
    moduleId: { type: Schema.Types.ObjectId, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const SubmoduleProgressSchema = new Schema(
  {
    submoduleId: { type: Schema.Types.ObjectId, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    isRoadmapCompleted: { type: Boolean, default: false },
    completedModules: { type: [ModuleProgressSchema], default: [] },
    completedSubmodules: { type: [SubmoduleProgressSchema], default: [] },
    progressPercentage: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model('Progress', ProgressSchema);
export default Progress;
