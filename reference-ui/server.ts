import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI();
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 25MB limit for high-res ingredient photos
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Multi-turn Gemini Chatbot Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, pantryContext } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const ai = getAI();

      let systemInstruction = `You are an expert iOS Culinary Chef and Clinical Nutritionist built into an iPhone calorie tracking app.
You assist the user with meal planning, calorie tracking, recipe suggestions using ingredients they have in their pantry, and nutrition advice.
Maintain a warm, refined, concise, and highly practical iOS-style tone.
When suggesting recipes:
1. Provide a clear recipe title
2. List ingredients with exact measurements
3. Step-by-step cooking steps
4. Precise nutritional breakdown: Calories (kcal), Protein (g), Carbs (g), and Fat (g).
Format cleanly with markdown bullet points and bold headers.`;

      if (pantryContext && Array.isArray(pantryContext) && pantryContext.length > 0) {
        systemInstruction += `\n\nUSER'S CURRENT SAVED PANTRY INGREDIENTS:\n${pantryContext
          .map(
            (ing: any) =>
              `- ${ing.name} (${ing.quantity || 'available'}, ${ing.category || 'ingredient'}${
                ing.calories ? `, ~${ing.calories} kcal` : ''
              })`
          )
          .join('\n')}\nWhen asked what they can make, prioritize using these available ingredients!`;
      }

      // Convert messages to Gemini API contents structure
      const contents = messages.map((m: any) => {
        const parts: any[] = [];
        if (m.imageBase64) {
          const base64Data = m.imageBase64.includes('base64,')
            ? m.imageBase64.split('base64,')[1]
            : m.imageBase64;
          const mimeType = m.imageMimeType || 'image/jpeg';
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType,
            },
          });
        }
        if (m.text) {
          parts.push({ text: m.text });
        }
        return {
          role: m.role === 'model' ? 'model' : 'user',
          parts,
        };
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        reply: response.text || 'I analyzed your request. How else can I assist with your nutrition?',
      });
    } catch (error: any) {
      console.error('Error in /api/chat:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to process conversation with Gemini AI',
      });
    }
  });

  // AI Ingredient Photo Scanner Endpoint
  app.post('/api/analyze-ingredient', async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      const ai = getAI();
      const base64Data = imageBase64.includes('base64,')
        ? imageBase64.split('base64,')[1]
        : imageBase64;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: `Analyze this food ingredient photo. Respond in strict JSON format with this exact structure:
{
  "name": "Specific ingredient name (e.g., Hass Avocado)",
  "category": "produce" | "protein" | "dairy" | "pantry" | "grains" | "other",
  "estimatedQuantity": "e.g. 1 medium, 200g, 1 carton",
  "estimatedCalories": number (approximate calories for this portion),
  "estimatedProtein": number (grams),
  "estimatedCarbs": number (grams),
  "estimatedFat": number (grams),
  "shelfLifeDays": number (approx days before expiration, e.g. 5)
}`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Error analyzing ingredient photo:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to analyze ingredient image',
      });
    }
  });

  // Vite middleware in development vs static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Liquid Glass Food Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
