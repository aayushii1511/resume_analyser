import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const PDFParse = require("pdf-parse");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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

// POST /api/ai/extract — Parse uploaded file and return plain text
router.post("/extract", upload.single("file"), async (req, res) => {
  console.log("📨 /extract hit");

  let responded = false;
  const safeRespond = (status, body) => {
    if (!responded) {
      responded = true;
      res.status(status).json(body);
    }
  };

  try {
    if (!req.file) {
      return safeRespond(400, { error: "No file uploaded" });
    }

    const { mimetype, buffer, originalname } = req.file;
    let extractedText = "";

    console.log(`📄 Parsing ${originalname} (${mimetype})`);

    if (mimetype === "application/pdf") {
      // Parse PDF
      const data = await PDFParse(buffer);
      extractedText = data.text;
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      // Parse DOCX/DOC
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (mimetype === "text/plain") {
      // Plain text file
      extractedText = buffer.toString("utf-8");
    } else {
      return safeRespond(400, { error: `Unsupported file type: ${mimetype}` });
    }

    // Clean and validate extracted text
    extractedText = extractedText.trim();
    if (!extractedText || extractedText.length < 20) {
      return safeRespond(400, { error: "Could not extract meaningful text from file. Please try another file." });
    }

    console.log(`✅ Extracted ${extractedText.length} characters`);
    safeRespond(200, { text: extractedText });
  } catch (err) {
    console.error("❌ /extract error:", err.message);
    safeRespond(500, { error: "Failed to parse file. Please try another file.", detail: err.message });
  }
});

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

    const result = await withTimeout(model.generateContent(prompt), 60000);
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
    if (err.message.includes("503") || err.message.includes("high demand")) {
      return safeRespond(503, { error: "AI service is temporarily overloaded. Please try again in a moment." });
    }

    safeRespond(500, { error: "AI analysis failed.", detail: err.message });
  }
});

// POST /api/ai/roadmap — Generate career roadmap from resume
router.post("/roadmap", async (req, res) => {
  console.log("📨 /roadmap hit");

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

    console.log("🗺️  Generating career roadmap...");

    const prompt = `Based on this resume, generate a structured career development roadmap with 5-6 milestones. For each milestone, provide:
- Title (e.g., "Master Advanced React Patterns")
- Description (1 sentence)
- Estimated weeks to complete
- Key skills to develop (3-4 skills)

Format your response as a JSON array like this:
[
  {
    "title": "...",
    "description": "...",
    "estimatedWeeks": X,
    "skills": ["skill1", "skill2", "skill3"]
  }
]

Resume:
${resumeText}`;

    const result = await withTimeout(model.generateContent(prompt), 60000);
    const text = await result.response.text();

    // Try to parse JSON from response
    let milestones = [];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        milestones = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.warn("⚠️  Could not parse milestones as JSON, returning raw text");
    }

    console.log("✅ Roadmap generated, milestones:", milestones.length);
    safeRespond(200, { milestones, rawText: text });

  } catch (err) {
    console.error("❌ /roadmap error:", err.message);

    if (err.message.includes("timed out")) {
      return safeRespond(504, { error: "Roadmap generation timed out. Try again." });
    }
    if (err.message.includes("API_KEY") || err.message.includes("API key")) {
      return safeRespond(401, { error: "Invalid Gemini API key." });
    }
    if (err.message.includes("503") || err.message.includes("high demand")) {
      return safeRespond(503, { error: "AI service is temporarily overloaded. Please try again in a moment." });
    }

    safeRespond(500, { error: "Roadmap generation failed.", detail: err.message });
  }
});

// POST /api/ai/interview — Generate interview questions from resume
router.post("/interview", async (req, res) => {
  console.log("📨 /interview hit");

  let responded = false;
  const safeRespond = (status, body) => {
    if (!responded) {
      responded = true;
      res.status(status).json(body);
    }
  };

  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || resumeText.trim().length < 50) {
      return safeRespond(400, { error: "Resume text too short or missing" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return safeRespond(500, { error: "GEMINI_API_KEY not set in .env" });
    }

    console.log("🎤 Generating interview questions...");

    const roleContext = targetRole ? `for a ${targetRole} role` : "";

    const prompt = `Based on this resume, generate 6-8 realistic interview questions ${roleContext}. Mix behavioral questions (about past experiences), technical questions (about skills/projects), and situational questions.

Format your response as a JSON array:
[
  {
    "question": "...",
    "type": "behavioral|technical|situational"
  }
]

Resume:
${resumeText}`;

    const result = await withTimeout(model.generateContent(prompt), 60000);
    const text = await result.response.text();

    // Try to parse JSON from response
    let questions = [];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.warn("⚠️  Could not parse questions as JSON");
    }

    console.log("✅ Interview questions generated:", questions.length);
    safeRespond(200, { questions, rawText: text });

  } catch (err) {
    console.error("❌ /interview error:", err.message);

    if (err.message.includes("timed out")) {
      return safeRespond(504, { error: "Question generation timed out. Try again." });
    }
    if (err.message.includes("API_KEY") || err.message.includes("API key")) {
      return safeRespond(401, { error: "Invalid Gemini API key." });
    }
    if (err.message.includes("503") || err.message.includes("high demand")) {
      return safeRespond(503, { error: "AI service is temporarily overloaded. Please try again in a moment." });
    }

    safeRespond(500, { error: "Question generation failed.", detail: err.message });
  }
});

export default router;