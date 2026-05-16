import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


// Timeout wrapper
const withTimeout = (promise, ms = 20000) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Gemini timed out after ${ms}ms`)),
      ms
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

// POST /api/ai/analyze
router.post("/analyze", async (req, res) => {
  console.log("📨 /analyze hit");

  let responded = false;
  const safeRespond = (status, body) => {
    if (!responded) {
      responded = true;
      res.status(status).json(body);
    }
  };

  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return safeRespond(400, { error: "Resume text too short or missing" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return safeRespond(500, { error: "GEMINI_API_KEY not set in .env" });
    }

    console.log("🤖 Calling Gemini...");

    const prompt = `Analyze this resume and return structured feedback:
- Strengths (bullet points)
- Weaknesses (bullet points)
- Improvement suggestions (bullet points)
- ATS compatibility score (0-100) with reason

Resume:
${resumeText}`;

    const result = await withTimeout(model.generateContent(prompt), 20000);
    const text = await result.response.text();

    console.log("✅ Gemini done, chars:", text.length);
    safeRespond(200, { analysis: text });

  } catch (err) {
    console.error("❌ /analyze error:", err.message);

    if (err.message.includes("timed out")) {
      return safeRespond(504, { error: "AI request timed out. Try again." });
    }
    if (err.message.includes("API_KEY") || err.message.includes("API key")) {
      return safeRespond(401, { error: "Invalid Gemini API key." });
    }

    safeRespond(500, { error: "AI analysis failed.", detail: err.message });
  }
});

export default router;