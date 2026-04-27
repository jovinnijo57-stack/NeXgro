import { useState, useMemo } from "react";
import { 
  ArrowLeft, Search, Clock, Users, Flame, ShoppingCart, 
  Plus, Calendar, Mic, MicOff, Info, BookOpen, ChefHat
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface Recipe {
  id: string;
  title: string;
  category: string;
  time: string;
  serves: number;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  image: string;
  ingredients: { id: string; name: string; qty: number }[];
  instructions: string[];
}

const ALL_RECIPES: Recipe[] = [
  // BREAKFAST
  {
    id: "b1",
    title: "Masala Dosa",
    category: "Breakfast",
    time: "20 min",
    serves: 2,
    calories: "350 kcal",
    protein: "8g",
    fat: "12g",
    carbs: "55g",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80",
    ingredients: [
      { id: "p1", name: "Dosa Batter", qty: 1 },
      { id: "p2", name: "Potato Masala", qty: 1 },
    ],
    instructions: ["Spread batter thinly on a hot griddle.", "Apply ghee and cook until crisp.", "Add potato masala and fold."]
  },
  {
    id: "b2",
    title: "Idli with Sambar",
    category: "Breakfast",
    time: "15 min",
    serves: 2,
    calories: "280 kcal",
    protein: "10g",
    fat: "4g",
    carbs: "48g",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    ingredients: [
      { id: "p3", name: "Idli Batter", qty: 1 },
      { id: "p4", name: "Sambar Mix", qty: 1 },
    ],
    instructions: ["Steam idlis in a mold for 10 mins.", "Heat sambar with fresh vegetables.", "Serve hot with coconut chutney."]
  },
  {
    id: "b3",
    title: "Appam with Vegetable Stew",
    category: "Breakfast",
    time: "20 min",
    serves: 2,
    calories: "320 kcal",
    protein: "6g",
    fat: "15g",
    carbs: "42g",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=800&q=80",
    ingredients: [
      { id: "p5", name: "Appam Batter", qty: 1 },
      { id: "p6", name: "Coconut Milk", qty: 1 },
    ],
    instructions: ["Pour batter into appam pan and swirl.", "Cook with lid until edges are crisp.", "Serve with creamy coconut stew."]
  },
  
  // LUNCH
  {
    id: "l1",
    title: "Hyderabadi Chicken Biryani",
    category: "Lunch",
    time: "45 min",
    serves: 4,
    calories: "650 kcal",
    protein: "35g",
    fat: "25g",
    carbs: "75g",
    image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800&q=80",
    ingredients: [
      { id: "p7", name: "Basmati Rice", qty: 2 },
      { id: "p8", name: "Organic Chicken", qty: 1 },
      { id: "p9", name: "Biryani Spices", qty: 1 },
    ],
    instructions: ["Marinate chicken with spices and yogurt.", "Layer semi-cooked rice over chicken.", "Cook on low flame (Dum) for 20 mins."]
  },
  {
    id: "l2",
    title: "South Indian Thali",
    category: "Lunch",
    time: "40 min",
    serves: 1,
    calories: "750 kcal",
    protein: "22g",
    fat: "30g",
    carbs: "95g",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    ingredients: [
      { id: "p10", name: "Boiled Rice", qty: 1 },
      { id: "p11", name: "Assorted Veggies", qty: 1 },
    ],
    instructions: ["Prepare small portions of Sambar, Rasam, and Poriyal.", "Serve with hot rice and a dollop of ghee.", "Include papad and pickle on the side."]
  },

  // DINNER
  {
    id: "d1",
    title: "Paneer Butter Masala",
    category: "Dinner",
    time: "25 min",
    serves: 2,
    calories: "480 kcal",
    protein: "15g",
    fat: "35g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
    ingredients: [
      { id: "p12", name: "Fresh Paneer", qty: 1 },
      { id: "p13", name: "Tomato Puree", qty: 1 },
      { id: "p14", name: "Fresh Cream", qty: 1 },
    ],
    instructions: ["Saute onions and ginger-garlic paste.", "Add tomato puree and cook until oil separates.", "Add paneer cubes and finish with cream."]
  },
  {
    id: "d2",
    title: "Grilled Chicken Breast",
    category: "Dinner",
    time: "20 min",
    serves: 1,
    calories: "350 kcal",
    protein: "45g",
    fat: "12g",
    carbs: "5g",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80",
    ingredients: [
      { id: "p8", name: "Organic Chicken Breast", qty: 1 },
      { id: "p15", name: "Lemon & Herbs", qty: 1 },
    ],
    instructions: ["Marinate chicken with lemon juice and herbs.", "Grill for 6-8 mins on each side.", "Serve with steamed broccoli."]
  },

  // SNACKS
  {
    id: "s1",
    title: "Crispy Vegetable Samosa",
    category: "Snacks",
    time: "30 min",
    serves: 4,
    calories: "180 kcal",
    protein: "4g",
    fat: "10g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1601050633647-81a3104192df?w=800&q=80",
    ingredients: [
      { id: "p16", name: "Samosa Crust", qty: 1 },
      { id: "p17", name: "Spiced Potatoes", qty: 1 },
    ],
    instructions: ["Fill pastry cones with potato mixture.", "Seal edges with water.", "Deep fry until golden brown."]
  },
  
  // DESSERTS
  {
    id: "ds1",
    title: "Gulab Jamun",
    category: "Desserts",
    time: "20 min",
    serves: 4,
    calories: "220 kcal",
    protein: "3g",
    fat: "12g",
    carbs: "35g",
    image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=800&q=80",
    ingredients: [
      { id: "p18", name: "Khoya", qty: 1 },
      { id: "p19", name: "Sugar Syrup", qty: 1 },
    ],
    instructions: ["Make small balls from khoya dough.", "Deep fry on low heat.", "Soak in warm cardamom sugar syrup for 2 hours."]
  },

  // INTERNATIONAL
  {
    id: "i1",
    title: "Artisan Margherita Pizza",
    category: "International",
    time: "20 min",
    serves: 2,
    calories: "550 kcal",
    protein: "18g",
    fat: "22g",
    carbs: "68g",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80",
    ingredients: [
      { id: "p20", name: "Pizza Dough", qty: 1 },
      { id: "p21", name: "Mozzarella Cheese", qty: 1 },
      { id: "p22", name: "Basil Leaves", qty: 1 },
    ],
    instructions: ["Roll out dough and spread tomato sauce.", "Top with fresh mozzarella and olive oil.", "Bake at 450°F until crust is charred."]
  }
];

const CATEGORIES = [
  { name: "Breakfast", icon: Clock, color: "text-amber-500" },
  { name: "Lunch", icon: Utensils, color: "text-emerald-500" },
  { name: "Dinner", icon: Flame, color: "text-orange-500" },
  { name: "Snacks", icon: ChefHat, color: "text-rose-500" },
  { name: "Desserts", icon: Info, color: "text-purple-500" },
  { name: "International", icon: BookOpen, color: "text-blue-500" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RecipesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isListening, setIsListening] = useState(false);
  const addToCart = useAddToCart();
  const [adding, setAdding] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<Record<string, number>>({});

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setSearchQuery(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const filteredRecipes = useMemo(() => {
    return ALL_RECIPES.filter(recipe => {
      const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleAddToMealPlan = async (recipe: Recipe) => {
    const dayIndex = selectedDays[recipe.id] ?? 0;
    setAdding(recipe.id);
    try {
      const plannedDate = new Date();
      plannedDate.setDate(24 + dayIndex); 
      const dateStr = plannedDate.toISOString().split("T")[0];

      const existing = JSON.parse(localStorage.getItem("nexgro_meal_plans") || "[]");
      const newPlan = {
        id: `mp-${Date.now()}`,
        recipeId: recipe.id,
        plannedDate: dateStr,
        servings: recipe.serves,
        recipeDetails: recipe 
      };
      localStorage.setItem("nexgro_meal_plans", JSON.stringify([...existing, newPlan]));
      
      qc.invalidateQueries({ queryKey: ["meal-plans"] });
      toast.success(`"${recipe.title}" added to ${DAYS[dayIndex]}'s Plan! 📅`);
    } catch {
      toast.error("Failed to add to meal planner.");
    } finally {
      setAdding(null);
    }
  };

  const handleAddToCart = async (recipe: Recipe) => {
    setAdding(recipe.id);
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Premium Hero Banner */}
      <div className="relative h-64 sm:h-80 bg-black overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
          alt="Chef's Corner"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-primary/20 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Today's Special 🌟</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-700">
            Chef's Corner
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-lg font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Discover thousands of hand-picked recipes and plan your weekly meals with ease.
          </p>
        </div>
      </div>

      {/* Professional Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-4 space-y-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search recipes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 border-2 border-transparent rounded-2xl pl-12 pr-12 py-3 text-sm font-bold focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
            <button
              onClick={startListening}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                isListening ? "bg-destructive text-white animate-pulse" : "hover:bg-primary/10 text-primary"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5">
            <Calendar className="w-4 h-4" />
            My Planner
          </button>
        </div>

        {/* Categories bar */}
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar px-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
              selectedCategory === "All" 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All Recipes
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all",
                  selectedCategory === cat.name 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Icon className={cn("w-4 h-4", selectedCategory === cat.name ? "text-white" : cat.color)} />
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {filteredRecipes.length === 0 ? (
          <div className="py-20 text-center">
            <Utensils className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
            <p className="text-muted-foreground font-medium">No recipes found for "{searchQuery}" in {selectedCategory}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="group bg-card border border-border rounded-[2rem] overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-display font-bold text-white text-lg leading-tight mb-1">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <Clock className="w-3 h-3" /> {recipe.time}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                        <Flame className="w-3 h-3 text-orange-400" /> {recipe.calories}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Protein</p>
                        <p className="text-xs font-black text-primary">{recipe.protein || "8g"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Fat</p>
                        <p className="text-xs font-black text-amber-500">{recipe.fat || "12g"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold">Serves {recipe.serves}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border space-y-3">
                    <div className="flex items-center gap-2 pt-2">
                      <select
                        value={selectedDays[recipe.id] ?? 0}
                        onChange={(e) => setSelectedDays(prev => ({ ...prev, [recipe.id]: parseInt(e.target.value) }))}
                        className="flex-1 bg-muted border-none rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        {DAYS.map((day, i) => (
                          <option key={day} value={i}>{day} (April {24 + i})</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => handleAddToMealPlan(recipe)}
                      disabled={adding === recipe.id}
                      className={cn(
                        "w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 active:scale-95",
                        adding === recipe.id 
                          ? "bg-muted text-muted-foreground cursor-not-allowed" 
                          : "bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/10"
                      )}
                    >
                      {adding === recipe.id ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span className="text-[11px]">Add to Meal Plan</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAddToCart(recipe)}
                      disabled={adding === recipe.id}
                      className="w-full py-3 rounded-2xl bg-muted text-foreground font-bold hover:bg-muted/80 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      <ShoppingCart className="w-4 h-4 text-primary" />
                      <span className="text-[11px]">Add Ingredients to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
