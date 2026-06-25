import express from "express";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// GET /api/user/profile — Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      resumeUploaded: user.resumeUploaded || false,
      lastResumeAnalysis: user.lastResumeAnalysis?.date,
    });
  } catch (err) {
    console.error("❌ /profile error:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// GET /api/user/roadmap — Get user's roadmap
router.get("/roadmap", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      milestones: user.roadmap?.milestones || [],
      lastGenerated: user.roadmap?.lastGenerated,
    });
  } catch (err) {
    console.error("❌ /roadmap error:", err.message);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

// POST /api/user/roadmap — Save generated roadmap
router.post("/roadmap", authMiddleware, async (req, res) => {
  try {
    const { milestones } = req.body;
    if (!milestones || !Array.isArray(milestones)) {
      return res.status(400).json({ error: "Invalid milestones format" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        "roadmap.milestones": milestones.map(m => ({
          ...m,
          completed: false,
        })),
        "roadmap.lastGenerated": new Date(),
      },
      { new: true }
    );

    res.json({ message: "Roadmap saved", roadmap: user.roadmap });
  } catch (err) {
    console.error("❌ POST /roadmap error:", err.message);
    res.status(500).json({ error: "Failed to save roadmap" });
  }
});

// PATCH /api/user/roadmap/:index — Mark milestone as complete/incomplete
router.patch("/roadmap/:index", authMiddleware, async (req, res) => {
  try {
    const { completed } = req.body;
    const index = parseInt(req.params.index);

    const user = await User.findById(req.userId);
    if (!user || !user.roadmap?.milestones[index]) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    user.roadmap.milestones[index].completed = completed;
    await user.save();

    res.json({ message: "Milestone updated", milestone: user.roadmap.milestones[index] });
  } catch (err) {
    console.error("❌ PATCH /roadmap error:", err.message);
    res.status(500).json({ error: "Failed to update milestone" });
  }
});

// PATCH /api/user/resumeStatus — Update resume upload status
router.patch("/resumeStatus", authMiddleware, async (req, res) => {
  try {
    const { uploaded, analysis } = req.body;

    const updateData = { resumeUploaded: uploaded };
    if (analysis) {
      updateData.lastResumeAnalysis = {
        date: new Date(),
        analysis,
      };
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true });
    res.json({ message: "Resume status updated", user });
  } catch (err) {
    console.error("❌ PATCH /resumeStatus error:", err.message);
    res.status(500).json({ error: "Failed to update resume status" });
  }
});

export default router;
