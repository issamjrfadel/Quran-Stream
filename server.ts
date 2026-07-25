import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or on route call
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Quran Stream Android Auto" });
});

// Driver Voice Command Parser API using Gemini
app.post("/api/voice-command", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== "string") {
      res.status(400).json({ error: "Missing transcript in request body." });
      return;
    }

    const ai = getAiClient();
    const systemInstruction = `
You are an intelligent voice assistant integrated into an Android Auto Quran streaming application for drivers.
Analyze the user's spoken or typed voice command and convert it into a structured JSON action object.

Available Surahs range from 1 to 114 (e.g., 1=Al-Fatiha, 2=Al-Baqarah, 18=Al-Kahf, 36=Ya-Sin, 55=Ar-Rahman, 56=Al-Waqi'a, 67=Al-Mulk, 112=Al-Ikhlas, 113=Al-Falaq, 114=An-Nas).
Available Reciter IDs: "alafasy" (Mishary Rashid Alafasy), "abdul_basit" (Abdul Basit), "ghamdi" (Saad Al-Ghamdi), "shatri" (Abu Bakr Al-Shatri), "muaiqly" (Maher Al-Muaiqly), "husary" (Mahmoud Khalil Al-Husary), "shuraim" (Saud Al-Shuraim), "dosari" (Yasser Al-Dosari).

Respond ONLY with a JSON object with the following schema:
{
  "action": "PLAY_SURAH" | "DOWNLOAD_SURAH" | "CHANGE_RECITER" | "TOGGLE_HUD" | "SET_SLEEP_TIMER" | "EXPLAIN_SURAH" | "PAUSE" | "RESUME" | "SEARCH" | "UNKNOWN",
  "surahNumber": number or null,
  "reciterId": string or null,
  "minutes": number or null,
  "speechResponse": "A concise, clear, voice-friendly response to be spoken back to the driver in English or Arabic transliteration (max 2 sentences)",
  "explanationText": "Brief summary if asked to explain a surah or verse, otherwise empty"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Voice command from driver: "${transcript}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsedData = JSON.parse(text);
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error processing voice command:", err);
    res.status(500).json({
      error: "Failed to process voice command",
      message: err?.message || "Internal server error",
    });
  }
});

// Vite Middleware for Development / Static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Quran Auto Stream server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
