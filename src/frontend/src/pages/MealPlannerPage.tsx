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
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleAddAllToCart = () => {
    toast.success("All ingredients for the week added to cart!");
  };

  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Speech recognition error. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const filteredMealPlans = mealPlans?.filter(mp => {
    const dayDate = new Date();
    dayDate.setDate(24 + selectedDay);
    const dayStr = dayDate.toISOString().split("T")[0];
    
    const matchesDay = mp.plannedDate === dayStr;
    const recipe = recipes?.find(r => r.id === mp.recipeId);
    const matchesSearch = !searchQuery || 
      recipe?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe?.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesDay && matchesSearch;
  });

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

      {/* Search Bar with Voice */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Plus className={cn("w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors", isListening && "animate-pulse text-primary")} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search recipes or planned meals..."
          className="w-full bg-card border border-border rounded-2xl py-3.5 pl-11 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
        <button
          onClick={handleVoiceSearch}
          className={cn(
            "absolute inset-y-0 right-2 px-3 flex items-center text-muted-foreground hover:text-primary transition-colors",
            isListening && "text-primary"
          )}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
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

        {filteredMealPlans && filteredMealPlans.length > 0 ? (
          filteredMealPlans.map((mp) => {
            const recipe = recipes?.find(r => r.id === mp.recipeId);
            return (
              <div key={mp.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex">
                <div className="w-24 h-24 bg-muted shrink-0">
                  <img 
                    src={recipe?.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"} 
                    className="w-full h-full object-cover" 
                    alt={recipe?.name || "Recipe"}
                  />
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-foreground text-sm line-clamp-1">{recipe?.name || "Recipe"}</h4>
                      <button className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Serves {mp.servings} · {recipe?.cookTimeMinutes || 25} mins</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/recipes"
                      className="flex-1 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors text-center"
                    >
                      View Recipe
                    </Link>
                    <button className="px-2 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-muted/30 border-2 border-dashed border-border rounded-2xl p-10 text-center">
            <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No meals match your search." : "No meals planned for today."}
            </p>
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
