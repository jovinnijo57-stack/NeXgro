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
import { motion, AnimatePresence } from "motion/react";

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

  const handleAddToMealPlan = (recipe: Recipe) => {
    const today = new Date();
    const dateStr = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
    
    const newPlan = {
      id: Date.now().toString(),
      recipeId: recipe.id,
      plannedDate: dateStr,
      recipeDetails: recipe
    };

    const existing = JSON.parse(localStorage.getItem("nexgro_meal_plans") || "[]");
    localStorage.setItem("nexgro_meal_plans", JSON.stringify([...existing, newPlan]));
    qc.invalidateQueries({ queryKey: ["meal-plans"] });
    toast.success(`"${recipe.title}" added to your Meal Plan for today! 📅`);
    navigate({ to: "/meal-planner" });
  };

  const firstSixRecipes = filteredRecipes.slice(0, 6);
  const remainingRecipes = filteredRecipes.slice(6);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-8">
        {/* Navigation & Search Row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="shrink-0 w-12 h-12 md:w-14 md:h-14 bg-card border-2 border-border rounded-2xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-xl active:scale-95"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="flex-1 relative group">
            <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-focus-within:text-[#FFB800] transition-colors" />
            <input
              type="text"
              placeholder="Search healthy recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border-2 border-border pl-12 md:pl-14 pr-12 md:pr-14 py-4 md:py-5 rounded-2xl md:rounded-[2rem] text-xs md:text-sm font-bold shadow-xl focus:border-[#FFB800]/20 outline-none transition-all group-focus-within:ring-4 group-focus-within:ring-[#FFB800]/10"
            />
            <button
              onClick={startListening}
              className={cn(
                "absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-xl md:rounded-2xl transition-all",
                isListening ? "bg-destructive text-white animate-pulse" : "hover:bg-primary/10 text-primary"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4 md:w-5 md:h-5" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
          </div>
        </div>

        {/* Clean Rectangular Banner (No Border) */}
        <div className="w-full relative rounded-[2rem] overflow-hidden shadow-2xl">
          <img 
            src="/assets/banner3.jpg" 
            alt="Chef's Corner Banner" 
            className="w-full h-auto object-cover min-h-[160px]"
          />
          {/* Mobile Overlay for better text visibility if any */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none md:hidden" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 space-y-12">

        {/* Recipe Grid - First 6 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {firstSixRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              adding={adding} 
              handleAddToCart={handleAddToCart} 
              handleAddToMealPlan={handleAddToMealPlan} 
              onAnalyse={() => setSelectedRecipeForAnalysis(recipe)}
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
                onAnalyse={() => setSelectedRecipeForAnalysis(recipe)}
              />
            ))}
          </div>
        )}
      </div>

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

      {/* Recipe Analysis Modal */}
      <AnimatePresence>
        {selectedRecipeForAnalysis && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedRecipeForAnalysis(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-background w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-[0_0_100px_rgba(0,112,0,0.15)] border border-primary/20 flex flex-col"
            >
              <div className="p-8 overflow-y-auto">
                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center relative z-10 overflow-hidden group">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
                      </div>
                      <div className="absolute -inset-1 bg-primary/30 blur-xl rounded-full opacity-50 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-md">Smart Analysis</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                        AI <span className="text-primary">Insights</span>
                      </h2>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedRecipeForAnalysis(null)}
                    className="p-3 hover:bg-muted rounded-2xl transition-all border border-border"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-10 pb-8">
                  {/* Recipe Header in Modal */}
                  <div className="bg-muted/30 rounded-[2rem] p-6 border border-border/50 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-primary/20">
                      <img src={selectedRecipeForAnalysis.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-black text-foreground leading-none">{selectedRecipeForAnalysis.title}</h3>
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10 text-primary">
                          <Clock className="w-3.5 h-3.5" /> {selectedRecipeForAnalysis.time}
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full border border-border">
                          <Users className="w-3.5 h-3.5" /> {selectedRecipeForAnalysis.serves} Servings
                        </div>
                        <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 text-orange-600">
                          <Flame className="w-3.5 h-3.5" /> {selectedRecipeForAnalysis.calories}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-5 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" /> Recommended Products
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedRecipeForAnalysis.ingredients.map((ing, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + (i * 0.05) }}
                          key={i} 
                          className="flex items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-sm group hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <CheckCircle2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-sm font-bold text-foreground">{ing.name}</span>
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground px-2 py-1 bg-muted rounded-lg">{ing.qty} unit</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-5 flex items-center gap-2">
                      <ChefHat className="w-4 h-4" /> AI Preparation Guide
                    </h3>
                    <div className="space-y-5">
                      {selectedRecipeForAnalysis.instructions.map((step, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + (i * 0.1) }}
                          key={i} 
                          className="flex gap-5 group"
                        >
                          <div className="shrink-0 w-10 h-10 bg-muted/50 border-2 border-border rounded-2xl flex items-center justify-center text-xs font-black text-muted-foreground group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <div className="pt-2.5">
                            <p className="text-sm font-medium leading-relaxed text-foreground group-hover:text-primary/90 transition-colors">{step}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-card border-t border-border mt-auto">
                <button
                  onClick={() => {
                    handleAddToCart(selectedRecipeForAnalysis);
                    setSelectedRecipeForAnalysis(null);
                  }}
                  className="w-full bg-[#007000] text-white py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(0,112,0,0.3)] hover:translate-y-[-2px] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> 
                  Get All Ingredients Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecipeCard({ recipe, adding, handleAddToCart, handleAddToMealPlan, onAnalyse }: { 
  recipe: Recipe; 
  adding: string | null; 
  handleAddToCart: (r: Recipe) => void;
  handleAddToMealPlan: (r: Recipe) => void;
  onAnalyse: () => void;
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

        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={onAnalyse}
            className="w-full bg-gradient-to-r from-primary/10 to-primary/5 text-primary py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-primary hover:to-primary hover:text-white transition-all flex items-center justify-center gap-2 border-2 border-primary/20 shadow-sm active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" /> Analyse with AI
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleAddToCart(recipe)}
              disabled={adding === recipe.id + "-cart"}
              className="flex-1 bg-[#007000] text-white h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#007000]/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {adding === recipe.id + "-cart" ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add Ingredients
                </>
              )}
            </button>
            <button
              onClick={() => handleAddToMealPlan(recipe)}
              className="w-12 h-12 bg-white border-2 border-border text-foreground rounded-2xl flex items-center justify-center hover:border-[#007000] hover:text-[#007000] active:scale-95 transition-all"
              title="Add to Meal Plan"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
