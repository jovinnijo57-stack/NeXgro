export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
export const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-1.5-flash";

export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
export const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "llama3-70b-8192";

export const isGeminiConfigured = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY.length > 5;
};

export const isGroqConfigured = () => {
  return GROQ_API_KEY && GROQ_API_KEY.length > 5;
};
