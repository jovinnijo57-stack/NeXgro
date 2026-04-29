import { useCategories } from "@/hooks/useBackend";
import { SAMPLE_CATEGORIES } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Grid3X3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const CAT_COLORS: Record<string, string> = {
  fruits: "from-emerald-400 to-teal-600",
  vegetables: "from-green-400 to-emerald-600",
  dairy: "from-blue-400 to-indigo-600",
  bakery: "from-amber-400 to-orange-600",
  pantry: "from-orange-400 to-red-600",
  snacks: "from-purple-400 to-fuchsia-600",
  beverages: "from-cyan-400 to-blue-600",
  meat: "from-red-400 to-rose-600",
};

export default function Categories() {
  const navigate = useNavigate();
  const { data: backendCats, isLoading } = useCategories();
  const cats = backendCats && backendCats.length > 0 ? backendCats : SAMPLE_CATEGORIES;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 px-4 py-4 shadow-sm backdrop-blur-md bg-card/80">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate({ to: "/home" })}
            className="p-2 hover:bg-muted rounded-xl transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-primary" />
              All Categories
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
              Browse by Department
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cats.map((cat, i) => (
            <Link
              key={cat.id}
              to="/categories/$categoryId"
              params={{ categoryId: cat.id }}
              className="group relative overflow-hidden rounded-[2rem] bg-card border-2 border-border p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${CAT_COLORS[cat.id] || "from-primary/20 to-primary/40"} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${CAT_COLORS[cat.id] || "from-primary/10 to-primary/20"} flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    {cat.iconEmoji}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Fresh Daily
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              {/* Decorative background text */}
              <span className="absolute -bottom-4 -right-4 text-6xl font-black text-foreground/[0.03] select-none uppercase tracking-tighter">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
