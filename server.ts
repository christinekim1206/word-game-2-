import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ALLOWED_ANIMALS = new Set([
  "cat", "dog", "lion", "elephant", "giraffe",
  "monkey", "rabbit", "bear", "fish", "bird",
  "cow", "pig", "duck", "frog", "horse"
]);

// In-memory cache for generated images so rounds are fast and don't re-query Gemini unnecessarily
const imageCache = new Map<string, string>();

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", cachedAnimals: Array.from(imageCache.keys()) });
});

// Image generation endpoint for children's animal quiz
app.post("/api/generate-animal-image", async (req, res) => {
  const animal = (req.body?.animal || "").toLowerCase().trim();

  if (!ALLOWED_ANIMALS.has(animal)) {
    return res.status(400).json({
      success: false,
      error: "Animal not in word list",
      fallback: true,
    });
  }

  // Check cache first
  if (imageCache.has(animal)) {
    return res.json({
      success: true,
      animal,
      imageUrl: imageCache.get(animal),
      cached: true,
    });
  }

  const ai = getGenAI();
  if (!ai) {
    // Graceful fallback when API key is not configured or in sandbox
    return res.json({
      success: false,
      animal,
      error: "GEMINI_API_KEY not configured",
      fallback: true,
    });
  }

  try {
    // Generate image with a prompt tailored for Korean elementary students (cute, friendly, no scary features)
    const prompt = `Cute, bright, colorful cartoon sticker of a happy ${animal}, for young elementary school kids, clear white background, friendly smiling face, simple shapes, 2D vector style, vibrant cheerful colors, educational and child friendly, no text`;

    // Add a promise race with timeout so client never freezes
    const timeoutPromise = new Promise<{ timeout: true }>((_, reject) =>
      setTimeout(() => reject(new Error("Image generation timed out")), 9500)
    );

    const generationPromise = ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    const response: any = await Promise.race([generationPromise, timeoutPromise]);

    let generatedImageUrl: string | null = null;
    const parts = response?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || "image/png";
        generatedImageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (generatedImageUrl) {
      imageCache.set(animal, generatedImageUrl);
      return res.json({
        success: true,
        animal,
        imageUrl: generatedImageUrl,
      });
    } else {
      return res.json({
        success: false,
        animal,
        error: "No image returned by model",
        fallback: true,
      });
    }
  } catch (error: any) {
    console.error(`Failed to generate image for ${animal}:`, error?.message || error);
    return res.json({
      success: false,
      animal,
      error: error?.message || "Generation error",
      fallback: true,
    });
  }
});

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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
