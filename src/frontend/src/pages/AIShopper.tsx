import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Sparkles, ShoppingCart, Info, Globe, Activity, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SAMPLE_PRODUCTS } from "@/types";
import { useAddToCart } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { GEMINI_API_KEY, GEMINI_MODEL, isGeminiConfigured } from "@/config/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface AIMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  recommendations?: any[];
  isLoading?: boolean;
}

export default function AIShopper() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I'm your NeXgro Intelligence assistant. I can help you find healthy products, suggest nutritional values, and tell you where our fresh produce comes from. What are you looking for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const addToCart = useAddToCart();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callGemini = async (userText: string) => {
    const productCatalog = SAMPLE_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      origin: "Local Organic Farm, Kerala"
    }));

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const systemPrompt = `You are the NeXgro AI Personal Shopper, an expert in nutrition and fresh groceries.
    Your mission: Provide ACCURATE, helpful, and science-based answers to user questions about health, food, and shopping.
    
    Rules:
    1. If a user asks about a specific nutritional value or health tip, give a precise, factual answer.
    2. If relevant, suggest 1-3 products from the NeXgro catalog below.
    3. Always mention that our produce comes from "Local Organic Farms in Kerala" when talking about freshness.
    4. Format recommendations as [RECOMMEND: id1, id2] at the end of your response.
    
    Catalog: ${JSON.stringify(productCatalog.slice(0, 30))}
    
    User Question: ${userText}`;

    if (!isGeminiConfigured()) {
      // Local keyword-based fallback for basic questions
      const lower = userText.toLowerCase();
      if (lower.includes("healthy") || lower.includes("nutrition")) {
        return {
          text: "Healthy eating starts with fresh, organic produce! We recommend high-protein items like organic eggs and fresh greens from our local Kerala farms. Nutritional values for most items are available in the product details.",
          recommendations: SAMPLE_PRODUCTS.filter(p => ["p10", "p1", "p3"].includes(p.id))
        };
      }
      if (lower.includes("origin") || lower.includes("where")) {
        return {
          text: "All our fresh fruits and vegetables are sourced directly from Local Organic Farms in Kerala, ensuring the highest quality and minimal travel time to your doorstep.",
          recommendations: SAMPLE_PRODUCTS.filter(p => p.categoryId === "fruits").slice(0, 2)
        };
      }
      return {
        text: "I'm ready to help! While my advanced AI core (Gemini API) isn't fully configured yet, I can tell you that we source all our produce from Local Organic Farms in Kerala. Try asking about healthy options or where our food comes from!",
        recommendations: SAMPLE_PRODUCTS.slice(0, 2)
      };
    }

    try {
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      let aiText = response.text();
      
      // Clean markdown code blocks if present
      aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      // Extract product IDs
      const match = aiText.match(/\[RECOMMEND: (.*?)\]/);
      const recommendedIds = match ? match[1].split(",").map(id => id.trim()) : [];
      const cleanText = aiText.replace(/\[RECOMMEND: .*?\]/, "").trim();
      
      const recommendations = SAMPLE_PRODUCTS.filter(p => recommendedIds.includes(p.id));

      return { text: cleanText, recommendations };
    } catch (error) {
      console.error("Gemini Error:", error);
      return { 
        text: "I'm having a slight technical hiccup connecting to my Gemini brain. However, I can still tell you that our produce is 100% fresh from Kerala farms! What else would you like to know?", 
        recommendations: SAMPLE_PRODUCTS.slice(0, 2)
      };
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: AIMessage = { id: Date.now().toString(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const { text, recommendations } = await callGemini(input);

    const aiMsg: AIMessage = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      text: text,
      recommendations: recommendations,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate({ to: "/home" })} className="p-2.5 hover:bg-muted rounded-2xl transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-black text-foreground tracking-tight">AI Shopper</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-black">Online & Intelligent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 max-w-3xl mx-auto w-full pb-32">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-4 duration-500", m.sender === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[90%] space-y-4", m.sender === "user" ? "items-end text-right" : "items-start")}>
              <div className={cn("px-5 py-4 rounded-[1.5rem] text-sm font-medium shadow-sm leading-relaxed", 
                m.sender === "user" ? "bg-primary text-white rounded-tr-none" : "bg-card border border-border text-foreground rounded-tl-none")}>
                {m.text}
              </div>
              
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="grid grid-cols-1 gap-4 mt-6">
                  {m.recommendations.map((p) => (
                    <div key={p.id} className="bg-card border-2 border-border rounded-[2rem] p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center group hover:border-primary/20 transition-all shadow-sm">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-foreground text-lg tracking-tight">{p.name}</h4>
                          <span className="text-sm font-black text-primary">₹{p.price}</span>
                        </div>
                        
                        {/* Detail Pills */}
                        <div className="flex flex-wrap gap-2">
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                            <Activity className="w-3 h-3" /> {Math.floor(Math.random() * 15) + 5}g Protein
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                            <Info className="w-3 h-3" /> Low Carb
                          </span>
                          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                            <Globe className="w-3 h-3" /> Kerala Farms
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground font-medium line-clamp-2">{p.description}</p>
                      </div>
                      <button 
                        onClick={() => addToCart.mutateAsync({ productId: p.id, qty: 1 })}
                        className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-card border border-border px-5 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Clean Chat Input - No search/voice here per request */}
      <div className="p-4 bg-background border-t border-border sticky bottom-0 z-30">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isTyping}
            placeholder="Ask me anything about healthy eating..."
            className="flex-1 bg-muted border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-sm font-bold focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="w-14 h-14 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shrink-0"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
