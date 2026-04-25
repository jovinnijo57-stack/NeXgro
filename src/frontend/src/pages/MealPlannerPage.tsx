import { useMealPlans, useRecipes } from "@/hooks/useBackend";
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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MealPlannerPage() {
  const { data: recipes } = useRecipes();
  const { data: mealPlans } = useMealPlans();
  const [selectedDay, setSelectedDay] = useState(0);

  const handleAddAllToCart = () => {
    toast.success("All ingredients for the week added to cart!");
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-6" data-ocid="meal-planner.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-foreground text-xl">
              Meal Planner 🥗
            </h1>
          </div>
        </div>
        <button
          onClick={handleAddAllToCart}
          className="p-2.5 rounded-xl bg-primary text-white shadow-lg active:scale-95 transition-all"
          title="Add all ingredients to cart"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      {/* Week Selector */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="font-bold text-foreground">April 24 – April 30</h2>
          <div className="flex gap-1">
            <button className="p-1 rounded hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
            <button className="p-1 rounded hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={cn(
                "flex flex-col items-center py-2 rounded-xl transition-all",
                selectedDay === i 
                  ? "bg-primary text-white shadow-md scale-105" 
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider">{day}</span>
              <span className="text-sm font-bold mt-1">{24 + i}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Plan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {DAYS[selectedDay]}'s Plan
          </h3>
          <Link
            to="/recipes"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Recipe
          </Link>
        </div>

        {mealPlans?.filter(mp => mp.id === `mp${selectedDay + 1}`).length ? (
          mealPlans.map((mp) => (
            <div key={mp.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex">
              <div className="w-24 h-24 bg-muted shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80" 
                  className="w-full h-full object-cover" 
                  alt="Recipe"
                />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-foreground text-sm line-clamp-1">Quinoa Salad with Roasted Veg</h4>
                    <button className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Serves {mp.servings} · 25 mins</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors">
                    View Recipe
                  </button>
                  <button className="px-2 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-muted/30 border-2 border-dashed border-border rounded-2xl p-10 text-center">
            <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No meals planned for today.</p>
            <Link to="/recipes" className="text-xs font-bold text-primary mt-2 inline-block">Browse Recipes</Link>
          </div>
        )}
      </div>

      {/* Shopping List Summary */}
      <div className="bg-accent/10 rounded-2xl p-5 border border-accent/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-accent">Weekly Shopping List</h3>
          <span className="text-[10px] font-bold bg-accent text-white px-2 py-0.5 rounded-full">12 items</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["Quinoa", "Cherry Tomatoes", "Cucumber", "Feta Cheese"].map(item => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-xs text-foreground/80">{item}</span>
            </div>
          ))}
          <div className="col-span-2 text-center pt-2 mt-2 border-t border-accent/10">
            <span className="text-[10px] text-accent font-bold uppercase tracking-widest">+ 8 more items</span>
          </div>
        </div>
      </div>
    </div>
  );
}
