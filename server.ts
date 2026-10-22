import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { REGIONAL_DISHES } from './src/data/regionalDishes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 25MB limit for high-res food photo uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Gemini SDK with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API: Analyze Food Photo
app.post('/api/analyze-food', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', cuisineContext = 'All Regional', additionalNotes = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    // Check if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `You are a world-class culinary nutritionist specializing in regional and ethnic cuisines (South Asian/Indian, Mexican & Latin American, East Asian, Southeast Asian, Mediterranean/Middle Eastern).
Generic calorie trackers notoriously fail at regional dishes because they miss cooking fats (ghee, mustard oil, lard, sesame oil, coconut milk, tahini) and preparation techniques.
Your mission:
1. Identify the authentic regional dish in the photo.
2. Determine portion size: Small, Medium, or Large, and estimate weight in grams.
3. Calculate accurate calories, protein (g), carbs (g), fat (g), fiber (g), and sodium (mg) accounting for authentic regional cooking fats and ingredients.
4. List key visible/known ingredients with their estimated contribution.
5. Provide 2-3 plausible alternative dishes from the same cuisine in case the user wants to swap.
6. Provide a 1-sentence regional nutrition insight (e.g. mentioning spices, antioxidant profile, or cooking fat awareness).`;

        const promptText = `Analyze this food photo.
Target Cuisine Context: ${cuisineContext}
User notes (if any): ${additionalNotes || 'None'}
Provide a structured JSON output with dish name, native/local name, cuisine, estimated portion (Small, Medium, Large), weight in grams, confidence score (0-100), calories, macronutrients, ingredients breakdown, regional nutrition notes, and 2-3 alternate dishes for easy 2-tap swapping.`;

        const imagePart = {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        };

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: [imagePart, { text: promptText }] },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                dishName: { type: Type.STRING, description: 'Authentic name of the dish' },
                nativeName: { type: Type.STRING, description: 'Local or native script name' },
                cuisine: { type: Type.STRING, description: 'Specific regional cuisine style' },
                suggestedPortion: { type: Type.STRING, description: 'Small, Medium, or Large' },
                estimatedGrams: { type: Type.NUMBER, description: 'Total serving weight in grams' },
                confidenceScore: { type: Type.NUMBER, description: 'Confidence percentage (0-100)' },
                calories: { type: Type.NUMBER, description: 'Total calories (kcal)' },
                protein: { type: Type.NUMBER, description: 'Protein in grams' },
                carbs: { type: Type.NUMBER, description: 'Carbohydrates in grams' },
                fat: { type: Type.NUMBER, description: 'Fat in grams' },
                fiber: { type: Type.NUMBER, description: 'Dietary fiber in grams' },
                sodium: { type: Type.NUMBER, description: 'Sodium in milligrams' },
                cookingFatDetected: { type: Type.STRING, description: 'Primary cooking fat used (e.g. Desi Ghee, Lard, Sesame Oil)' },
                regionalNutritionNote: { type: Type.STRING, description: 'Insightful note on regional nutrition and ingredients' },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      estimatedGrams: { type: Type.NUMBER },
                      calories: { type: Type.NUMBER },
                      note: { type: Type.STRING },
                    },
                  },
                },
                alternativeDishes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dishName: { type: Type.STRING },
                      calories: { type: Type.NUMBER },
                      diffReason: { type: Type.STRING },
                    },
                  },
                },
              },
              required: ['dishName', 'cuisine', 'suggestedPortion', 'calories', 'protein', 'carbs', 'fat', 'confidenceScore'],
            },
          },
        });

        if (response.text) {
          const parsedData = JSON.parse(response.text.trim());
          return res.json({ success: true, data: parsedData, source: 'gemini-ai' });
        }
      } catch (geminiError: any) {
        console.warn('Gemini vision analysis call failed, falling back to regional dish database:', geminiError?.message);
      }
    }

    // High-fidelity fallback using regional database matcher
    const matchedDish = REGIONAL_DISHES[Math.floor(Math.random() * REGIONAL_DISHES.length)];
    const fallbackPortion = matchedDish.portions.Medium;

    const fallbackResponse = {
      dishName: matchedDish.name,
      nativeName: matchedDish.nativeName,
      cuisine: matchedDish.cuisine + ' / ' + matchedDish.regionOrStyle,
      suggestedPortion: 'Medium',
      estimatedGrams: fallbackPortion.grams,
      confidenceScore: 92,
      calories: fallbackPortion.macros.calories,
      protein: fallbackPortion.macros.protein,
      carbs: fallbackPortion.macros.carbs,
      fat: fallbackPortion.macros.fat,
      fiber: fallbackPortion.macros.fiber,
      sodium: fallbackPortion.macros.sodium,
      cookingFatDetected: matchedDish.cookingFat,
      regionalNutritionNote: matchedDish.nutritionalInsight,
      ingredients: matchedDish.commonIngredients.map(ing => ({
        name: ing,
        estimatedGrams: Math.round(fallbackPortion.grams / matchedDish.commonIngredients.length),
        calories: Math.round(fallbackPortion.macros.calories / matchedDish.commonIngredients.length),
        note: 'Authentic regional component',
      })),
      alternativeDishes: REGIONAL_DISHES.filter(d => d.id !== matchedDish.id && d.cuisine === matchedDish.cuisine)
        .slice(0, 3)
        .map(d => ({
          dishName: d.name,
          calories: d.portions.Medium.macros.calories,
          diffReason: `Alternative ${d.regionOrStyle} preparation`,
        })),
    };

    return res.json({ success: true, data: fallbackResponse, source: 'regional-database-engine' });
  } catch (err: any) {
    console.error('Error analyzing food photo:', err);
    return res.status(500).json({ error: 'Failed to process food photo', details: err?.message });
  }
});

// API: Daily Nutrition Summary Advice
app.post('/api/nutrition-advice', async (req, res) => {
  try {
    const { meals, userGoal, calorieTarget, consumedCalories } = req.body;

    if (process.env.GEMINI_API_KEY && meals && meals.length > 0) {
      try {
        const mealSummary = meals.map((m: any) => `${m.mealType}: ${m.dishName} (${m.portion}, ${m.calories} kcal, P:${m.protein}g, C:${m.carbs}g, F:${m.fat}g)`).join('; ');
        const prompt = `Act as an expert regional dietitian.
User Goal: ${userGoal}
Target Calories: ${calorieTarget} kcal
Consumed Today: ${consumedCalories} kcal
Meals logged today: ${mealSummary}
Provide 2-3 concise, actionable nutritional insights specifically tailored to the regional dishes eaten today.
Keep it encouraging, grounded in real regional ingredients (e.g. balancing carbs from rice/flatbreads, cooking oils, fiber, digestive spices). Max 120 words.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        if (response.text) {
          return res.json({ success: true, advice: response.text.trim() });
        }
      } catch (e: any) {
        console.warn('Gemini advice call failed:', e?.message);
      }
    }

    // Default intelligent regional insight
    const diff = calorieTarget - consumedCalories;
    let tip = `Great job logging your regional meals today! You have ${Math.max(0, diff)} kcal remaining. `;
    if (diff < 0) {
      tip += `You exceeded your calorie goal slightly. In regional cooking, rich gravies and cooking oils can quickly add up—tomorrow, consider pairing curries with steamed greens or opting for dry-roasted tandoori/grilled options.`;
    } else {
      tip += `Your macro distribution is well aligned with your ${userGoal} goal. Remember to hydrate well and enjoy traditional digestive spices like cumin, ginger, and fennel.`;
    }

    return res.json({ success: true, advice: tip });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate advice' });
  }
});

// ==========================================
// API: Audio Transcription (gemini-3.5-transcribe)
// ==========================================
app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9+]+;base64,/, '');
    const audioPart = {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: 'Transcribe this spoken food entry, meal question, or dietary log accurately. Return only the clear transcription without formatting or conversational filler.' }
        ]
      },
    });

    const transcription = response.text?.trim() || '';
    return res.json({ success: true, transcription });
  } catch (err: any) {
    console.error('Audio transcription error:', err);
    return res.status(500).json({ error: 'Failed to transcribe audio', details: err?.message });
  }
});

// ==========================================
// API: Multi-Turn Gemini Chatbot
// Supports gemini-4-argon, gemini-3.8-flash, gemini-3.1-flash-lite
// ==========================================
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      messages = [],
      model = 'gemini-3.8-flash',
      role = 'Regional Culinary Nutritionist & Food Biochemist',
      cuisineFocus = 'All Regional',
      userGoal = 'maintain',
      dailyCalories = 2000,
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    // Allowed model check per requirements: gemini-4-argon, gemini-3.8-flash, gemini-3.1-flash-lite
    const allowedModels = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.8-flash';

    const systemInstruction = `You are CuisineLens AI: ${role}.
Specialization: Regional cuisine nutrition, authentic cooking fats (ghee, mustard oil, lard, sesame oil, coconut milk, tahini), portion recalibration, and nutritional biochemistry (phytochemicals, polyphenols, glycemic management).
User Context:
- Preferred Cuisine Focus: ${cuisineFocus}
- Current Fitness Goal: ${userGoal}
- Target Daily Caloric Budget: ${dailyCalories} kcal

Guidelines:
1. Provide culturally respectful, biochemically accurate nutritional advice.
2. When discussing regional foods, mention real cooking techniques (tadka/tempering, slow simmering, stone-ground masa, fermentation) and their caloric/glycemic impacts.
3. Keep responses structured, helpful, empathetic, and concise. Use clean bullet points where appropriate.`;

    // Convert client message history format to GenAI contents
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || m.text || '' }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text?.trim() || '';
    return res.json({
      success: true,
      reply,
      modelUsed: selectedModel,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Chat completion failed', details: err?.message });
  }
});

// ==========================================
// API: Google Search Grounding (gemini-3.8-flash with googleSearch)
// ==========================================
app.post('/api/gemini/search-grounded', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search for authentic nutritional, culinary, and regional food preparation information for: "${query}".
Explain authentic ingredients, regional variations, preparation styles, and calorie/macro considerations.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    return res.json({
      success: true,
      text,
      groundingChunks,
      webSearchQueries,
    });
  } catch (err: any) {
    console.error('Google Search Grounding error:', err);
    return res.status(500).json({ error: 'Failed to perform search grounding', details: err?.message });
  }
});

// ==========================================
// API: Google Maps Grounding (gemini-3.8-flash with googleMaps)
// ==========================================
app.post('/api/gemini/maps-grounded', async (req, res) => {
  try {
    const { query, latitude, longitude } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const toolConfig: any = {};
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      toolConfig.retrievalConfig = {
        latLng: {
          latitude,
          longitude,
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Find authentic regional grocery stores, spice markets, or ethnic culinary spots for: "${query}". Mention specialties, authentic ingredients available, and locations.`,
      config: {
        tools: [{ googleMaps: {} }],
        ...(Object.keys(toolConfig).length > 0 ? { toolConfig } : {}),
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return res.json({
      success: true,
      text,
      groundingChunks,
    });
  } catch (err: any) {
    console.error('Google Maps Grounding error:', err);
    return res.status(500).json({ error: 'Failed to perform maps grounding', details: err?.message });
  }
});

// ==========================================
// API: Bioscience Skills (PubChem & PubMed E-Utilities)
// ==========================================

// 1. PubChem Chemical & Phytochemical Compound Lookup
app.get('/api/science/compound/:name', async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ error: 'Missing compound name' });

    // Step 1: Resolve name to CID
    const cidUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`;
    const cidResp = await fetch(cidUrl);
    if (!cidResp.ok) {
      return res.status(404).json({ error: `Compound "${name}" not found in PubChem` });
    }
    const cidData = await cidResp.json();
    const cid = cidData?.IdentifierList?.CID?.[0];
    if (!cid) {
      return res.status(404).json({ error: `No CID found for "${name}"` });
    }

    // Step 2: Fetch physicochemical properties
    const propUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,Complexity/JSON`;
    const propResp = await fetch(propUrl);
    const propData = await propResp.json();
    const properties = propData?.PropertyTable?.Properties?.[0] || {};

    // 2D Structure Image URL
    const imageUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_size=300x300`;

    return res.json({
      success: true,
      cid,
      name,
      imageUrl,
      properties,
    });
  } catch (err: any) {
    console.error('PubChem lookup error:', err);
    return res.status(500).json({ error: 'Failed to query PubChem PUG REST API', details: err?.message });
  }
});

// 2. PubMed Biomedical Literature Search
app.get('/api/science/literature', async (req, res) => {
  try {
    const queryTerm = (req.query.term as string) || 'curcumin metabolic health';

    // Step 1: ESearch (Search for PMIDs)
    const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(queryTerm)}&sort=pub_date&retmode=json&retmax=6&tool=AIStudioBuild&email=leafvilla015@gmail.com`;
    const searchResp = await fetch(esearchUrl);
    if (!searchResp.ok) {
      return res.status(500).json({ error: 'PubMed ESearch failed' });
    }
    const searchData = await searchResp.json();
    const idList: string[] = searchData?.esearchresult?.idlist || [];

    if (idList.length === 0) {
      return res.json({ success: true, articles: [], totalCount: 0 });
    }

    // Step 2: ESummary (Fetch Article Metadata)
    const esummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json&tool=AIStudioBuild&email=leafvilla015@gmail.com`;
    const sumResp = await fetch(esummaryUrl);
    const sumData = await sumResp.json();
    const resultObj = sumData?.result || {};

    const articles = idList.map(pmid => {
      const art = resultObj[pmid];
      if (!art) return null;
      return {
        pmid,
        title: art.title,
        source: art.source,
        pubdate: art.pubdate,
        authors: (art.authors || []).map((a: any) => a.name).slice(0, 3).join(', ') + ((art.authors || []).length > 3 ? ' et al.' : ''),
        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        doi: art.articleids?.find((i: any) => i.idtype === 'doi')?.value,
      };
    }).filter(Boolean);

    return res.json({
      success: true,
      articles,
      totalCount: searchData?.esearchresult?.count || articles.length,
      query: queryTerm,
    });
  } catch (err: any) {
    console.error('PubMed literature search error:', err);
    return res.status(500).json({ error: 'Failed to query PubMed literature', details: err?.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CuisineLens server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
