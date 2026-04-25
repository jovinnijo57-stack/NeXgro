import { useState, useEffect } from "react";
import { ArrowLeft, Bell, RefreshCw, ShoppingCart, Zap, AlertTriangle, CheckCircle, History } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SAMPLE_PRODUCTS } from "@/types";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PANTRY_ITEMS = [
  { id: "p1", name: "Fresh Organic Tomatoes", lastBought: "3 days ago", status: "Running Low", refillFreq: "Weekly", stock: 20 },
  { id: "p4", name: "Whole Milk 1L", lastBought: "2 days ago", status: "Critical", refillFreq: "Daily", stock: 5 },
  { id: "p6", name: "Sourdough Loaf", lastBought: "5 days ago", status: "Running Low", refillFreq: "Weekly", stock: 15 },
  { id: "p9", name: "Avocados", lastBought: "1 day ago", status: "Safe", refillFreq: "Weekly", stock: 85 }
];

export default function SmartPantry() {
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    // Simulate a phone-like notification
    const timer = setTimeout(() => {
      if (!notified) {
        toast("Smart Pantry Alert", {
          description: "Your Whole Milk is almost empty! Refill now?",
          action: {
            label: "Refill",
            onClick: () => handleRefill("p4")
          }
        });
        setNotified(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [notified]);

  const handleRefill = async (id: string) => {
    const p = SAMPLE_PRODUCTS.find(x => x.id === id);
    if (p) {
      await addToCart.mutateAsync({ productId: id, qty: 1 });
      toast.success(`${p.name} added to cart!`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-amber-500 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Bell className="w-48 h-48 rotate-12" />
        </div>
        <div className="relative z-10">
          <button onClick={() => navigate({ to: "/home" })} className="p-2 bg-white/20 rounded-xl mb-4">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-3xl font-black italic">Smart Pantry</h1>
          <p className="text-white/80 text-sm max-w-xs">We track your essentials so you never run out. Phone notifications will alert you when stock is low.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-20 space-y-4">
        {PANTRY_ITEMS.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-3xl p-5 shadow-card flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
              item.status === "Critical" ? "bg-destructive/10 text-destructive" : item.status === "Running Low" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-600"
            )}>
              {item.status === "Safe" ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate">{item.name}</h3>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black mt-1">
                <span className={cn(
                  item.status === "Critical" ? "text-destructive" : item.status === "Running Low" ? "text-amber-500" : "text-emerald-600"
                )}>
                  {item.status}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">Bought {item.lastBought}</span>
              </div>
              <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", 
                    item.status === "Critical" ? "bg-destructive w-[5%]" : item.status === "Running Low" ? "bg-amber-500 w-[20%]" : "bg-emerald-500 w-[85%]"
                  )} 
                />
              </div>
            </div>

            <button 
              onClick={() => handleRefill(item.id)}
              className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        ))}

        <div className="p-8 text-center space-y-4 bg-muted/30 rounded-3xl border border-dashed border-border mt-8">
          <History className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
          <div>
            <h4 className="font-bold text-foreground">Usage Prediction</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">Our AI learns your consumption patterns to send "Refill" alerts exactly when you need them.</p>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1">View Full Analytics</button>
        </div>
      </div>
    </div>
  );
}
