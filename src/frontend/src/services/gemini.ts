import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export async function analyzeRecipe(recipeTitle: string, ingredients: any[]) {
  if (!API_KEY) {
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

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Analyze this recipe: "${recipeTitle}". 
  Ingredients: ${JSON.stringify(ingredients)}.
  Please provide:
  1. Estimated water needed (in cups).
  2. Total cooking time.
  3. 4-5 concise, step-by-step cooking instructions with quantities.
  Return ONLY a JSON object with keys: "water", "time", "steps" (array).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Extract JSON from response if needed
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
}
