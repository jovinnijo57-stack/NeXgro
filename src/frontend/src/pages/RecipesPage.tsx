import { useState } from "react";
import { Clock, Users, Plus, ChevronRight, Utensils } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { SAMPLE_PRODUCTS } from "@/types";

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  time: string;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: { productId: string; name: string; qty: number; unit: string }[];
}

const RECIPES: Recipe[] = [
  {
    id: "r1",
    title: "Avocado Toast with Poached Egg",
    description: "A quick, healthy, and delicious breakfast to start your day right.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop",
    time: "15 min",
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      { productId: "p1", name: "Avocado", qty: 2, unit: "pcs" },
      { productId: "p5", name: "Eggs", qty: 2, unit: "pcs" },
      { productId: "p4", name: "Whole Wheat Bread", qty: 2, unit: "slices" },
    ]
  },
  {
    id: "r2",
    title: "Creamy Tomato Basil Pasta",
    description: "A rich and comforting pasta dish that is perfect for weeknight dinners.",
    image: "https://images.unsplash.com/photo-1621996311210-2a3c1f1f7d2a?q=80&w=800&auto=format&fit=crop",
    time: "30 min",
    servings: 4,
    difficulty: "Medium",
    ingredients: [
      { productId: "p2", name: "Fresh Tomatoes", qty: 5, unit: "pcs" },
      { productId: "p6", name: "Pasta", qty: 1, unit: "pack" },
      { productId: "p8", name: "Parmesan Cheese", qty: 1, unit: "block" },
    ]
  },
  {
    id: "r3",
    title: "Berry Banana Smoothie Bowl",
    description: "Packed with antioxidants and fresh fruits, this bowl is a summer favorite.",
    image: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?q=80&w=800&auto=format&fit=crop",
    time: "10 min",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      { productId: "p3", name: "Bananas", qty: 2, unit: "pcs" },
      { productId: "p10", name: "Mixed Berries", qty: 1, unit: "cup" },
      { productId: "p11", name: "Almond Milk", qty: 1, unit: "cup" },
    ]
  }
];

export default function RecipesPage() {
  const addToCart = useAddToCart();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleAddAll = (recipe: Recipe) => {
    // In a real app, we'd add all ingredients. For now, just show a success toast.
    toast.success(`Added ingredients for ${recipe.title} to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header section */}
      <div className="relative rounded-3xl overflow-hidden mb-8 p-8 sm:p-12" style={{ background: "linear-gradient(135deg, oklch(0.48 0.16 142) 0%, oklch(0.38 0.14 142) 100%)" }}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest px-3 py-1.5 rounded-full uppercase bg-white/20 mb-4">
              <Utensils className="w-4 h-4" /> INSPIRATION
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4">
              Cook with <span className="text-accent-foreground" style={{color: "oklch(0.85 0.15 33)"}}>NeXgro</span>
            </h1>
            <p className="text-white/80 max-w-lg text-lg">
              Discover delicious recipes and shop all the ingredients you need with a single click. Freshness delivered, flavor guaranteed.
            </p>
          </div>
          <div className="text-[6rem] opacity-20 select-none hidden md:block">
            👨‍🍳
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {["All", "Breakfast", "Lunch", "Dinner", "Smoothies", "Vegan"].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
              selectedCategory === cat 
                ? "bg-primary text-white shadow-md" 
                : "bg-muted text-foreground/70 hover:bg-muted/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RECIPES.map((recipe) => (
          <div key={recipe.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-elevated transition-shadow duration-300 flex flex-col">
            <div className="relative h-56 overflow-hidden">
              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                {recipe.difficulty}
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-display text-xl font-bold mb-2 text-foreground line-clamp-1">{recipe.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{recipe.description}</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-foreground/70 mb-5">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {recipe.time}</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {recipe.servings} serves</span>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Ingredients ({recipe.ingredients.length})</span>
                  <button className="text-primary text-xs font-semibold flex items-center hover:underline">
                    View list <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
                
                <button 
                  onClick={() => handleAddAll(recipe)}
                  className="w-full py-2.5 bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors duration-200 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{color: "oklch(0.58 0.21 33)"}}
                >
                  <Plus className="w-4 h-4" /> Add All to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
