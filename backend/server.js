// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Load Gemini API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ API Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(message);

    const botReply =
      result.response?.text()?.trim() ||
      "⚠️ Sorry, I couldn’t generate a response.";

    res.json({ reply: botReply });
  } catch (err) {
    console.error("🔥 Gemini API error:", err);
    res.status(500).json({
      error: "No valid response from Gemini API",
      details: err.message || err.toString(),
    });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
  