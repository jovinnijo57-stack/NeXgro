import ProductCard from "@/components/ProductCard";
import { useSearchProducts, useWishlist } from "@/hooks/useBackend";
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from "@/types";
import type { ProductFilters } from "@/types";
import { Link } from "@tanstack/react-router";
import { Search as SearchIcon, SlidersHorizontal, Star, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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
    }),
    [query],
  );

  const { data: apiResults } = useSearchProducts(query, filters);
  const { data: wishlistItems } = useWishlist();

  const wishlistedIds = useMemo(
    () => new Set((wishlistItems ?? []).map((w) => w.productId)),
    [wishlistItems],
  );

  // Local filter on sample data when query is active
  const localResults = useMemo(() => {
    if (!query.trim()) return [];
    return SAMPLE_PRODUCTS.filter((p) => {
      const matchQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());
      return matchQuery;
    });
  }, [query]);

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
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  aria-label="Clear search"
                  data-ocid="search.clear_button"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="relative overflow-hidden rounded-2xl aspect-[21/5] md:aspect-[6/1] bg-muted shadow-md group">
          <img 
            src="/assets/banner2.png" 
            alt="Search Banner" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        {hasQuery ? (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {results.length}
                </span>{" "}
                result{results.length !== 1 ? "s" : ""} for{" "}
                <span className="font-semibold text-foreground">"{query}"</span>
              </p>
            </div>

            {results.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-20 text-center"
                data-ocid="search.empty_state"
              >
                <span className="text-6xl mb-4">🔍</span>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  No results for "{query}"
                </h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                  Try checking your spelling or using different keywords.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {["Tomatoes", "Milk", "Bread", "Eggs", "Yogurt"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQuery(s)}
                      className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
                      data-ocid={`search.suggestion.${s.toLowerCase()}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
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
      </div>
    </div>
  );
}
