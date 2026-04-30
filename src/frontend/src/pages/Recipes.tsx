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
    navigate({ to: "/meal-planner", search: { date: dateStr } });
  };

  const firstSixRecipes = filteredRecipes.slice(0, 6);
  const remainingRecipes = filteredRecipes.slice(6);

  return (
    <div className="min-h-screen bg-background pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Navigation & Search Bar at Top */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigate({ to: "/meal-planner" });
              // Fallback for immediate redirection
              if (window.location.pathname !== "/meal-planner") {
                window.location.href = "/meal-planner";
              }
            }}
            className="shrink-0 w-14 h-14 bg-white border-2 border-[#007000]/10 rounded-2xl flex items-center justify-center text-[#007000] hover:bg-[#f0f9f0] transition-all shadow-lg active:scale-95"
            title="Back to Meal Planner"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#006400] group-focus-within:scale-110 transition-transform" />
            <input
              type="text"
              placeholder="Search groceries, essentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8fbf8] border-2 border-[#d3e6d3] pl-16 pr-16 py-4 rounded-full text-sm font-semibold placeholder:text-[#8ba38b] shadow-[0_2px_10px_rgba(0,100,0,0.02)] focus:border-[#006400]/40 focus:bg-white outline-none transition-all group-focus-within:ring-4 group-focus-within:ring-[#006400]/5"
            />
            <button
              onClick={startListening}
              className={cn(
                "absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all",
                isListening ? "bg-destructive text-white animate-pulse" : "text-[#006400] hover:bg-[#006400]/5"
              )}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Banner Image Below Search */}
        <div className="w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-xl border border-border bg-[#111]">
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
  );
}

function RecipeCard({ recipe, adding, handleAddToCart, handleAddToMealPlan, onAnalyse }: { 
  recipe: Recipe; 
  adding: string | null; 
  handleAddToCart: (recipe: Recipe) => void;
  handleAddToMealPlan: (recipe: Recipe, selectedDate?: string) => void;
  onAnalyse: (recipe: Recipe) => void;
}) {
  const [planDate, setPlanDate] = useState<string>("");

  return (
    <div className="group bg-card rounded-[3rem] overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full">
      {/* Recipe Hero Image */}
      <div className="relative h-64 overflow-hidden shrink-0">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Difficulty Badge */}
        <div className="absolute top-6 left-6">
          <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-lg",
            recipe.difficulty === "Easy" ? "bg-emerald-500/80 text-white" :
            recipe.difficulty === "Medium" ? "bg-amber-500/80 text-white" :
            "bg-rose-500/80 text-white"
          )}>
            {recipe.difficulty}
          </span>
        </div>

        {/* Floating Category Label */}
        <div className="absolute bottom-6 left-6 right-6">
          <h3 className="font-black text-xl text-white leading-tight tracking-tight drop-shadow-md">{recipe.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-black text-white">{recipe.calories}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
              <Clock className="w-3 h-3 text-white/80" />
              <span className="text-[10px] font-black text-white">{recipe.time}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Macro Preview */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/50 p-2 rounded-2xl text-center border border-border/50">
            <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Protein</p>
            <p className="text-xs font-black text-foreground">{recipe.protein}</p>
          </div>
          <div className="bg-muted/50 p-2 rounded-2xl text-center border border-border/50">
            <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Fat</p>
            <p className="text-xs font-black text-foreground">{recipe.fat}</p>
          </div>
          <div className="bg-muted/50 p-2 rounded-2xl text-center border border-border/50">
            <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Carbs</p>
            <p className="text-xs font-black text-foreground">{recipe.carbs}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => handleAddToMealPlan(recipe, planDate)}
            className="flex-1 bg-[#007000] text-white h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#007000]/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" /> 
            {planDate ? `Add to ${planDate.split('-').slice(1).join('/')}` : 'Add to Meal Planner'}
          </button>
          
          <button
            onClick={() => onAnalyse(recipe)}
            className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white active:scale-95 transition-all border-2 border-primary/20"
            title="Analyse with AI"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button
              onClick={(e) => {
                const input = (e.currentTarget.nextElementSibling as HTMLInputElement);
                if (input && 'showPicker' in input) {
                  input.showPicker();
                } else if (input) {
                  input.click();
                }
              }}
              className={cn(
                "w-12 h-12 border-2 rounded-2xl flex items-center justify-center transition-all",
                planDate ? "bg-[#007000]/10 border-[#007000] text-[#007000]" : "bg-white border-border text-foreground hover:border-[#007000] hover:text-[#007000]"
              )}
              title="Select a specific date"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <input 
              type="date"
              className="absolute inset-0 opacity-0 -z-10"
              onChange={(e) => {
                setPlanDate(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
