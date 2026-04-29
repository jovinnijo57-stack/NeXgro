import { useState, useMemo } from "react";
import { 
  ArrowLeft, Search, Clock, Users, Flame, ShoppingCart, 
  Plus, Calendar, Mic, MicOff, Info, BookOpen, ChefHat, Utensils
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Restored Original Banner */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] shadow-xl group">
          <img 
            src="/assets/banner2.png" 
            alt="Chef's Corner Banner" 
            className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200";
              (e.target as HTMLImageElement).className = "w-full aspect-[21/7] object-cover transition-transform duration-700 group-hover:scale-105";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Back Button Overlay */}
          <button 
            onClick={() => navigate({ to: "/home" })} 
            className="absolute top-4 left-4 p-2.5 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white transition-all active:scale-95 group/back"
          >
            <ArrowLeft className="w-5 h-5 text-[#007000] group-hover/back:-translate-x-1 transition-transform" />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
            <h1 className="font-display text-3xl md:text-5xl font-black italic tracking-tight text-white drop-shadow-lg">Chef's Corner</h1>
            <p className="text-white/90 text-xs md:text-sm mt-2 max-w-xs font-bold drop-shadow-md">Curated recipes for your healthy lifestyle.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search healthy recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border-2 border-border pl-14 pr-14 py-5 rounded-[2rem] text-sm font-bold shadow-xl focus:border-primary/20 outline-none transition-all group-focus-within:ring-4 group-focus-within:ring-primary/10"
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

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
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
                    <p className="text-[8px] font-black uppercase text-muted-foreground">Prot</p>
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
          ))}
        </div>
      </div>
    </div>
  );
}
