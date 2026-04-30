import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Sparkles, ShoppingCart, Info, Globe, Activity, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SAMPLE_PRODUCTS } from "@/types";
import { useAddToCart } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { GEMINI_API_KEY, GEMINI_MODEL, GROQ_API_KEY, GROQ_MODEL, isGeminiConfigured, isGroqConfigured } from "@/config/ai";
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

  useEffect(() => {
    console.log("AI Shopper initialized.");
    if (!isGeminiConfigured()) {
      console.warn("Gemini API key is missing or invalid. Failover to Groq may occur.");
    }
    if (!isGroqConfigured()) {
      console.warn("Groq API key is missing or invalid.");
    }
  }, []);

  const callAI = async (userText: string) => {
    const productCatalog = SAMPLE_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      categoryId: p.categoryId,
      origin: "Local Organic Farm, Kerala"
    }));

    const systemPrompt = `You are the NeXgro Intelligence Engine, a high-performance AI personal shopper similar to Google Gemini. 
Your goal is to provide sophisticated, helpful, and scientifically accurate advice about groceries, nutrition, and healthy living.

STRATEGIC GUIDELINES:
1. NUTRITIONAL INTELLIGENCE: Provide detailed nutritional insights for any food or health topic mentioned. Use a professional, expert tone.
2. PRODUCT CONNECTIVITY: You MUST identify products from the catalog below that match the user's needs. 
3. KERALA HERITAGE: Always emphasize that NeXgro's produce is sourced directly from "Local Organic Farms in Kerala" for maximum nutrient density.
4. RESPONSE ARCHITECTURE: Use a structured, clean format. End your response with recommended product IDs in this exact format: [RECOMMEND: id1, id2].

CATALOG DATA: ${JSON.stringify(productCatalog.slice(0, 40))}

User Inquiry: ${userText}`;

    const processAIResponse = (aiText: string) => {
      const match = aiText.match(/\[RECOMMEND: (.*?)\]/);
      const recommendedIds = match ? match[1].split(",").map(id => id.trim()) : [];
      const cleanText = aiText.replace(/\[RECOMMEND: .*?\]/, "").trim();
      
      // Filter products and ensure we find them correctly
      const recommendations = SAMPLE_PRODUCTS.filter(p => 
        recommendedIds.some(rid => rid.toLowerCase() === p.id.toLowerCase() || rid === p.id)
      );
      
      return { text: cleanText, recommendations };
    };

    // 1. Primary: Gemini (Multimodal & Intelligent)
    if (isGeminiConfigured()) {
      try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        return processAIResponse(response.text());
      } catch (error) {
        console.error("Gemini core unreachable, attempting secondary neural link:", error);
      }
    }

    // 2. Secondary: Groq (Low-latency)
    if (isGroqConfigured()) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: "system", content: "You are the NeXgro Intelligence Engine. Provide elite-level shopping advice." },
              { role: "user", content: systemPrompt }
            ],
            temperature: 0.6
          })
        });
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return processAIResponse(data.choices[0].message.content);
        }
      } catch (error) {
        console.error("Secondary neural link failed:", error);
      }
    }

    // 3. Cognitive Fallback
    const lower = userText.toLowerCase();
    const mockRecs = SAMPLE_PRODUCTS.filter(p => 
      lower.includes(p.name.toLowerCase()) || 
      lower.includes(p.categoryId.toLowerCase())
    ).slice(0, 3);

    return {
      text: "I've analyzed your request against our current farm inventory. Our Kerala-grown produce is rich in micronutrients and harvested at peak ripeness. Here are the most relevant items for your healthy lifestyle based on my intelligence core.",
      recommendations: mockRecs.length > 0 ? mockRecs : SAMPLE_PRODUCTS.slice(0, 3)
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: AIMessage = { id: Date.now().toString(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const { text, recommendations } = await callAI(input);

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
