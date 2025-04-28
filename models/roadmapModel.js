import mongoose, { Schema } from 'mongoose';

const ResourceSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

// Submodule Schema
const SubmoduleSchema = new Schema(
  {
    submodule: { type: String, required: true },
    topics: [{ type: String, required: true }],
    estimated_time: { type: String, required: true, default: 'unavailable' },
    resources: { type: [ResourceSchema], default: [] },
  },
);

// Module Schema
const ModuleSchema = new Schema(
  {
    module: { type: String, required: true },
    submodules: {
      type: [SubmoduleSchema],
    },
  },
);

// Main Roadmap Schema
const RoadmapSchema = new Schema(
  {
    roadmapTitle: {
      type: String,
      required: true,
      unique: true,
    },
    modules: {
      type: [ModuleSchema],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model('Roadmap', RoadmapSchema);
export default Roadmap;
