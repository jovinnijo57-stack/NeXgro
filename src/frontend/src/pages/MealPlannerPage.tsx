import { useMealPlans, useRecipes, useAddToCart } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Plus,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
  Flame,
  Clock,
  BookOpen,
  Droplets,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { analyzeRecipe } from "@/services/gemini";
import { SAMPLE_PRODUCTS } from "@/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getLocalDateString = (d: Date) => {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
};

export default function MealPlannerPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: recipes } = useRecipes();
  const { data: mealPlans } = useMealPlans();
  const addToCart = useAddToCart();
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(new Date()));
  const [adding, setAdding] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, any>>({});
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  // Deriving week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1)); // Correct Monday

  const handleDayClick = (dayIndex: number) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + dayIndex);
    setSelectedDate(getLocalDateString(date));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleAddAllToCart = async () => {
    if (!filteredMealPlans || filteredMealPlans.length === 0) {
      toast.error("No recipes planned for this date.");
      return;
    }
    setAdding("all");
    try {
      for (const mp of filteredMealPlans) {
        const recipe = mp.recipeDetails || recipes?.find((r: any) => r.id === mp.recipeId);
        if (recipe && recipe.ingredients) {
          for (const ing of recipe.ingredients) {
            const pId = ing.id || (ing as any).productId;
            const pQty = ing.qty || (ing as any).quantity || 1;
            if (pId) {
              await addToCart.mutateAsync({ productId: pId, qty: pQty });
            }
          }
        }
      }
      toast.success("All ingredients added to cart! 🛒");
      navigate({ to: "/cart" });
    } catch {
      toast.error("Failed to add some ingredients.");
    } finally {
      setAdding(null);
    }
  };

  const handleDeletePlan = (id: string) => {
    const existing = JSON.parse(localStorage.getItem("nexgro_meal_plans") || "[]");
    const filtered = existing.filter((p: any) => p.id !== id);
    localStorage.setItem("nexgro_meal_plans", JSON.stringify(filtered));
    qc.invalidateQueries({ queryKey: ["meal-plans"] });
    toast.success("Meal removed from plan.");
  };

  const handleAddToCart = async (recipe: any) => {
    if (!recipe) return;
    setAdding(recipe.id);
    try {
      const ingredients = recipe.ingredients || [];
      for (const ing of ingredients) {
        const pId = ing.id || (ing as any).productId;
        const pQty = ing.qty || (ing as any).quantity || 1;
        if (pId) {
          await addToCart.mutateAsync({ productId: pId, qty: pQty });
        }
      }
      toast.success(`Ingredients for "${recipe.title || recipe.name}" added to cart! 🛒`);
    } catch {
      toast.error("Failed to add ingredients.");
    } finally {
      setAdding(null);
    }
  };

  const handleGetAiAnalysis = async (recipe: any) => {
    if (aiAnalysis[recipe.id]) return;
    setAnalyzing(recipe.id);
    try {
      const analysis = await analyzeRecipe(recipe.title, recipe.ingredients);
      if (analysis && Array.isArray(analysis.steps)) {
        setAiAnalysis(prev => ({ ...prev, [recipe.id]: analysis }));
        toast.success("AI Analysis Complete! ✨");
      } else {
        toast.error("AI returned invalid data. Please try again.");
      }
    } catch {
      toast.error("AI Analysis failed.");
    } finally {
      setAnalyzing(null);
    }
  };

  const filteredMealPlans = mealPlans?.filter(mp => mp.plannedDate === selectedDate);

  const displayDate = new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const displayDayName = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/home"
            className="p-2.5 rounded-2xl bg-card border border-border hover:bg-muted transition-all text-muted-foreground hover:text-foreground shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display font-black text-foreground text-2xl tracking-tight">
              Meal Planner
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              {displayDate}
            </p>
          </div>
        </div>
        <button
          onClick={handleAddAllToCart}
          disabled={adding === "all"}
          className="w-12 h-12 rounded-[1.2rem] bg-[#007000] text-white shadow-lg shadow-[#007000]/20 active:scale-95 transition-all flex items-center justify-center"
        >
          {adding === "all" ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Week Selector & Date Picker */}
      <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#007000]" />
            <h2 className="font-black text-foreground tracking-tight">Weekly Schedule</h2>
          </div>
          <div className="relative group overflow-hidden rounded-xl">
            <button
              onClick={(e) => {
                const input = (e.currentTarget.nextElementSibling as HTMLInputElement);
                if (input && 'showPicker' in input) {
                  input.showPicker();
                } else if (input) {
                  input.click();
                }
              }}
              className="p-2.5 bg-muted group-hover:bg-muted/80 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#007000]" />
              <span className="text-[10px] font-black uppercase tracking-widest">Pick Date</span>
            </button>
            <input 
              type="date" 
              value={selectedDate}
              onChange={handleDateChange}
              className="absolute inset-0 opacity-0 -z-10"
            />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = getLocalDateString(date);
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={day}
                onClick={() => handleDayClick(i)}
                className={cn(
                  "flex flex-col items-center py-3 rounded-2xl transition-all border-2",
                  isSelected 
                    ? "bg-[#007000] border-[#007000] text-white shadow-lg shadow-[#007000]/20 scale-105" 
                    : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-tighter">{day}</span>
                <span className="text-lg font-black mt-0.5">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Plan */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-xl text-foreground flex items-center gap-2 tracking-tight">
            <UtensilsCrossed className="w-6 h-6 text-[#007000]" />
            {displayDayName}'s Menu
          </h3>
          <Link
            to="/recipes"
            className="bg-[#007000]/10 text-[#007000] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#007000] hover:text-white transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </Link>
        </div>

        {filteredMealPlans && filteredMealPlans.length > 0 ? (
          <div className="space-y-8">
            {filteredMealPlans.map((mp: any) => {
              const recipe = mp.recipeDetails || recipes?.find(r => r.id === mp.recipeId);
              const analysis = aiAnalysis[recipe?.id];

              return (
                <div key={mp.id} className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:row">
                    <div className="sm:w-full h-48 bg-muted relative">
                      <img 
                        src={recipe?.image || recipe?.imageUrl} 
                        className="w-full h-full object-cover" 
                        alt={recipe?.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                        <h4 className="font-black text-white text-2xl tracking-tight leading-tight">{recipe?.title}</h4>
                        <button 
                          onClick={() => handleDeletePlan(mp.id)}
                          className="p-2.5 rounded-xl bg-destructive/20 backdrop-blur-md text-white border border-white/20 hover:bg-destructive transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Top Meta */}
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 text-[#007000]" />
                          <span className="text-xs font-bold">{recipe?.time || "25 min"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-bold">{recipe?.calories || "400 kcal"}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1 bg-[#007000]/10 px-3 py-1 rounded-full">
                          <Sparkles className="w-3 h-3 text-[#007000]" />
                          <span className="text-[10px] font-black text-[#007000] uppercase tracking-wider">Smart Balanced</span>
                        </div>
                      </div>

                      {/* Ingredients Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-[#007000]" />
                            <h5 className="font-black text-sm uppercase tracking-widest text-foreground">Ingredients</h5>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">{(recipe?.ingredients || []).length} Items</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(recipe?.ingredients || []).map((ing: any, idx: number) => {
                            const matchedProduct = SAMPLE_PRODUCTS.find(p => p.id === ing.id);
                            return (
                            <div key={idx} className="flex items-center gap-3 bg-muted/50 p-3 rounded-2xl border border-border">
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white">
                                <img src={matchedProduct?.imageUrl || "/assets/placeholder.png"} className="w-full h-full object-cover" alt={ing.name} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold text-foreground block truncate">{ing.name}</span>
                                <span className="text-[10px] font-black text-[#007000] uppercase tracking-widest">Qty: {ing.qty}</span>
                              </div>
                            </div>
                          )})}
                        </div>
                      </div>

                      {/* AI Analysis Button */}
                      {!analysis ? (
                        <button 
                          onClick={() => handleGetAiAnalysis(recipe)}
                          disabled={analyzing === recipe?.id}
                          className="w-full py-4 rounded-2xl bg-muted border-2 border-dashed border-border hover:border-[#007000]/30 hover:bg-[#007000]/5 transition-all group"
                        >
                          {analyzing === recipe?.id ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-4 h-4 border-2 border-[#007000]/30 border-t-[#007000] rounded-full animate-spin" />
                              <span className="text-xs font-black uppercase tracking-widest text-[#007000]">Analyzing with Gemini...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <Sparkles className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-[#007000]">Analyze quantity & steps with AI</span>
                            </div>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                          {/* AI Quantities Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Droplets className="w-4 h-4 text-blue-500" />
                                <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Water Needed</span>
                              </div>
                              <p className="text-lg font-black text-blue-900">{analysis.water}</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Cook Time</span>
                              </div>
                              <p className="text-lg font-black text-amber-900">{analysis.time}</p>
                            </div>
                          </div>

                          {/* Detailed Steps */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-[#007000]" />
                              <h5 className="font-black text-sm uppercase tracking-widest text-foreground">Cooking Steps</h5>
                            </div>
                            <div className="space-y-4">
                              {analysis.steps.map((step: string, idx: number) => (
                                <div key={idx} className="flex gap-4">
                                  <div className="w-6 h-6 rounded-full bg-[#007000] text-white flex items-center justify-center shrink-0 text-[10px] font-black">
                                    {idx + 1}
                                  </div>
                                  <p className="text-xs font-medium text-muted-foreground leading-relaxed pt-0.5">
                                    {step}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2">
                        <button 
                          onClick={() => handleAddToCart(recipe)}
                          disabled={adding === recipe?.id}
                          className="w-full py-4 rounded-2xl bg-[#007000] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#007000]/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add Ingredients to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-muted/30 border-2 border-dashed border-border rounded-[2.5rem] p-16 text-center">
            <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
            <p className="text-muted-foreground font-bold tracking-tight">
              Your menu for this day is empty.
            </p>
            <Link to="/recipes" className="bg-[#007000] text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest mt-6 inline-block shadow-lg shadow-[#007000]/20 transition-all active:scale-95">Browse Recipes</Link>
          </div>
        )}
      </div>
    </div>
  );
}
