import ProductCard from "@/components/ProductCard";
import { useSearchProducts, useWishlist } from "@/hooks/useBackend";
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from "@/types";
import type { ProductFilters } from "@/types";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search as SearchIcon, SlidersHorizontal, Star, X, Mic, MicOff, Filter, ChevronDown, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const RECENTLY_VIEWED_KEY = "nexgro_recently_viewed";

export default function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("rating");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get("q");
    if (q) setQuery(q);
  }, []);

  const filters: ProductFilters = useMemo(
    () => ({
      searchQuery: query,
      categoryId: selectedCategoryId || undefined,
    }),
    [query, selectedCategoryId],
  );

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
      setQuery(transcript);
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

  const { data: apiResults } = useSearchProducts(query, filters);
  const { data: wishlistItems } = useWishlist();

  const wishlistedIds = useMemo(
    () => new Set((wishlistItems ?? []).map((w) => w.productId)),
    [wishlistItems],
  );

  const localResults = useMemo(() => {
    let res = [...SAMPLE_PRODUCTS];
    if (query.trim()) {
      res = res.filter((p) => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (selectedCategoryId) {
      res = res.filter(p => p.categoryId === selectedCategoryId);
    }
    if (onlyInStock) {
      res = res.filter(p => p.stockQty > 0);
    }
    if (onlyOffers) {
      res = res.filter(p => p.isFeatured || p.isBestSeller);
    }
    res = res.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) res = res.filter(p => p.rating >= minRating);
    
    res.sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });
    return res;
  }, [query, priceRange, minRating, sort, selectedCategoryId, onlyInStock, onlyOffers]);

  const results = apiResults && apiResults.length > 0 ? apiResults : localResults;
  const hasQuery = query.trim().length > 0;

  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="search.page">
      {/* Premium Search Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40 shadow-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="relative flex-1 group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groceries, essentials..."
              className="w-full bg-muted/50 border-2 border-transparent rounded-2xl pl-12 pr-12 py-3 text-sm font-bold focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
            {query && (
              <button
                onClick={clearQuery}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
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
          <button
            onClick={() => setShowFilters(true)}
            className="p-3 bg-card border-2 border-border rounded-2xl text-primary hover:bg-muted transition-all active:scale-95 md:hidden"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Restored Original Banner */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="relative overflow-hidden rounded-[2rem] aspect-video sm:aspect-[3/2] md:aspect-[8/2] bg-muted shadow-lg group">
          <img 
            src="/assets/banner2.png" 
            alt="Search Banner" 
            className="w-full h-full object-cover object-left sm:object-center transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-64 shrink-0">
            {/* ... desktop filters remain the same ... */}
            <div className="bg-card rounded-[2rem] border border-border p-6 sticky top-28 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Refine Search</h3>
              </div>
              
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-3">Category</p>
                  <select 
                    value={selectedCategoryId} 
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="w-full bg-muted/50 border-none rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">All Categories</option>
                    {SAMPLE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-3">Sort By</p>
                  <select 
                    value={sort} 
                    onChange={e => setSort(e.target.value)}
                    className="w-full bg-muted/50 border-none rounded-xl text-xs font-bold p-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="rating">Top Rated</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Price Range</p>
                    <span className="text-xs font-black text-primary">₹{priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" min="0" max="2000" value={priceRange[1]} 
                    onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-3">Quick Filters</p>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={onlyInStock} 
                          onChange={e => setOnlyInStock(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-border rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all" />
                        <X className="absolute inset-0 m-auto w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">In Stock Only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={onlyOffers} 
                          onChange={e => setOnlyOffers(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-border rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all" />
                        <X className="absolute inset-0 m-auto w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">Best Sellers</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={minRating >= 4} 
                          onChange={e => setMinRating(e.target.checked ? 4 : 0)}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-border rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all" />
                        <X className="absolute inset-0 m-auto w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">Top Rated (4+)</span>
                    </label>
                  </div>
                </div>

                <button 
                  onClick={() => { 
                    setPriceRange([0, 1000]); 
                    setMinRating(0); 
                    setSort("rating"); 
                    setSelectedCategoryId(""); 
                    setOnlyInStock(false);
                    setOnlyOffers(false);
                  }}
                  className="w-full py-3 rounded-xl bg-muted text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <main className="flex-1 min-w-0">
            {results.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-muted/30 px-6 py-4 rounded-2xl">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Showing <span className="text-foreground">{results.length}</span> Results
                  </p>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Marketplace</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {results.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i + 1}
                      isWishlisted={wishlistedIds.has(product.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                  <SearchIcon className="w-10 h-10 text-muted-foreground opacity-30" />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2">No items found</h3>
                <p className="text-sm text-muted-foreground max-w-xs font-medium">
                  We couldn't find anything matching your search. Try different keywords or filters.
                </p>
                <button 
                  onClick={clearQuery}
                  className="mt-6 px-6 py-3 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Clear Search
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[3rem] p-8 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 shadow-2xl">
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black tracking-tight">Refine</h3>
              <button onClick={() => setShowFilters(false)} className="p-3 bg-muted rounded-2xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-8 pb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-muted-foreground">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedCategoryId("")}
                      className={cn(
                        "px-5 py-3 rounded-2xl text-xs font-bold border-2 transition-all",
                        selectedCategoryId === "" ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "border-border"
                      )}
                    >
                      All
                    </button>
                    {SAMPLE_CATEGORIES.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => setSelectedCategoryId(c.id)}
                        className={cn(
                          "px-5 py-3 rounded-2xl text-xs font-bold border-2 transition-all",
                          selectedCategoryId === c.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "border-border"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-muted-foreground">Sort By</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "rating", label: "Top Rated" },
                      { id: "price_asc", label: "Price: Low to High" },
                      { id: "price_desc", label: "Price: High to Low" }
                    ].map(s => (
                      <button 
                        key={s.id}
                        onClick={() => setSort(s.id)}
                        className={cn(
                          "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all",
                          sort === s.id ? "bg-primary border-primary text-white shadow-md shadow-primary/20" : "border-border"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max Budget</p>
                    <span className="text-sm font-black text-primary">₹{priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" min="0" max="2000" value={priceRange[1]} 
                    onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-primary h-2 bg-muted rounded-full appearance-none"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-4 text-muted-foreground">Quick Filters</p>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => setOnlyInStock(!onlyInStock)}
                      className={cn(
                        "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all",
                        onlyInStock ? "bg-primary border-primary text-white" : "border-border"
                      )}
                    >
                      In Stock Only
                    </button>
                    <button 
                      onClick={() => setOnlyOffers(!onlyOffers)}
                      className={cn(
                        "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all",
                        onlyOffers ? "bg-primary border-primary text-white" : "border-border"
                      )}
                    >
                      Best Sellers
                    </button>
                    <button 
                      onClick={() => setMinRating(minRating === 4 ? 0 : 4)}
                      className={cn(
                        "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border-2 transition-all",
                        minRating >= 4 ? "bg-primary border-primary text-white" : "border-border"
                      )}
                    >
                      Rating 4+
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => { 
                        setPriceRange([0, 1000]); 
                        setSelectedCategoryId(""); 
                        setOnlyInStock(false);
                        setOnlyOffers(false);
                        setSort("rating");
                        setMinRating(0);
                    }}
                    className="flex-1 py-4 bg-muted rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="flex-[2] py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
