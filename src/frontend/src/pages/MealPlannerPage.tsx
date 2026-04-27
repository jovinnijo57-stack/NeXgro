import { useMealPlans, useRecipes, useAddToCart } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
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
  Clock,
  Info,
  BookOpen
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MealPlannerPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: recipes } = useRecipes();
  const { data: mealPlans } = useMealPlans();
  const addToCart = useAddToCart();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [adding, setAdding] = useState<string | null>(null);

  // Derive selectedDay (0-6) for the weekly bar, if within current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  const handleDayClick = (dayIndex: number) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + dayIndex);
    setSelectedDate(date.toISOString().split("T")[0]);
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
            await addToCart.mutateAsync({ productId: ing.id, qty: ing.qty });
          }
        }
      }
      toast.success("All ingredients for today added to cart! 🛒");
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
        await addToCart.mutateAsync({ productId: ing.id, qty: ing.qty });
      }
      toast.success(`Ingredients for "${recipe.title || recipe.name}" added to cart! 🛒`);
    } catch {
      toast.error("Failed to add ingredients.");
    } finally {
      setAdding(null);
    }
  };

  const filteredMealPlans = mealPlans?.filter(mp => mp.plannedDate === selectedDate);

  const displayDate = new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const displayDayName = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-8 pb-24" data-ocid="meal-planner.page">
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
          <div className="relative group">
            <input 
              type="date" 
              value={selectedDate}
              onChange={handleDateChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <button className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-all flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Pick Date</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split("T")[0];
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
          <div className="space-y-6">
            {filteredMealPlans.map((mp: any) => {
              const recipe = mp.recipeDetails || recipes?.find(r => r.id === mp.recipeId);
              return (
                <div key={mp.id} className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-40 sm:h-auto bg-muted shrink-0">
                      <img 
                        src={recipe?.image || recipe?.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"} 
                        className="w-full h-full object-cover" 
                        alt={recipe?.title || recipe?.name || "Recipe"}
                      />
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-black text-foreground text-xl tracking-tight leading-tight">{recipe?.title || recipe?.name || "Recipe"}</h4>
                          <div className="flex items-center gap-3 mt-1.5 text-muted-foreground">
                            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider"><Clock className="w-3.5 h-3.5" /> {recipe?.time || "25 min"}</span>
                            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#007000]"><Flame className="w-3.5 h-3.5" /> {recipe?.calories || "400 kcal"}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeletePlan(mp.id)}
                          className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Nutrition Info */}
                      <div className="grid grid-cols-3 gap-2 bg-muted/50 rounded-2xl p-3">
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Protein</p>
                          <p className="text-xs font-black text-[#007000]">{recipe?.protein || "12g"}</p>
                        </div>
                        <div className="text-center border-x border-border">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Fat</p>
                          <p className="text-xs font-black text-amber-600">{recipe?.fat || "14g"}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Carbs</p>
                          <p className="text-xs font-black text-blue-600">{recipe?.carbs || "45g"}</p>
                        </div>
                      </div>

                      {/* Ingredients List */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 text-foreground">
                          <ShoppingCart className="w-4 h-4 text-[#007000]" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Ingredients</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(recipe?.ingredients || []).map((ing: any, idx: number) => (
                            <span key={idx} className="bg-muted px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground border border-border">
                              {ing.qty}x {ing.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 text-foreground">
                          <BookOpen className="w-4 h-4 text-[#007000]" />
                          <span className="text-[11px] font-black uppercase tracking-widest">How to Cook</span>
                        </div>
                        <ul className="space-y-2">
                          {(recipe?.instructions || ["Ready in 25 minutes.", "Serve hot with side salad."]).map((step: string, idx: number) => (
                            <li key={idx} className="flex gap-3 text-xs text-muted-foreground leading-relaxed">
                              <span className="font-black text-[#007000] min-w-[12px]">{idx + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-border flex gap-3">
                        <button 
                          onClick={() => handleAddToCart(recipe)}
                          disabled={adding === recipe?.id}
                          className="flex-1 py-3.5 rounded-2xl bg-[#007000] text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#007000]/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
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
