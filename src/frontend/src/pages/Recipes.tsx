import { useState, useMemo, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@tanstack/react-router";
import { ALL_RECIPES, type Recipe, getRecipes } from "@/data/recipes";
import { useMealPlans } from "@/hooks/useBackend";

export default function Recipes() {
  const search = useSearch({ from: "/recipes" }) as any;
  const initialDate = search.date || "";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const addToCart = useAddToCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recipes] = useState(() => getRecipes()); // Use getRecipes to include custom recipes
  const [selectedRecipeForAnalysis, setSelectedRecipeForAnalysis] = useState<Recipe | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecipeForm, setNewRecipeForm] = useState<Partial<Recipe>>({
    title: "",
    category: "Lunch",
    time: "20 min",
    serves: 2,
    calories: "200 kcal",
    protein: "10g",
    fat: "5g",
    carbs: "30g",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    ingredients: [],
    instructions: []
  });
  const [newIngredient, setNewIngredient] = useState({ name: "", qty: 1 });
  const [newStep, setNewStep] = useState("");

  const handleAddRecipe = () => {
    if (!newRecipeForm.title) {
      toast.error("Please enter a title");
      return;
    }
    const recipes_ = getRecipes();
    const newRecipe = {
      ...newRecipeForm,
      id: "custom-" + Date.now(),
      ingredients: newRecipeForm.ingredients || [],
      instructions: newRecipeForm.instructions || []
    } as Recipe;
    
    const updated = [...recipes_, newRecipe];
    const custom = updated.filter(r => !ALL_RECIPES.some(ir => ir.id === r.id));
    localStorage.setItem("nexgro_custom_recipes", JSON.stringify(custom));
    
    // Refresh local state
    window.location.reload(); // Quickest way to refresh all references
    toast.success("New recipe added to your collection! 👨‍🍳");
    setIsAddModalOpen(false);
  };

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
    const newPlans = [...existing, newPlan];
    localStorage.setItem("nexgro_meal_plans", JSON.stringify(newPlans));
    
    // Immediate query update for instant feedback
    qc.setQueryData(["meal-plans"], newPlans);
    qc.invalidateQueries({ queryKey: ["meal-plans"] });
    toast.success(`"${recipe.title}" added to your Meal Plan for ${dateStr}! 📅`);
    navigate({ 
      to: "/meal-planner",
      search: { date: dateStr }
    });
  };

  const firstSixRecipes = filteredRecipes.slice(0, 6);
  const remainingRecipes = filteredRecipes.slice(6);

  const { data: mealPlans } = useMealPlans();
  const plannedForToday = useMemo(() => {
    if (!initialDate) return [];
    return mealPlans?.filter(mp => mp.plannedDate === initialDate) || [];
  }, [mealPlans, initialDate]);

  return (
    <div className="min-h-screen bg-background pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header with Date context */}
        {initialDate && (
          <div className="bg-[#007000]/5 border-2 border-[#007000]/10 p-4 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#007000] text-white rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#007000]/60">Planning for</p>
                <p className="text-sm font-black text-[#007000]">{new Date(initialDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            {plannedForToday.length > 0 && (
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#007000]/60">{plannedForToday.length} Recipes</p>
                <p className="text-xs font-bold text-[#007000]">already planned</p>
              </div>
            )}
          </div>
        )}
        {/* Navigation & Search Bar at Top */}
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => {
              navigate({ 
                to: "/meal-planner",
                search: { date: initialDate || undefined }
              });
              // Direct fallback if router fails
              window.location.href = "/meal-planner";
            }}
            className="w-12 h-12 bg-white border-2 border-[#d3e6d3] text-[#006400] rounded-2xl flex items-center justify-center hover:bg-[#f8fbf8] transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006400] group-focus-within:scale-110 transition-transform" />
            <input
              type="text"
              placeholder="Search groceries, essentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8fbf8] border-2 border-[#d3e6d3] pl-12 pr-12 py-3 rounded-full text-xs font-semibold placeholder:text-[#8ba38b] shadow-[0_2px_10px_rgba(0,100,0,0.02)] focus:border-[#006400]/40 focus:bg-white outline-none transition-all group-focus-within:ring-4 group-focus-within:ring-[#006400]/5"
            />
            <button
              onClick={startListening}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all",
                isListening ? "bg-destructive text-white animate-pulse" : "text-[#006400] hover:bg-[#006400]/5"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-12 h-12 bg-[#007000] text-white rounded-2xl flex items-center justify-center hover:opacity-90 transition-all shadow-lg shadow-[#007000]/20 shrink-0 active:scale-95"
            title="Add Custom Recipe"
          >
            <Plus className="w-6 h-6" />
          </button>
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
              defaultDate={initialDate}
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
                defaultDate={initialDate}
              />
            ))}
          </div>
        )}
      </div>
      {/* Recipe Analysis Modal */}
      {selectedRecipeForAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedRecipeForAnalysis(null)}
          />
          <div className="relative bg-background w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Modal Hero Header */}
            <div className="relative h-72 shrink-0">
              <img 
                src={selectedRecipeForAnalysis.image} 
                alt={selectedRecipeForAnalysis.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
              
              {/* Floating Category Tag */}
              <div className="absolute top-8 left-8">
                <div className="bg-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                  {selectedRecipeForAnalysis.category}
                </div>
              </div>

              <div className="absolute bottom-10 left-10 right-10">
                <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none drop-shadow-sm">
                  {selectedRecipeForAnalysis.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedRecipeForAnalysis(null)}
                className="absolute top-8 right-8 p-3 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md rounded-2xl transition-all z-10 border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto flex-1 custom-scrollbar">
              <div className="max-w-xl mx-auto space-y-12 pb-12">
                {/* Stats Row */}
                <div className="flex items-center justify-between py-6 border-y border-border/50">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Time</p>
                    <p className="text-lg font-black text-foreground">{selectedRecipeForAnalysis.time}</p>
                  </div>
                  <div className="w-px h-8 bg-border/50" />
                  <div className="text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Serves</p>
                    <p className="text-lg font-black text-foreground">{selectedRecipeForAnalysis.serves}</p>
                  </div>
                  <div className="w-px h-8 bg-border/50" />
                  <div className="text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Calories</p>
                    <p className="text-lg font-black text-foreground">{selectedRecipeForAnalysis.calories}</p>
                  </div>
                </div>

                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                      Products
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipeForAnalysis.ingredients.map((ing, i) => (
                      <div 
                        key={i} 
                        className="px-5 py-3 bg-muted/30 border border-border/50 rounded-2xl text-sm font-bold text-foreground hover:bg-primary/5 hover:border-primary/20 transition-all"
                      >
                        {ing.name}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                      <ChefHat className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                      Preparation
                    </h3>
                  </div>
                  <div className="space-y-8 relative">
                    {/* Vertical Line Connector */}
                    <div className="absolute left-4 top-4 bottom-4 w-px bg-gradient-to-b from-primary/30 via-primary/5 to-transparent" />
                    
                    {selectedRecipeForAnalysis.instructions.map((step, i) => (
                      <div key={i} className="flex gap-6 relative group">
                        <div className="shrink-0 w-8 h-8 bg-background border-2 border-primary/20 rounded-full flex items-center justify-center text-[10px] font-black text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all z-10">
                          {i + 1}
                        </div>
                        <div className="pt-1">
                          <p className="text-base font-medium leading-relaxed text-foreground group-hover:text-primary transition-colors">
                            {step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Recipe Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-background w-full max-w-xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl border border-border flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-border flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-foreground">Create New Recipe</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Grandma's Secret Pasta" 
                  className="w-full bg-muted/50 border-2 border-border p-4 rounded-2xl font-bold focus:border-[#007000] outline-none transition-all"
                  value={newRecipeForm.title}
                  onChange={e => setNewRecipeForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Category</label>
                  <select 
                    className="w-full bg-muted/50 border-2 border-border p-4 rounded-2xl font-bold focus:border-[#007000] outline-none transition-all"
                    value={newRecipeForm.category}
                    onChange={e => setNewRecipeForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snacks</option>
                    <option>Desserts</option>
                    <option>Drinks</option>
                    <option>Indian Favorites</option>
                    <option>Street Food</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 25 min" 
                    className="w-full bg-muted/50 border-2 border-border p-4 rounded-2xl font-bold focus:border-[#007000] outline-none transition-all"
                    value={newRecipeForm.time}
                    onChange={e => setNewRecipeForm(f => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Ingredients</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ingredient name" 
                    className="flex-1 bg-muted/50 border-2 border-border p-4 rounded-2xl font-bold focus:border-[#007000] outline-none transition-all"
                    value={newIngredient.name}
                    onChange={e => setNewIngredient(i => ({ ...i, name: e.target.value }))}
                  />
                  <input 
                    type="number" 
                    className="w-24 bg-muted/50 border-2 border-border p-4 rounded-2xl font-bold focus:border-[#007000] outline-none transition-all"
                    value={newIngredient.qty}
                    onChange={e => setNewIngredient(i => ({ ...i, qty: Number(e.target.value) }))}
                  />
                  <button 
                    onClick={() => {
                      if (!newIngredient.name) return;
                      setNewRecipeForm(f => ({ ...f, ingredients: [...(f.ingredients || []), { ...newIngredient, id: "p-" + Date.now() }] }));
                      setNewIngredient({ name: "", qty: 1 });
                    }}
                    className="bg-[#007000] text-white p-4 rounded-2xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newRecipeForm.ingredients?.map((ing, i) => (
                    <div key={i} className="bg-muted px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                      {ing.name} ({ing.qty})
                      <button onClick={() => setNewRecipeForm(f => ({ ...f, ingredients: f.ingredients?.filter((_, idx) => idx !== i) }))} className="text-destructive"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Cooking Steps</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Describe step..." 
                    className="flex-1 bg-muted/50 border-2 border-border p-4 rounded-2xl font-bold focus:border-[#007000] outline-none transition-all"
                    value={newStep}
                    onChange={e => setNewStep(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      if (!newStep) return;
                      setNewRecipeForm(f => ({ ...f, instructions: [...(f.instructions || []), newStep] }));
                      setNewStep("");
                    }}
                    className="bg-[#007000] text-white p-4 rounded-2xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {newRecipeForm.instructions?.map((step, i) => (
                    <div key={i} className="bg-muted/30 p-3 rounded-xl text-xs font-medium flex items-start gap-3">
                      <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shrink-0 text-[10px]">{i+1}</span>
                      <span className="flex-1">{step}</span>
                      <button onClick={() => setNewRecipeForm(f => ({ ...f, instructions: f.instructions?.filter((_, idx) => idx !== i) }))} className="text-destructive"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleAddRecipe}
                  className="w-full bg-[#007000] text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-[#007000]/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Save Recipe to My Collection
                </button>
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
    </div>
  );
}

function RecipeCard({ 
  recipe, 
  adding, 
  handleAddToCart, 
  handleAddToMealPlan,
  onAnalyse,
  defaultDate
}: { 
  recipe: Recipe; 
  adding: string | null; 
  handleAddToCart: (r: Recipe) => void;
  handleAddToMealPlan: (r: Recipe, date?: string) => void;
  onAnalyse: (r: Recipe) => void;
  defaultDate?: string;
}) {
  const [plannedDate, setPlannedDate] = useState<string>(defaultDate || "");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultDate) setPlannedDate(defaultDate);
  }, [defaultDate]);

  return (
    <div className="group bg-background rounded-[2.5rem] overflow-hidden border border-border/50 hover:border-[#007000]/30 hover:shadow-2xl hover:shadow-[#007000]/5 transition-all duration-500 flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 backdrop-blur-md text-[#007000] border-none font-black text-[10px] px-3 py-1.5 rounded-full shadow-lg">
            {recipe.category}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col">
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

        <div className="flex gap-2 pt-2 mt-auto">
          <button
            onClick={() => handleAddToMealPlan(recipe, plannedDate || undefined)}
            className="flex-1 bg-[#007000] text-white h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#007000]/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" /> 
            {plannedDate ? `Add for ${plannedDate.split('-').slice(1).join('/')}` : "Add to Meal Planner"}
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
              onClick={() => {
                if (dateInputRef.current) {
                  if ('showPicker' in dateInputRef.current) {
                    (dateInputRef.current as any).showPicker();
                  } else {
                    (dateInputRef.current as any).click();
                  }
                }
              }}
              className={cn(
                "w-12 h-12 border-2 rounded-2xl flex items-center justify-center active:scale-95 transition-all",
                plannedDate 
                  ? "bg-[#007000]/10 border-[#007000] text-[#007000]" 
                  : "bg-white border-border text-foreground hover:border-[#007000] hover:text-[#007000]"
              )}
              title="Select a Specific Date"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <input 
              ref={dateInputRef}
              type="date"
              className="absolute inset-0 opacity-0 -z-10"
              onChange={(e) => {
                if (e.target.value) {
                  setPlannedDate(e.target.value);
                  toast.success(`Date set to ${e.target.value}. Click "Add" to confirm!`);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
