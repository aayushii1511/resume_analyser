import mongoose from "mongoose";

const roadmapMilestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  estimatedWeeks: Number,
  skills: [String],
  completed: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    resumeUploaded: {
      type: Boolean,
      default: false,
    },

    lastResumeAnalysis: {
      date: Date,
      analysis: String,
    },

    roadmap: {
      milestones: [roadmapMilestoneSchema],
      lastGenerated: Date,
      generatedFromResume: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;