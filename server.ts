import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Aura Stream API" });
  });

  // AI Playlist Generator Endpoint
  app.post("/api/gemini/generate-playlist", async (req, res) => {
    try {
      const { prompt, genre, mood } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.status(500).json({
          error: "Gemini API key is not configured.",
        });
      }

      const userPrompt = `Create a custom curated music playlist based on:
Prompt: "${prompt || "Chill ambient electronic beats"}"
Genre: ${genre || "Any"}
Mood: ${mood || "Relaxed"}

Return a JSON array of 6 unique track concepts. Each object must have:
- title: string
- artist: string
- genre: string
- duration: string (e.g. "3:42")
- description: string (short vibe description)
- tempo: string (e.g., "120 BPM")
- keySignature: string (e.g., "A Minor")
- suggestedColor: string (hex color string for background accent)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userPrompt,
        config: {
          systemInstruction:
            "You are an expert music curator and audio engineer for Aura Stream. Generate creative, inspiring playlist track concepts.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                genre: { type: Type.STRING },
                duration: { type: Type.STRING },
                description: { type: Type.STRING },
                tempo: { type: Type.STRING },
                keySignature: { type: Type.STRING },
                suggestedColor: { type: Type.STRING },
              },
              required: ["title", "artist", "genre", "duration", "description"],
            },
          },
        },
      });

      const text = response.text || "[]";
      const tracks = JSON.parse(text);
      res.json({ tracks });
    } catch (error: any) {
      console.error("Error generating playlist:", error);
      res.status(500).json({ error: error.message || "Failed to generate playlist" });
    }
  });

  // AI Song Backstory & Lyrics Breakdown
  app.post("/api/gemini/lyrics-story", async (req, res) => {
    try {
      const { title, artist, genre } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.status(500).json({
          error: "Gemini API key is not configured.",
        });
      }

      const prompt = `Write a deep lyrical breakdown, artistic backstory, and emotional analysis for the song "${title}" by "${artist}" (${genre} genre).
Provide:
1. Story Behind The Track (2 paragraphs on inspiration, composition, and production)
2. Musical Highlights (instrumentation, key changes, synth textures)
3. Key Lyrical Themes (bullet points)
4. Recommended Listening Environment (e.g., "Late night highway drive with high-end headphones")`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a acclaimed music journalist and sound analyst for Pitchfork and SoundOnSound.",
        },
      });

      res.json({ story: response.text });
    } catch (error: any) {
      console.error("Error generating lyrics story:", error);
      res.status(500).json({ error: error.message || "Failed to generate story" });
    }
  });

  // Vite middleware for development
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
    console.log(`[Aura Stream] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
