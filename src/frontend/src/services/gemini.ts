import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../config/ai";
import { STATIC_RECIPES } from "./recipeData";

export async function analyzeRecipe(recipeTitle: string, ingredients: any[]) {
  // Check for static recipe data first
  const normalizedTitle = recipeTitle.toUpperCase().trim();
  if (STATIC_RECIPES[normalizedTitle]) {
    console.log("Using static data for:", normalizedTitle);
    return STATIC_RECIPES[normalizedTitle];
  }

  if (!GEMINI_API_KEY) {
    console.warn("Gemini API Key missing. Returning default analysis.");
    return {
      water: "2-3 cups (approx.)",
      time: "25-30 minutes",
      steps: [
        "Prepare all ingredients as listed.",
        "Ensure water ratio is correct (usually 2:1 for grains).",
        "Cook on medium heat for optimal texture.",
        "Garnish and serve hot."
      ]
    };
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Analyze this recipe: "${recipeTitle}". 
  Ingredients provided: ${JSON.stringify(ingredients)}.
  
  Please provide a professional culinary analysis:
  1. Estimated water needed for cooking (e.g., "2 cups", "500ml").
  2. Total cooking time (e.g., "35 minutes").
  3. 4-6 concise, step-by-step cooking instructions. IMPORTANT: Include the specific quantities of ingredients in the steps (e.g., "Add 200g of Paneer...").
  
  Return ONLY a valid JSON object with these keys: "water", "time", "steps" (an array of strings).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown code blocks if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // Find the first { and last }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonStr = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonStr);
    }
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini analysis failed:", error);
    // Return null so the UI can show an error toast
    return null;
  }
}
