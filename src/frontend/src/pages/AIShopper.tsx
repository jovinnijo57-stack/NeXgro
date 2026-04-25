import { useState, useRef, useEffect } from "react";
import { Bot, Send, ArrowLeft, Sparkles, Utensils, Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SAMPLE_PRODUCTS } from "@/types";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  recommendations?: any[];
}

export default function AIShopper() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I'm your NeXgro Personal Shopper. I can suggest healthy recipes or products based on your goals. What are you looking for today? (e.g. 'Healthy breakfast', 'Low carb snacks')",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const addToCart = useAddToCart();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: AIMessage = { id: Date.now().toString(), sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simple keyword based AI logic
    setTimeout(() => {
      let reply = "That sounds great! Here are some fresh recommendations from our store that match your request:";
      let recs = SAMPLE_PRODUCTS.slice(0, 3);

      if (input.toLowerCase().includes("breakfast")) {
        recs = SAMPLE_PRODUCTS.filter(p => ["Milk", "Oats", "Fruits", "Bread"].some(k => p.name.includes(k)));
      } else if (input.toLowerCase().includes("healthy") || input.toLowerCase().includes("salad")) {
        recs = SAMPLE_PRODUCTS.filter(p => ["Tomato", "Avocado", "Organic", "Apple"].some(k => p.name.includes(k)));
      }

      const aiMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: reply,
        recommendations: recs,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  const handleAddAll = async (products: any[]) => {
    try {
      for (const p of products) {
        await addToCart.mutateAsync({ productId: p.id, qty: 1 });
      }
      toast.success("AI recommendations added to cart! 🛒");
    } catch {
      toast.error("Failed to add items.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border p-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate({ to: "/home" })} className="p-2 hover:bg-muted rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-foreground">AI Personal Shopper</h1>
            <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-black">NeXgro Intelligence v1.0</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex w-full", m.sender === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] space-y-3", m.sender === "user" ? "items-end text-right" : "items-start")}>
              <div className={cn("px-4 py-3 rounded-2xl text-sm shadow-sm", 
                m.sender === "user" ? "bg-primary text-white rounded-tr-none" : "bg-card border border-border text-foreground rounded-tl-none")}>
                {m.text}
              </div>
              
              {m.recommendations && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2">
                  {m.recommendations.map((p) => (
                    <div key={p.id} className="bg-card border border-border rounded-xl p-3 flex gap-3 items-center">
                      <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="text-[10px] text-primary font-black">${p.price.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => addToCart.mutateAsync({ productId: p.id, qty: 1 })}
                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => handleAddAll(m.recommendations!)}
                    className="col-span-full py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add All to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-background border-t border-border sticky bottom-0">
        <div className="max-w-4xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask for healthy recipes, low-carb options, etc..."
              className="w-full bg-muted border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none pr-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 text-muted-foreground">
              <Utensils className="w-4 h-4" />
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={handleSend}
            className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
