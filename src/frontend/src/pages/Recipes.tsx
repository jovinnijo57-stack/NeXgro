import { useState } from "react";
import { ArrowLeft, Clock, Users, Flame, Calendar, CheckCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SAMPLE_PRODUCTS } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ALL_RECIPES = [
  {
    id: "r1",
    title: "Fresh Avocado Toast with Organic Tomatoes",
    time: "15 min",
    serves: 2,
    calories: "320 kcal",
    protein: "8g",
    fat: "12g",
    carbs: "25g",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
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
    title: "Classic Sourdough French Toast",
    time: "25 min",
    serves: 4,
    calories: "450 kcal",
    protein: "12g",
    fat: "15g",
    carbs: "55g",
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=800",
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

export default function RecipesPage() {
  const navigate = useNavigate();
  const [adding, setAdding] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<Record<string, number>>({});

  const handleAddToMealPlan = async (recipe: typeof ALL_RECIPES[0]) => {
    const dayIndex = selectedDays[recipe.id] ?? 0;
    setAdding(recipe.id);
    
    try {
      // Create a date for the selected day (assuming week starts April 24 as in existing logic)
      const plannedDate = new Date();
      plannedDate.setDate(24 + dayIndex); 
      const dateStr = plannedDate.toISOString().split("T")[0];

      const existing = JSON.parse(localStorage.getItem("nexgro_meal_plans") || "[]");
      const newPlan = {
        id: `mp-${Date.now()}`,
        recipeId: recipe.id,
        plannedDate: dateStr,
        servings: recipe.serves
      };
      
      localStorage.setItem("nexgro_meal_plans", JSON.stringify([...existing, newPlan]));
      
      toast.success(`"${recipe.title}" added to ${DAYS[dayIndex]}'s Plan! 📅`);
    } catch (error) {
      toast.error("Failed to add to meal planner.");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Professional Hero Section */}
      <div className="relative h-64 bg-black overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80" 
          alt="Chef's Corner" 
          className="w-full h-full object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <button 
            onClick={() => navigate({ to: "/home" })} 
            className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Chef's Corner</h1>
          <p className="text-white/70 text-sm max-w-xs">Discover premium recipes and plan your wellness journey.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ALL_RECIPES.map((recipe) => (
            <div key={recipe.id} className="group bg-card border border-border rounded-[2rem] overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
              <div className="relative h-64 overflow-hidden">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                      <Clock className="w-3 h-3" /> {recipe.time}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                      <Flame className="w-3 h-3" /> {recipe.calories}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white leading-tight">{recipe.title}</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-primary text-[10px]">Protein</span>
                    <span className="text-foreground">{recipe.protein}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-orange-500 text-[10px]">Fat</span>
                    <span className="text-foreground">{recipe.fat}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-blue-500 text-[10px]">Carbs</span>
                    <span className="text-foreground">{recipe.carbs}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-[10px]">Serves</span>
                    <span className="text-foreground">{recipe.serves}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Select Ingredients</p>
                    <p className="text-[10px] font-bold text-primary">All selected by default</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {recipe.ingredients.map((ing) => (
                      <div key={ing.id} className="flex items-center gap-3 bg-muted/50 p-2.5 rounded-xl border border-border/50">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs font-bold text-foreground/80">{ing.qty}x {ing.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plan for Day</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {DAYS.map((day, i) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDays(prev => ({ ...prev, [recipe.id]: i }))}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                          (selectedDays[recipe.id] ?? 0) === i
                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToMealPlan(recipe)}
                  disabled={adding === recipe.id}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95",
                    adding === recipe.id 
                      ? "bg-muted text-muted-foreground cursor-not-allowed" 
                      : "bg-primary text-white hover:opacity-90 shadow-primary/25"
                  )}
                >
                  {adding === recipe.id ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Add to Meal Planner
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
