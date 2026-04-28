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
    ingredients: [{ id: "p13", name: "Potatoes", qty: 2 }, { id: "p14", name: "Onion", qty: 1 }],
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
    ingredients: [{ id: "p15", name: "Carrot", qty: 1 }, { id: "p1", name: "Tomato", qty: 2 }],
    instructions: ["Steam idlis in a mold for 10 mins.", "Heat sambar with fresh vegetables.", "Serve hot with coconut chutney."]
  },
  {
    id: "b3",
    title: "Kerala Puttu & Kadala",
    category: "Breakfast",
    time: "25 min",
    serves: 2,
    calories: "410 kcal",
    protein: "14g",
    fat: "12g",
    carbs: "62g",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=800&q=80",
    ingredients: [{ id: "p23", name: "Rice Powder", qty: 1 }, { id: "p24", name: "Black Chickpeas", qty: 1 }],
    instructions: ["Steam rice powder with coconut layers.", "Prepare spicy chickpea curry.", "Serve hot together."]
  },
  {
    id: "b4",
    title: "Rava Upma",
    category: "Breakfast",
    time: "15 min",
    serves: 2,
    calories: "260 kcal",
    protein: "6g",
    fat: "8g",
    carbs: "45g",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=800&q=80",
    ingredients: [{ id: "p25", name: "Semolina", qty: 1 }, { id: "p26", name: "Veggies", qty: 1 }],
    instructions: ["Roast semolina until fragrant.", "Sauté veggies and add water.", "Stir in semolina and cook until soft."]
  },
  {
    id: "b5",
    title: "Aloo Paratha",
    category: "Breakfast",
    time: "30 min",
    serves: 2,
    calories: "380 kcal",
    protein: "9g",
    fat: "15g",
    carbs: "52g",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80",
    ingredients: [{ id: "p27", name: "Wheat Flour", qty: 1 }, { id: "p13", name: "Potatoes", qty: 1 }],
    instructions: ["Stuff dough with spiced mashed potatoes.", "Roll out and cook on tawa with ghee.", "Serve with curd and pickle."]
  },

  // LUNCH
  {
    id: "l1",
    title: "Chicken Biryani",
    category: "Lunch",
    time: "45 min",
    serves: 4,
    calories: "650 kcal",
    protein: "35g",
    fat: "25g",
    carbs: "75g",
    image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=800&q=80",
    ingredients: [{ id: "p7", name: "Basmati Rice", qty: 2 }, { id: "p8", name: "Chicken", qty: 1 }],
    instructions: ["Marinate chicken with spices.", "Layer rice and chicken.", "Cook on dum for 20 mins."]
  },
  {
    id: "l2",
    title: "Fish Curry (Kerala Style)",
    category: "Lunch",
    time: "30 min",
    serves: 3,
    calories: "420 kcal",
    protein: "28g",
    fat: "22g",
    carbs: "12g",
    image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&q=80",
    ingredients: [{ id: "p62", name: "King Fish", qty: 1 }, { id: "p6", name: "Coconut Milk", qty: 1 }],
    instructions: ["Sauté shallots and spices in clay pot.", "Add coconut milk and fish pieces.", "Simmer with kudampuli until thick."]
  },
  {
    id: "l3",
    title: "Vegetable Thali",
    category: "Lunch",
    time: "40 min",
    serves: 1,
    calories: "750 kcal",
    protein: "20g",
    fat: "28g",
    carbs: "95g",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    ingredients: [{ id: "p10", name: "Rice", qty: 1 }, { id: "p11", name: "Dal & Veggies", qty: 1 }],
    instructions: ["Cook rice and various vegetable dishes.", "Serve with sambar, rasam, and curd.", "Finish with papad and sweet."]
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
    ingredients: [{ id: "p12", name: "Paneer", qty: 1 }, { id: "p13", name: "Tomato", qty: 1 }],
    instructions: ["Saute onions and ginger-garlic.", "Add tomato puree and spices.", "Add paneer and finish with cream."]
  },
  {
    id: "d2",
    title: "Chicken Roast",
    category: "Dinner",
    time: "35 min",
    serves: 3,
    calories: "510 kcal",
    protein: "38g",
    fat: "30g",
    carbs: "15g",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80",
    ingredients: [{ id: "p8", name: "Chicken", qty: 1 }, { id: "p14", name: "Onion", qty: 1 }],
    instructions: ["Marinate chicken pieces.", "Slow roast with plenty of onions.", "Add curry leaves for aroma."]
  },
  {
    id: "d3",
    title: "Vegetable Noodles",
    category: "Dinner",
    time: "15 min",
    serves: 2,
    calories: "340 kcal",
    protein: "8g",
    fat: "10g",
    carbs: "55g",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80",
    ingredients: [{ id: "p28", name: "Noodles", qty: 1 }, { id: "p15", name: "Carrots/Beans", qty: 1 }],
    instructions: ["Boil noodles until al dente.", "Stir fry veggies on high heat.", "Toss with noodles and soy sauce."]
  },

  // SNACKS
  {
    id: "s1",
    title: "Crispy Samosa",
    category: "Snacks",
    time: "30 min",
    serves: 4,
    calories: "180 kcal",
    protein: "4g",
    fat: "10g",
    carbs: "22g",
    image: "https://images.unsplash.com/photo-1601050633647-81a3104192df?w=800&q=80",
    ingredients: [{ id: "p16", name: "Samosa Sheet", qty: 1 }, { id: "p13", name: "Potato", qty: 1 }],
    instructions: ["Fill sheets with spiced potato.", "Fold into triangles.", "Deep fry until golden."]
  },
  {
    id: "s2",
    title: "Onion Pakora",
    category: "Snacks",
    time: "20 min",
    serves: 3,
    calories: "220 kcal",
    protein: "5g",
    fat: "14g",
    carbs: "18g",
    image: "https://images.unsplash.com/photo-1601050633647-81a3104192df?w=800&q=80",
    ingredients: [{ id: "p14", name: "Onion", qty: 1 }, { id: "p29", name: "Gram Flour", qty: 1 }],
    instructions: ["Slice onions thinly.", "Mix with flour and spices.", "Deep fry small portions."]
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
    ingredients: [{ id: "p18", name: "Khoya", qty: 1 }, { id: "p19", name: "Sugar", qty: 1 }],
    instructions: ["Make balls from khoya.", "Fry until dark brown.", "Soak in sugar syrup."]
  },
  {
    id: "ds2",
    title: "Rice Payasam",
    category: "Desserts",
    time: "40 min",
    serves: 5,
    calories: "290 kcal",
    protein: "6g",
    fat: "10g",
    carbs: "45g",
    image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=800&q=80",
    ingredients: [{ id: "p4", name: "Milk", qty: 1 }, { id: "p7", name: "Basmati Rice", qty: 1 }],
    instructions: ["Boil rice in milk until soft.", "Add sugar and cardamom.", "Garnish with roasted nuts."]
  },

  // HEALTHY
  {
    id: "h1",
    title: "Fresh Fruit Bowl",
    category: "Healthy",
    time: "10 min",
    serves: 1,
    calories: "150 kcal",
    protein: "2g",
    fat: "0g",
    carbs: "38g",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    ingredients: [{ id: "p1", name: "Tomato", qty: 1 }, { id: "p2", name: "Avocado", qty: 1 }],
    instructions: ["Chop seasonal fruits.", "Mix with a dash of honey.", "Serve chilled."]
  },
  {
    id: "h2",
    title: "Mixed Sprouts Salad",
    category: "Healthy",
    time: "15 min",
    serves: 2,
    calories: "180 kcal",
    protein: "12g",
    fat: "2g",
    carbs: "25g",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    ingredients: [{ id: "p30", name: "Sprouts", qty: 1 }, { id: "p14", name: "Onion", qty: 1 }],
    instructions: ["Steam sprouts lightly.", "Mix with chopped onion and tomato.", "Add lemon juice and salt."]
  }
];

const CATEGORIES = [
  { name: "Breakfast", icon: Clock, color: "text-amber-500" },
  { name: "Lunch", icon: Utensils, color: "text-emerald-500" },
  { name: "Dinner", icon: Flame, color: "text-orange-500" },
  { name: "Snacks", icon: ChefHat, color: "text-rose-500" },
  { name: "Desserts", icon: Info, color: "text-purple-500" },
  { name: "Healthy", icon: BookOpen, color: "text-blue-500" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];export default function RecipesPage() {
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
      // Calculate date based on current week
      const now = new Date();
      const currentDay = now.getDay(); // 0 is Sun, 1 is Mon
      const targetDay = dayIndex + 1; // DAYS starts from Mon (1)
      
      const diff = targetDay - (currentDay === 0 ? 7 : currentDay);
      const plannedDate = new Date();
      plannedDate.setDate(now.getDate() + diff);
      
      const dateStr = [plannedDate.getFullYear(), String(plannedDate.getMonth() + 1).padStart(2, '0'), String(plannedDate.getDate()).padStart(2, '0')].join('-');

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
      navigate({ to: "/meal-planner" });
    } catch {
      toast.error("Failed to add to meal planner.");
    } finally {
      setAdding(null);
    }
  };

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

  const handleAnalyzeRecipe = (recipe: Recipe) => {
    toast.info(`Analyzing "${recipe.title}" with Gemini AI... 🤖`, {
      description: "Fetching step-by-step quantity and cooking details."
    });
    // In a real app, this would call Gemini. For now we redirect to meal planner 
    // where we'll show the detailed view we're about to implement.
    navigate({ to: "/meal-planner" });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Search and Filters ABOVE Banner */}
      <div className="bg-background/80 backdrop-blur-xl border-b border-border px-4 py-4 space-y-4">
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
              className="w-full bg-muted/50 border-2 border-transparent rounded-2xl pl-12 pr-14 py-3.5 text-sm font-bold focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
            <button
              onClick={startListening}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl transition-all flex items-center justify-center",
                isListening ? "bg-destructive text-white animate-pulse" : "bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
              )}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          <button 
            onClick={() => navigate({ to: "/meal-planner" })}
            className="hidden sm:flex items-center gap-2 bg-[#007000]/10 text-[#007000] px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-[#007000] hover:text-white transition-all shadow-lg shadow-[#007000]/5"
          >
            <Calendar className="w-4 h-4" />
            My Planner
          </button>
        </div>

        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar px-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
              selectedCategory === "All" 
                ? "bg-[#007000] text-white shadow-lg shadow-[#007000]/20" 
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
                    ? "bg-[#007000] text-white shadow-lg shadow-[#007000]/20" 
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

      {/* Hero Banner (Now Below Search) */}
      <div className="relative h-48 sm:h-64 bg-black overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"
          alt="Chef's Corner"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-700">
            Chef's Corner
          </h1>
          <p className="text-white/70 text-xs sm:text-sm max-w-lg font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Discover hand-picked recipes and plan your weekly meals with ease.
          </p>
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
                  {/* AI Analysis Quick Button */}
                  <button 
                    onClick={() => handleAnalyzeRecipe(recipe)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all"
                    title="Analyze with AI"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Protein</p>
                        <p className="text-xs font-black text-[#007000]">{recipe.protein || "8g"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Carbs</p>
                        <p className="text-xs font-black text-blue-500">{recipe.carbs || "45g"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-[#007000]" />
                      <span className="text-[10px] font-bold">Serves {recipe.serves}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border space-y-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedDays[recipe.id] ?? 0}
                        onChange={(e) => setSelectedDays(prev => ({ ...prev, [recipe.id]: parseInt(e.target.value) }))}
                        className="flex-1 bg-muted border-none rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-[#007000]/20 transition-all"
                      >
                        {DAYS.map((day, i) => (
                          <option key={day} value={i}>{day} (This week)</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleAddToCart(recipe)}
                        disabled={adding === recipe.id + "-cart"}
                        className="p-2 rounded-xl bg-[#007000]/10 text-[#007000] hover:bg-[#007000] hover:text-white transition-all shadow-sm"
                      >
                        {adding === recipe.id + "-cart" ? (
                          <div className="w-4 h-4 border-2 border-[#007000]/30 border-t-[#007000] rounded-full animate-spin" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddToMealPlan(recipe)}
                      disabled={adding === recipe.id}
                      className={cn(
                        "w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 active:scale-95",
                        adding === recipe.id 
                          ? "bg-muted text-muted-foreground cursor-not-allowed" 
                          : "bg-[#007000] text-white hover:opacity-90 shadow-lg shadow-[#007000]/10"
                      )}
                    >
                      {adding === recipe.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span className="text-[11px]">Add to Meal Plan</span>
                        </>
                      )}
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
