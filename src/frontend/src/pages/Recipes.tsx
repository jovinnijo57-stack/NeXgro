import { useState } from "react";
import { ArrowLeft, Search, Clock, Users, Flame, ShoppingCart, CheckCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SAMPLE_PRODUCTS } from "@/types";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const RECIPES = [
  {
    id: "r1",
    title: "Fresh Avocado Toast with Organic Tomatoes",
    time: "15 min",
    serves: 2,
    calories: "320 kcal",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
    ingredients: [
      { id: "p2", name: "Organic Hass Avocado", qty: 2 },
      { id: "p1", name: "Fresh Organic Tomatoes", qty: 1 },
      { id: "p6", name: "Sourdough Loaf", qty: 1 },
    ],
    instructions: ["Toast the sourdough slices.", "Mash avocados with salt and pepper.", "Top with sliced tomatoes."]
  },
  {
    id: "r2",
    title: "Classic Sourdough French Toast",
    time: "25 min",
    serves: 4,
    calories: "450 kcal",
    image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=800",
    ingredients: [
      { id: "p4", name: "Whole Milk 1L", qty: 1 },
      { id: "p6", name: "Sourdough Loaf", qty: 1 },
      { id: "p8", name: "Orange Juice 1L", qty: 1 },
    ],
    instructions: ["Mix milk and eggs.", "Dip sourdough slices.", "Fry until golden brown."]
  }
];

export default function RecipesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const addToCart = useAddToCart();
  const [adding, setAdding] = useState<string | null>(null);

  const handleCookThis = async (recipe: typeof RECIPES[0]) => {
    setAdding(recipe.id);
    try {
      for (const ing of recipe.ingredients) {
        await addToCart.mutateAsync({ productId: ing.id, qty: ing.qty });
      }
      toast.success(`All ingredients for "${recipe.title}" added to cart! 🛒`);
    } catch {
      toast.error("Failed to add ingredients.");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: "/home" })} className="p-2 hover:bg-muted rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-xl text-foreground">Chef's Corner</h1>
          </div>
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted border-none rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {RECIPES.map((recipe) => (
            <div key={recipe.id} className="group bg-card border border-border rounded-3xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                  {recipe.calories}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {recipe.time}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {recipe.serves} Serves</span>
                  <span className="flex items-center gap-1.5 text-primary"><Flame className="w-3.5 h-3.5" /> Easy</span>
                </div>

                <h2 className="font-display text-2xl font-bold text-foreground leading-tight">{recipe.title}</h2>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ingredients included:</p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.map((ing) => (
                      <span key={ing.id} className="px-3 py-1.5 bg-muted rounded-xl text-[10px] font-medium border border-border">
                        {ing.qty}x {ing.name}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleCookThis(recipe)}
                  disabled={adding === recipe.id}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95",
                    adding === recipe.id 
                      ? "bg-muted text-muted-foreground cursor-not-allowed" 
                      : "bg-primary text-white hover:bg-primary/90 shadow-primary/25"
                  )}
                >
                  {adding === recipe.id ? (
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Cook this: Add all to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
