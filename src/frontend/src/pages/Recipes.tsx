import { useState, useMemo } from "react";
import { 
  ArrowLeft, Search, Clock, Users, Flame, ShoppingCart, 
  Plus, Calendar, Mic, MicOff, Info, BookOpen
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface Recipe {
  id: string;
  title: string;
  category: string;
  time: string;
  serves: number;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  image: string;
  ingredients: { id: string; name: string; qty: number }[];
  instructions: string[];
}

const ALL_RECIPES: Recipe[] = [
  {
    id: "r1",
    title: "Fresh Avocado Toast with Organic Tomatoes",
    category: "Breakfast",
    time: "15 min",
    serves: 2,
    calories: "320 kcal",
    protein: "12g",
    fat: "22g",
    carbs: "28g",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
    ingredients: [
      { id: "p2", name: "Organic Hass Avocado", qty: 2 },
      { id: "p1", name: "Fresh Organic Tomatoes", qty: 1 },
      { id: "p6", name: "Sourdough Loaf", qty: 1 },
    ],
    instructions: ["Toast the sourdough slices until golden.", "Mash avocados with salt, pepper, and lemon juice.", "Spread generously and top with sliced tomatoes."]
  },
  {
    id: "r2",
    title: "Classic Sourdough French Toast",
    category: "Breakfast",
    time: "25 min",
    serves: 4,
    calories: "450 kcal",
    protein: "18g",
    fat: "14g",
    carbs: "62g",
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=800",
    ingredients: [
      { id: "p4", name: "Whole Milk 1L", qty: 1 },
      { id: "p6", name: "Sourdough Loaf", qty: 1 },
      { id: "p8", name: "Orange Juice 1L", qty: 1 },
    ],
    instructions: ["Whisk milk, eggs, and cinnamon in a bowl.", "Soak sourdough slices for 1 minute per side.", "Fry on a buttered griddle until golden and crisp."]
  },
  {
    id: "r3",
    title: "Mediterranean Quinoa Bowl",
    category: "Lunch",
    time: "20 min",
    serves: 2,
    calories: "380 kcal",
    protein: "14g",
    fat: "16g",
    carbs: "45g",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    ingredients: [
      { id: "p1", name: "Cherry Tomatoes", qty: 1 },
      { id: "p2", name: "Cucumber", qty: 1 },
      { id: "p3", name: "Quinoa Pack", qty: 1 },
    ],
    instructions: ["Cook quinoa according to package instructions.", "Chop vegetables into bite-sized pieces.", "Toss with olive oil and lemon dressing."]
  }
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RecipesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const addToCart = useAddToCart();
  const [adding, setAdding] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<Record<string, number>>({});

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setSearchQuery(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const filteredRecipes = useMemo(() => {
    return ALL_RECIPES.filter(recipe => 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleAddToMealPlan = async (recipe: Recipe) => {
    const dayIndex = selectedDays[recipe.id] ?? 0;
    setAdding(recipe.id);
    try {
      const plannedDate = new Date();
      plannedDate.setDate(24 + dayIndex); 
      const dateStr = plannedDate.toISOString().split("T")[0];

      const existing = JSON.parse(localStorage.getItem("nexgro_meal_plans") || "[]");
      const newPlan = {
        id: `mp-${Date.now()}`,
        recipeId: recipe.id,
        plannedDate: dateStr,
        servings: recipe.serves,
        recipeDetails: recipe 
      };
      localStorage.setItem("nexgro_meal_plans", JSON.stringify([...existing, newPlan]));
      
      qc.invalidateQueries({ queryKey: ["meal-plans"] });
      toast.success(`"${recipe.title}" added to ${DAYS[dayIndex]}'s Plan! 📅`);
    } catch {
      toast.error("Failed to add to meal planner.");
    } finally {
      setAdding(null);
    }
  };

  const handleAddToCart = async (recipe: Recipe) => {
    setAdding(recipe.id);
    try {
      for (const ing of recipe.ingredients) {
        await addToCart.mutateAsync({ productId: ing.id, qty: ing.qty });
      }
      toast.success(`Ingredients for "${recipe.title}" added to cart! 🛒`);
    } catch {
      toast.error("Failed to add ingredients.");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Premium Hero Banner */}
      <div className="relative h-64 sm:h-80 bg-black overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
          alt="Chef's Corner"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Premium Kitchen 🌟</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-700">
            Chef's Corner
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-lg font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Discover artisanal recipes and plan your weekly nutrition with surgical precision.
          </p>
        </div>
      </div>

      {/* Professional Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search recipes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 border-2 border-transparent rounded-2xl pl-12 pr-12 py-3 text-sm font-bold focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
            <button
              onClick={startListening}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                isListening ? "bg-destructive text-white animate-pulse" : "hover:bg-primary/10 text-primary"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button 
            onClick={() => navigate({ to: "/meal-planner" })}
            className="hidden sm:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-wider hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            Plan Week
          </button>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="group bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex gap-2 mb-3">
                    <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                      {recipe.category}
                    </span>
                    <span className="bg-primary px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                      {recipe.calories}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight tracking-tight">
                    {recipe.title}
                  </h3>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-border">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Protein</p>
                      <p className="text-base font-black text-primary">{recipe.protein}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Fat</p>
                      <p className="text-base font-black text-foreground">{recipe.fat}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground bg-muted px-4 py-2 rounded-2xl">
                    <Users className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Serves {recipe.serves}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="w-4 h-4 text-primary" />
                    <p className="text-[11px] font-bold uppercase tracking-widest">Select Day for Plan</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedDays[recipe.id] ?? 0}
                      onChange={(e) => setSelectedDays(prev => ({ ...prev, [recipe.id]: parseInt(e.target.value) }))}
                      className="flex-1 bg-muted border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      {DAYS.map((day, i) => (
                        <option key={day} value={i}>{day} (April {24 + i})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAddToMealPlan(recipe)}
                    disabled={adding === recipe.id}
                    className="flex-[1.5] bg-primary text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Recipe
                  </button>
                  <button
                    onClick={() => handleAddToCart(recipe)}
                    disabled={adding === recipe.id}
                    className="flex-1 bg-muted text-foreground py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-muted/80 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    Ingredients
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
