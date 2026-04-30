import { useState, useMemo } from "react";
import { 
  ArrowLeft, Search, Clock, Users, Flame, ShoppingCart, 
  Plus, Calendar, Mic, MicOff, Info, BookOpen, ChefHat, Utensils,
  Sparkles, X, CheckCircle2
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ALL_RECIPES, type Recipe } from "@/data/recipes";

export default function Recipes() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const addToCart = useAddToCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recipes] = useState(() => ALL_RECIPES); // Or call getRecipes() directly
  const [selectedRecipeForAnalysis, setSelectedRecipeForAnalysis] = useState<Recipe | null>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening...", { id: "voice-search" });
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      toast.success(`Searching for: ${transcript}`, { id: "voice-search" });
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      toast.error("Voice search error: " + event.error, { id: "voice-search" });
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, recipes]);

  const handleAddToCart = async (recipe: Recipe) => {
    setAdding(recipe.id + "-cart");
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

  const handleAddToMealPlan = (recipe: Recipe, selectedDate?: string) => {
    const today = new Date();
    const dateStr = selectedDate || [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
    
    const newPlan = {
      id: Date.now().toString(),
      recipeId: recipe.id,
      plannedDate: dateStr,
      recipeDetails: recipe
    };

    const existing = JSON.parse(localStorage.getItem("nexgro_meal_plans") || "[]");
    localStorage.setItem("nexgro_meal_plans", JSON.stringify([...existing, newPlan]));
    qc.invalidateQueries({ queryKey: ["meal-plans"] });
    toast.success(`"${recipe.title}" added to your Meal Plan for ${dateStr}! 📅`);
    navigate({ to: "/meal-planner" });
  };

  const firstSixRecipes = filteredRecipes.slice(0, 6);
  const remainingRecipes = filteredRecipes.slice(6);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Optimized Rectangular Banner */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-xl border-2 border-[#FFB800] bg-[#111]">
          <img 
            src="/assets/banner3.jpg" 
            alt="Chef's Corner Banner" 
            className="w-full h-auto block"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="shrink-0 w-14 h-14 bg-card border-2 border-border rounded-2xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-xl active:scale-95"
            title="Back to Home"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#FFB800] transition-colors" />
            <input
              type="text"
              placeholder="Search healthy recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border-2 border-border pl-14 pr-14 py-5 rounded-[2rem] text-sm font-bold shadow-xl focus:border-[#FFB800]/20 outline-none transition-all group-focus-within:ring-4 group-focus-within:ring-[#FFB800]/10"
            />
            <button
              onClick={startListening}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all",
                isListening ? "bg-destructive text-white animate-pulse" : "hover:bg-primary/10 text-primary"
              )}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Recipe Grid - First 6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {firstSixRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              adding={adding} 
              handleAddToCart={handleAddToCart} 
              handleAddToMealPlan={handleAddToMealPlan}
              onAnalyse={setSelectedRecipeForAnalysis}
            />
          ))}
        </div>

        {/* Moving Photos Section (Infinite Scroll Gallery) */}
        {filteredRecipes.length > 3 && (
          <div className="py-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Trending Now</h2>
              <div className="h-px flex-1 mx-6 bg-border" />
            </div>
            <div className="relative overflow-hidden group">
              <div className="flex gap-4 animate-marquee hover:pause-marquee py-2">
                {[...ALL_RECIPES, ...ALL_RECIPES].map((r, i) => (
                  <div key={`${r.id}-${i}`} className="w-64 h-44 rounded-3xl overflow-hidden shrink-0 shadow-lg border border-border group/img relative">
                    <img src={r.image} alt={r.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-xs font-black uppercase tracking-widest">{r.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Remaining Recipes */}
        {remainingRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
            {remainingRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                adding={adding} 
                handleAddToCart={handleAddToCart} 
                handleAddToMealPlan={handleAddToMealPlan}
                onAnalyse={setSelectedRecipeForAnalysis}
              />
            ))}
          </div>
        )}
      </div>
      {/* Recipe Analysis Modal */}
      {selectedRecipeForAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRecipeForAnalysis(null)}
          />
          <div className="relative bg-background w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl border border-border flex flex-col">
            {/* Modal Hero Header */}
            <div className="relative h-64 shrink-0">
              <img 
                src={selectedRecipeForAnalysis.image} 
                alt={selectedRecipeForAnalysis.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-6 left-8 right-8">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">AI Culinary Analysis</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                  {selectedRecipeForAnalysis.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedRecipeForAnalysis(null)}
                className="absolute top-6 right-6 p-3 bg-black/20 hover:bg-black/40 text-white backdrop-blur-md rounded-full transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="space-y-8 pb-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Required Products
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRecipeForAnalysis.ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm font-bold">{ing.name} ({ing.qty} unit)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                    <ChefHat className="w-4 h-4" /> Preparation Steps
                  </h3>
                  <div className="space-y-4">
                    {selectedRecipeForAnalysis.instructions.map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="shrink-0 w-8 h-8 bg-card border-2 border-border rounded-xl flex items-center justify-center text-xs font-black text-muted-foreground group-hover:border-primary group-hover:text-primary transition-all">
                          {i + 1}
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-foreground pt-1.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-muted/30 border-t border-border mt-auto">
              <button
                onClick={() => {
                  handleAddToCart(selectedRecipeForAnalysis);
                  setSelectedRecipeForAnalysis(null);
                }}
                className="w-full bg-[#007000] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add All to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .pause-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

function RecipeCard({ recipe, adding, handleAddToCart, handleAddToMealPlan, onAnalyse }: { 
  recipe: Recipe; 
  adding: string | null; 
  handleAddToCart: (r: Recipe) => void;
  handleAddToMealPlan: (r: Recipe, date?: string) => void;
  onAnalyse: (r: Recipe) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
      <div className="aspect-[4/3] relative overflow-hidden">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{recipe.category}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black text-xl text-foreground leading-tight tracking-tight">{recipe.title}</h3>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
            <Flame className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] font-black text-orange-700">{recipe.calories}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#007000]" />
            <span className="text-xs font-bold">{recipe.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#007000]" />
            <span className="text-xs font-bold">Serves {recipe.serves}</span>
          </div>
        </div>

        {/* Macro Preview */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <div className="bg-muted/50 p-2 rounded-xl text-center">
            <p className="text-[8px] font-black uppercase text-muted-foreground">Protein</p>
            <p className="text-xs font-black text-foreground">{recipe.protein}</p>
          </div>
          <div className="bg-muted/50 p-2 rounded-xl text-center">
            <p className="text-[8px] font-black uppercase text-muted-foreground">Fat</p>
            <p className="text-xs font-black text-foreground">{recipe.fat}</p>
          </div>
          <div className="bg-muted/50 p-2 rounded-xl text-center">
            <p className="text-[8px] font-black uppercase text-muted-foreground">Carbs</p>
            <p className="text-xs font-black text-foreground">{recipe.carbs}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => handleAddToMealPlan(recipe)}
            className="flex-1 bg-[#007000] text-white h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#007000]/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" /> Add to Meal Planner
          </button>
          <button
            onClick={() => onAnalyse(recipe)}
            className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white active:scale-95 transition-all border-2 border-primary/20"
            title="Analyse with AI"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <div className="relative group/cal">
            <button
              className="w-12 h-12 bg-white border-2 border-border text-foreground rounded-2xl flex items-center justify-center hover:border-[#007000] hover:text-[#007000] active:scale-95 transition-all"
              title="Plan for a Specific Date"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <input 
              type="date"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.value) handleAddToMealPlan(recipe, e.target.value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
