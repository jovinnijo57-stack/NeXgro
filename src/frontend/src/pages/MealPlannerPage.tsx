import { useMealPlans, useAddToCart } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
  Flame,
  ChefHat,
  Info
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Shared with Recipes.tsx usually, but kept local for simplicity here
const ALL_RECIPES = [
  {
    id: "r1",
    name: "Fresh Avocado Toast with Organic Tomatoes",
    time: "15 min",
    serves: 2,
    calories: "320 kcal",
    protein: "8g",
    fat: "12g",
    carbs: "25g",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
    ingredients: [
      { id: "p2", name: "Organic Hass Avocado", qty: 2 },
      { id: "p1", name: "Fresh Organic Tomatoes", qty: 1 },
      { id: "p6", name: "Sourdough Loaf", qty: 1 },
    ],
    instructions: [
      "Toast the sourdough slices until golden brown.",
      "Mash avocados in a bowl with salt, pepper, and a squeeze of lime.",
      "Spread the avocado mixture evenly onto the toast.",
      "Top with thinly sliced organic tomatoes and a drizzle of olive oil."
    ]
  },
  {
    id: "r2",
    name: "Classic Sourdough French Toast",
    time: "25 min",
    serves: 4,
    calories: "450 kcal",
    protein: "12g",
    fat: "15g",
    carbs: "55g",
    imageUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=800",
    ingredients: [
      { id: "p4", name: "Whole Milk 1L", qty: 1 },
      { id: "p6", name: "Sourdough Loaf", qty: 1 },
      { id: "p8", name: "Orange Juice 1L", qty: 1 },
    ],
    instructions: [
      "In a wide bowl, whisk together milk, eggs, cinnamon, and vanilla extract.",
      "Dip sourdough slices into the mixture, letting them soak for 30 seconds on each side.",
      "Melt butter in a large skillet over medium heat.",
      "Fry the soaked slices until golden brown and crispy on both sides.",
      "Serve warm with maple syrup and fresh berries."
    ]
  }
];

export default function MealPlannerPage() {
  const navigate = useNavigate();
  const { data: mealPlans } = useMealPlans();
  const addToCart = useAddToCart();
  const [selectedDay, setSelectedDay] = useState(0);
  const [adding, setAdding] = useState<string | null>(null);

  const handleCookThis = async (recipe: typeof ALL_RECIPES[0]) => {
    setAdding(recipe.id);
    try {
      for (const ing of recipe.ingredients) {
        await addToCart.mutateAsync({ productId: ing.id, qty: ing.qty });
      }
      toast.success(`All ingredients for "${recipe.name}" added to cart! 🛒`);
    } catch {
      toast.error("Failed to add ingredients to cart.");
    } finally {
      setAdding(null);
    }
  };

  const currentDayStr = useMemo(() => {
    const dayDate = new Date();
    dayDate.setDate(24 + selectedDay); // Match existing logic
    return dayDate.toISOString().split("T")[0];
  }, [selectedDay]);

  const filteredPlans = useMemo(() => {
    return mealPlans?.filter(mp => mp.plannedDate === currentDayStr);
  }, [mealPlans, currentDayStr]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/home" })}
              className="p-2 rounded-2xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Meal Planner</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Health & Wellness</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Day Selector */}
        <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="font-black text-foreground text-sm uppercase tracking-wider">April 24 – April 30</h2>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-xl hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-xl hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day, i) => (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  "flex flex-col items-center py-3 rounded-2xl transition-all",
                  selectedDay === i 
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <span className="text-[8px] font-black uppercase tracking-widest">{day}</span>
                <span className="text-sm font-black mt-1">{24 + i}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Plan List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-lg text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {DAYS[selectedDay]}'s Menu
            </h3>
            <Link
              to="/recipes"
              className="p-2 bg-primary/10 rounded-xl text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>

          {(!filteredPlans || filteredPlans.length === 0) ? (
            <div className="py-20 text-center space-y-4 bg-muted/30 rounded-[2.5rem] border border-dashed border-border">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ChefHat className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground/50">Nothing planned yet</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tap + to browse recipes</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPlans.map((mp) => {
                const recipe = ALL_RECIPES.find(r => r.id === mp.recipeId);
                if (!recipe) return null;
                return (
                  <div key={mp.id} className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={recipe.imageUrl} 
                        className="w-full h-full object-cover" 
                        alt={recipe.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-3 mb-1">
                           <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                            <Flame className="w-3 h-3 text-orange-400" /> {recipe.calories}
                          </span>
                        </div>
                        <h4 className="font-black text-white text-xl">{recipe.name}</h4>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Nutrition Info */}
                      <div className="grid grid-cols-3 gap-4 border-b border-border pb-6">
                        <div className="text-center p-3 bg-muted/50 rounded-2xl border border-border/50">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Protein</p>
                          <p className="text-sm font-black text-primary">{recipe.protein}</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-2xl border border-border/50">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Fat</p>
                          <p className="text-sm font-black text-orange-500">{recipe.fat}</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-2xl border border-border/50">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Carbs</p>
                          <p className="text-sm font-black text-blue-500">{recipe.carbs}</p>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Info className="w-3 h-3 text-primary" /> Cooking Instructions
                        </h5>
                        <div className="space-y-3">
                          {recipe.instructions.map((step, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                              <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs font-bold text-foreground/70 leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCookThis(recipe)}
                        disabled={adding === recipe.id}
                        className={cn(
                          "w-full py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95",
                          adding === recipe.id 
                            ? "bg-muted text-muted-foreground cursor-not-allowed" 
                            : "bg-primary text-white hover:opacity-90 shadow-primary/25"
                        )}
                      >
                        {adding === recipe.id ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Cook this: Add Ingredients to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
