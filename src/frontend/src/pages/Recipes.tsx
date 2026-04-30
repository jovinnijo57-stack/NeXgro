import { useState, useMemo } from "react";
import { 
  ArrowLeft, Clock, Users, Flame, ShoppingCart, 
  Plus, Calendar, Info, BookOpen, ChefHat, Utensils, Sparkles, X
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getRecipes, type Recipe } from "@/data/recipes";

export default function Recipes() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const addToCart = useAddToCart();
  const [adding, setAdding] = useState<string | null>(null);
  const [recipes] = useState(() => getRecipes());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRecipes = useMemo(() => {
    return recipes;
  }, [recipes]);

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
      {/* Simple Rectangular Banner Image */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="w-full overflow-hidden shadow-lg rounded-xl">
          <img 
            src="/assets/banner3.jpg" 
            alt="Chef's Corner Banner" 
            className="w-full h-auto block"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="w-14 h-14 bg-card border-2 border-border rounded-2xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-xl active:scale-95"
            title="Back to Home"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Culinary Hub</span>
            <div className="h-1 w-12 bg-[#FFB800] rounded-full mt-1" />
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
              onAnalyze={(r) => { setSelectedRecipe(r); setIsModalOpen(true); }}
            />
          ))}
        </div>

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
                onAnalyze={(r) => { setSelectedRecipe(r); setIsModalOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      <AIAnalysisModal 
        recipe={selectedRecipe} 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #eee;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ddd;
        }
      `}</style>
    </div>
  );
}

function RecipeCard({ recipe, adding, handleAddToCart, handleAddToMealPlan, onAnalyze }: { 
  recipe: Recipe; 
  adding: string | null; 
  handleAddToCart: (r: Recipe) => void;
  handleAddToMealPlan: (r: Recipe) => void;
  onAnalyze: (r: Recipe) => void;
}) {
  return (
    <div className="group bg-card rounded-[2rem] border-2 border-border overflow-hidden hover:border-primary/20 hover:shadow-2xl transition-all duration-500">
      <div className="relative aspect-[4/3] overflow-hidden">
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
            onClick={() => onAnalyze(recipe)}
            className="w-12 h-12 bg-amber-100 border-2 border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center hover:bg-amber-200 active:scale-95 transition-all"
            title="Analyze with AI"
          >
            <Sparkles className="w-5 h-5" />
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
  );
}

function AIAnalysisModal({ recipe, open, onClose }: { recipe: Recipe | null; open: boolean; onClose: () => void }) {
  if (!recipe || !open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="relative h-48">
          <img src={recipe.image} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
            <div>
              <span className="bg-[#FFB800] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full mb-2 inline-block">AI Preparation Guide</span>
              <h2 className="text-white text-3xl font-black italic tracking-tighter uppercase">{recipe.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 backdrop-blur-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <div>
              <h3 className="text-primary font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                <ChefHat className="w-4 h-4" /> Preparation Steps
              </h3>
              <div className="space-y-4">
                {(recipe.preparation || recipe.instructions).map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-black text-muted-foreground group-hover:bg-[#FFB800] group-hover:text-black transition-colors">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed pt-1.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8 border-t border-border bg-muted/30">
          <button onClick={onClose} className="w-full py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
