import { useState } from "react";
import { ArrowLeft, Calendar, Package, RefreshCw, Zap, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SAMPLE_PRODUCTS } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SUBSCRIPTION_PLANS = [
  {
    id: "s1",
    name: "Weekly Essentials",
    desc: "Milk, Bread, and Eggs delivered every Monday morning.",
    price: 24.99,
    interval: "Weekly",
    items: ["Whole Milk 1L", "Sourdough Loaf", "Fresh Organic Eggs"],
    color: "bg-blue-500",
    icon: Clock
  },
  {
    id: "s2",
    name: "Fresh Produce Box",
    desc: "A curated selection of 5 organic fruits and veggies.",
    price: 39.99,
    interval: "Weekly",
    items: ["Avocados", "Tomatoes", "Apples", "Bananas", "Spinach"],
    color: "bg-emerald-500",
    icon: Zap
  },
  {
    id: "s3",
    name: "Premium Pantry",
    desc: "Gourmet nuts, coffee, and artisanal snacks every month.",
    price: 59.99,
    interval: "Monthly",
    items: ["Mixed Nuts", "Coffee Beans", "Artisanal Crackers", "Honey"],
    color: "bg-amber-500",
    icon: Package
  }
];

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState<string | null>(null);

  const handleSubscribe = (name: string) => {
    toast.success(`Subscription for "${name}" activated! 🚀`);
    setActivePlan(name);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary p-12 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <RefreshCw className="w-96 h-96 absolute -top-20 -right-20 animate-spin-slow" />
        </div>
        <div className="relative z-10 space-y-3">
          <h1 className="font-display text-4xl font-black tracking-tight italic">Smart Subscriptions</h1>
          <p className="text-white/80 max-w-md mx-auto text-sm leading-relaxed">
            Never run out of essentials. Save up to 20% by subscribing to our curated boxes.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20 space-y-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div key={plan.id} className="group bg-card border border-border rounded-3xl p-6 shadow-card hover:shadow-elevated transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white", plan.color)}>
              <plan.icon className="w-8 h-8" />
            </div>
            
            <div className="flex-1 space-y-1">
              <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                {plan.name}
                {activePlan === plan.name && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{plan.desc}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {plan.items.map(item => (
                  <span key={item} className="px-2.5 py-1 bg-muted rounded-lg text-[10px] font-bold text-muted-foreground border border-border">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col items-end gap-3 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-black text-foreground">${plan.price.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Per {plan.interval}</p>
              </div>
              <button 
                onClick={() => handleSubscribe(plan.name)}
                className={cn(
                  "px-8 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap",
                  activePlan === plan.name 
                    ? "bg-emerald-500 text-white shadow-emerald-200" 
                    : "bg-primary text-white hover:bg-primary/90 shadow-primary/25"
                )}
              >
                {activePlan === plan.name ? "Plan Active" : "Subscribe Now"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12 text-center space-y-6">
        <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Choose Box", desc: "Select a plan that fits your household's needs." },
            { step: "02", title: "Set Schedule", desc: "Decide when you want your delivery (Monday or Thursday)." },
            { step: "03", title: "Relax", desc: "Essentials are auto-added to your cart and delivered." }
          ].map(s => (
            <div key={s.step} className="p-6 bg-card border border-border rounded-2xl space-y-2">
              <p className="text-3xl font-black text-primary/20">{s.step}</p>
              <p className="font-bold text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
