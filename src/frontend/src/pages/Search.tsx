import ProductCard from "@/components/ProductCard";
import { useSearchProducts, useWishlist } from "@/hooks/useBackend";
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from "@/types";
import type { ProductFilters } from "@/types";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search as SearchIcon, SlidersHorizontal, Star, X, Mic, Filter, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const RECENTLY_VIEWED_KEY = "nexgro_recently_viewed";

function getRecentlyViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("rating");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);

  // Auto-focus on mount and read URL param
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
      toast.error("Voice search not supported");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };
    recognition.start();
  };

  const { data: apiResults } = useSearchProducts(query, filters);
  const { data: wishlistItems } = useWishlist();

  const wishlistedIds = useMemo(
    () => new Set((wishlistItems ?? []).map((w) => w.productId)),
    [wishlistItems],
  );

  // Local filter on sample data when query is active
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
      res = res.filter(p => p.isFeatured || p.isBestSeller); // Assuming these have offers
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

  const results =
    apiResults && apiResults.length > 0 ? apiResults : localResults;
  const hasQuery = query.trim().length > 0;

  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="search.page">
      {/* Search header */}
      <div className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for groceries, brands..."
                aria-label="Search products"
                className="w-full pl-10 pr-10 py-3 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                data-ocid="search.search_input"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
              <button
                type="button"
                onClick={startListening}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors",
                  isListening ? "bg-primary text-primary-foreground animate-pulse" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="md:hidden p-3 bg-card border border-border rounded-xl text-primary"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="relative overflow-hidden rounded-2xl aspect-[2/1] md:aspect-[8/2] bg-muted shadow-md group">
          <img 
            src="/assets/banner2.png" 
            alt="Search Banner" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="bg-card rounded-2xl border border-border p-4 sticky top-28">
              <h3 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider">Filters</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Category</p>
                  <select 
                    value={selectedCategoryId} 
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="w-full bg-muted/50 border-none rounded-lg text-xs p-2 outline-none"
                  >
                    <option value="">All Categories</option>
                    {SAMPLE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Sort By</p>
                  <select 
                    value={sort} 
                    onChange={e => setSort(e.target.value)}
                    className="w-full bg-muted/50 border-none rounded-lg text-xs p-2 outline-none"
                  >
                    <option value="rating">Top Rated</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Price Range</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold">₹{priceRange[0]}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-xs font-bold">₹{priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1000" value={priceRange[1]} 
                    onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-primary h-1"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Min Rating</p>
                  <div className="flex flex-col gap-1">
                    {[5, 4, 3].map(star => (
                      <button 
                        key={star}
                        onClick={() => setMinRating(star)}
                        className={cn(
                          "flex items-center gap-1.5 text-xs p-1.5 rounded-lg transition-colors",
                          minRating === star ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                      >
                        <Star className={cn("w-3 h-3", minRating >= star ? "fill-primary text-primary" : "text-muted-foreground")} />
                        {star} & up
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Availability</p>
                  <label className="flex items-center gap-2 cursor-pointer group mb-2">
                    <input 
                      type="checkbox" 
                      checked={onlyInStock} 
                      onChange={e => setOnlyInStock(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-xs text-foreground group-hover:text-primary transition-colors">In Stock Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={onlyOffers} 
                      onChange={e => setOnlyOffers(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-xs text-foreground group-hover:text-primary transition-colors">Special Offers</span>
                  </label>
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
                  className="text-[10px] text-primary font-bold uppercase hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {hasQuery || results.length > 0 ? (
              <>
                {/* Results header */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {results.length}
                    </span>{" "}
                    result{results.length !== 1 ? "s" : ""}
                    {query && (
                      <> for <span className="font-semibold text-foreground">"{query}"</span></>
                    )}
                  </p>
                </div>

                {results.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-20 text-center"
                    data-ocid="search.empty_state"
                  >
                    <span className="text-6xl mb-4">🔍</span>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      No results found
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                      Try adjusting your filters or using different keywords.
                    </p>
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                    data-ocid="search.results_grid"
                  >
                    {results.map((product, i) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={i + 1}
                        isWishlisted={wishlistedIds.has(product.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <SearchIcon className="w-12 h-12 mb-4 opacity-20" />
                <p>Start typing to search for products</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-muted rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-8 pb-8">
                <div>
                  <p className="text-xs font-bold uppercase mb-3 text-muted-foreground">Category</p>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedCategoryId("")}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm border transition-all",
                        selectedCategoryId === "" ? "bg-primary border-primary text-white" : "border-border"
                      )}
                    >
                      All
                    </button>
                    {SAMPLE_CATEGORIES.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => setSelectedCategoryId(c.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm border transition-all",
                          selectedCategoryId === c.id ? "bg-primary border-primary text-white" : "border-border"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase mb-3 text-muted-foreground">Sort By</p>
                  <div className="flex flex-wrap gap-2">
                    {["rating", "price_asc", "price_desc"].map(s => (
                      <button 
                        key={s}
                        onClick={() => setSort(s)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm border transition-all",
                          sort === s ? "bg-primary border-primary text-white" : "border-border"
                        )}
                      >
                        {s === "rating" ? "Top Rated" : s === "price_asc" ? "Price: Low to High" : "Price: High to Low"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase text-muted-foreground">Max Price</p>
                    <span className="text-sm font-bold text-primary">₹{priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1000" value={priceRange[1]} 
                    onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-primary h-2"
                  />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase mb-3 text-muted-foreground">Min Rating</p>
                  <div className="flex gap-2">
                    {[5, 4, 3].map(star => (
                      <button 
                        key={star}
                        onClick={() => setMinRating(star)}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-sm border transition-all flex items-center justify-center gap-1.5",
                          minRating === star ? "bg-primary border-primary text-white" : "border-border"
                        )}
                      >
                        {star}<Star className={cn("w-3.5 h-3.5", minRating === star ? "fill-white" : "")} />
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20" onClick={() => setShowFilters(false)}>
                  Show {results.length} results
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
