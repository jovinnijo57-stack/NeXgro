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
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Navigation & Search (Moved Above Banner) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="shrink-0 w-14 h-14 bg-white border border-black/5 rounded-[1.25rem] flex items-center justify-center text-[#333] hover:bg-muted transition-all shadow-sm active:scale-95"
            title="Back to Home"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#007000] transition-colors" />
            <input
              type="text"
              placeholder="Search healthy recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f4fcf4] border-2 border-[#e8f5e8] pl-14 pr-24 py-5 rounded-[2.5rem] text-sm font-bold shadow-sm focus:border-[#007000]/20 outline-none transition-all group-focus-within:ring-4 group-focus-within:ring-[#007000]/10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={startListening}
                className={cn(
                  "p-3 rounded-2xl transition-all",
                  isListening ? "bg-destructive text-white animate-pulse" : "text-[#007000] hover:bg-[#007000]/10"
                )}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Banner Image */}
        <div className="w-full relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl">
          <img 
            src="/assets/banner3.jpg" 
            alt="Chef's Corner Banner" 
            className="w-full h-auto block"
          />
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
      {/* Recipe Analysis Modal - Professional Premium Model */}
      {selectedRecipeForAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-700"
            onClick={() => setSelectedRecipeForAnalysis(null)}
          />
          <div className="relative bg-background w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/10 flex flex-col md:flex-row animate-in fade-in zoom-in duration-500">
            {/* Left Side: Recipe Visual & Action */}
            <div className="w-full md:w-2/5 relative overflow-hidden bg-muted group">
              <img 
                src={selectedRecipeForAnalysis.image} 
                alt={selectedRecipeForAnalysis.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <span className="bg-[#007000] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {selectedRecipeForAnalysis.category}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                      {selectedRecipeForAnalysis.time}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                    {selectedRecipeForAnalysis.title}
                  </h2>
                  <div className="flex items-center gap-6 text-white/70 text-xs font-bold pt-2 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest opacity-60">Protein</span>
                      <span>{selectedRecipeForAnalysis.protein}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest opacity-60">Fat</span>
                      <span>{selectedRecipeForAnalysis.fat}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest opacity-60">Carbs</span>
                      <span>{selectedRecipeForAnalysis.carbs}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: AI Intelligence Content */}
            <div className="flex-1 flex flex-col bg-card overflow-hidden">
              <div className="p-8 border-b border-border flex items-center justify-between bg-muted/5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-[#007000] rounded-full blur opacity-20 animate-pulse" />
                    <div className="relative w-12 h-12 bg-[#007000] rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#007000] uppercase tracking-[0.3em] leading-none mb-1">NeXgro Intelligence</p>
                    <h3 className="text-xl font-black text-foreground uppercase italic tracking-tight">AI Culinary Analysis</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedRecipeForAnalysis(null)}
                  className="w-10 h-10 bg-muted/50 hover:bg-muted rounded-xl flex items-center justify-center transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                <section className="animate-in slide-in-from-bottom-4 duration-700 delay-100">
                  <div className="flex items-center gap-3 mb-6">
                    <ShoppingCart className="w-4 h-4 text-[#007000]" />
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Required Ingredients</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipeForAnalysis.ingredients.map((ing, i) => (
                      <div key={i} className="bg-muted/50 border border-border px-4 py-2.5 rounded-2xl text-sm font-bold text-foreground/80 flex items-center gap-2 hover:border-[#007000]/30 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#007000]/50" />
                        {ing.name} <span className="text-[10px] opacity-40">x{ing.qty}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
                  <div className="flex items-center gap-3 mb-6">
                    <ChefHat className="w-4 h-4 text-[#007000]" />
                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">AI Generated Instructions</h4>
                  </div>
                  <div className="space-y-6">
                    {selectedRecipeForAnalysis.instructions.map((step, i) => (
                      <div key={i} className="flex gap-5 group relative">
                        {i < selectedRecipeForAnalysis.instructions.length - 1 && (
                          <div className="absolute left-[1.125rem] top-10 bottom-[-1.5rem] w-[2px] bg-border/50 group-hover:bg-[#007000]/20 transition-colors" />
                        )}
                        <div className="shrink-0 w-9 h-9 bg-background border-2 border-border rounded-xl flex items-center justify-center text-xs font-black text-[#007000] shadow-sm group-hover:border-[#007000] group-hover:bg-[#007000] group-hover:text-white transition-all duration-300">
                          {i + 1}
                        </div>
                        <div className="pt-2">
                          <p className="text-sm font-medium leading-relaxed text-foreground/70 group-hover:text-foreground transition-colors animate-in fade-in slide-in-from-left-4 duration-1000" style={{ animationDelay: `${i * 200 + 500}ms` }}>
                            {step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-8 bg-muted/5 border-t border-border mt-auto">
                <button
                  onClick={() => {
                    handleAddToCart(selectedRecipeForAnalysis);
                    setSelectedRecipeForAnalysis(null);
                  }}
                  className="w-full bg-[#007000] text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#007000]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Plus className="w-6 h-6" /> Populate Cart with Ingredients
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function RecipeCard({ recipe, adding, handleAddToCart, handleAddToMealPlan, onAnalyse }: { 
  recipe: Recipe; 
  adding: string | null; 
  handleAddToCart: (r: Recipe) => void;
  handleAddToMealPlan: (r: Recipe) => void;
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

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => onAnalyse(recipe)}
            className="w-full bg-gradient-to-r from-[#007000] to-[#00a000] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-[#007000]/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" /> Analyse with AI
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
