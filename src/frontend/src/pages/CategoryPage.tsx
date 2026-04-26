import ProductCard from "@/components/ProductCard";
import { useCategories, useProducts, useWishlist } from "@/hooks/useBackend";
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from "@/types";
import type { Product, ProductFilters } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  Filter,
  LayoutGrid,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const PAGE_SIZE = 20;
type SortKey = "price_asc" | "price_desc" | "rating" | "newest";

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Newest First", value: "newest" },
];

function StarFilter({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {[5, 4, 3, 2, 1].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(value === star ? 0 : star)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all text-left ${
            value === star
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-foreground"
          }`}
          data-ocid={`category.rating_filter.${star}`}
        >
          <span className="text-accent">
            {"★".repeat(star)}
            {"☆".repeat(5 - star)}
          </span>
          <span className="text-xs opacity-70 ml-1">& up</span>
        </button>
      ))}
    </div>
  );
}

function FilterPanel({
  priceRange,
  onPriceChange,
  minRating,
  onRatingChange,
  onlyInStock,
  onStockChange,
  sort,
  onSortChange,
  onClear,
}: {
  priceRange: [number, number];
  onPriceChange: (v: [number, number]) => void;
  minRating: number;
  onRatingChange: (v: number) => void;
  onlyInStock: boolean;
  onStockChange: (v: boolean) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Sort */}
      <div>
        <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <ChevronDown className="w-3.5 h-3.5 text-primary" />
          Sort By
        </p>
        <div className="flex flex-col gap-0.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSortChange(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                sort === opt.value
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted text-foreground"
              }`}
              data-ocid={`category.sort.${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
          Price Range
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-primary">
            ${priceRange[0]}
          </span>
          <span className="text-xs text-muted-foreground">to</span>
          <span className="text-sm font-semibold text-primary">
            ${priceRange[1]}
          </span>
        </div>
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={100}
            value={priceRange[0]}
            onChange={(e) =>
              onPriceChange([Number(e.target.value), priceRange[1]])
            }
            className="w-full accent-primary h-1.5 cursor-pointer"
            data-ocid="category.price_min_slider"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={priceRange[1]}
            onChange={(e) =>
              onPriceChange([priceRange[0], Number(e.target.value)])
            }
            className="w-full accent-primary h-1.5 cursor-pointer"
            data-ocid="category.price_max_slider"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <span className="text-primary text-sm">★</span>
          Min Rating
        </p>
        <StarFilter value={minRating} onChange={onRatingChange} />
      </div>

      {/* Stock toggle */}
      <div>
        <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
          Availability
        </p>
        <button
          type="button"
          onClick={() => onStockChange(!onlyInStock)}
          className="flex items-center gap-3 w-full"
          data-ocid="category.stock_toggle"
        >
          <div
            className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${
              onlyInStock ? "bg-primary" : "bg-muted border border-border"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-card shadow transition-transform duration-200 ${
                onlyInStock ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </div>
          <span className="text-sm font-medium text-foreground">
            In Stock Only
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="text-sm text-accent hover:text-accent/80 transition-colors underline underline-offset-2 text-left"
        data-ocid="category.clear_filters_button"
      >
        Clear all filters
      </button>
    </div>
  );
}

export default function CategoryPage() {
  const { categoryId } = useParams({ from: "/categories/$categoryId" });

  const [sort, setSort] = useState<SortKey>("rating");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filters: ProductFilters = useMemo(
    () => ({ categoryId, onlyActive: true }),
    [categoryId],
  );

  const { data: apiProducts, isLoading } = useProducts(filters);
  const { data: categories } = useCategories();
  const { data: wishlistItems } = useWishlist();

  const wishlistedIds = useMemo(
    () => new Set((wishlistItems ?? []).map((w) => w.productId)),
    [wishlistItems],
  );

  const allProducts: Product[] = useMemo(() => {
    const base =
      apiProducts && apiProducts.length > 0 ? apiProducts : SAMPLE_PRODUCTS;
    return base.filter((p) => p.categoryId === categoryId);
  }, [apiProducts, categoryId]);

  const categoryInfo = useMemo(() => {
    const cats =
      categories && categories.length > 0 ? categories : SAMPLE_CATEGORIES;
    return cats.find((c) => c.id === categoryId);
  }, [categories, categoryId]);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );
    if (minRating > 0) result = result.filter((p) => p.rating >= minRating);
    if (onlyInStock) result = result.filter((p) => p.stockQty > 0);
    result.sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return Number(b.createdAt) - Number(a.createdAt);
    });
    return result;
  }, [allProducts, priceRange, minRating, onlyInStock, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function clearFilters() {
    setPriceRange([0, 100]);
    setMinRating(0);
    setOnlyInStock(false);
    setSort("rating");
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="category.page">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3.5">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
            data-ocid="category.back_link"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            {categoryInfo && (
              <span className="text-3xl leading-none">
                {categoryInfo.iconEmoji}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground font-display truncate">
                {categoryInfo?.name ?? "Category"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="relative overflow-hidden rounded-2xl aspect-[21/5] md:aspect-[6/1] bg-muted shadow-md group">
          <img 
            src="/assets/banner1.png" 
            alt="Category Banner" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Mobile filter bar */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors shadow-sm"
            data-ocid="category.mobile_filter_button"
          >
            <Filter className="w-4 h-4 text-primary" />
            Filters & Sort
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutGrid className="w-4 h-4" />
            <span>{filtered.length} items</span>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="bg-card rounded-2xl border border-border p-4 sticky top-28">
              <h2 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider">
                Filters
              </h2>
              <FilterPanel
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                minRating={minRating}
                onRatingChange={setMinRating}
                onlyInStock={onlyInStock}
                onStockChange={setOnlyInStock}
                sort={sort}
                onSortChange={setSort}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Product grid */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                data-ocid="category.loading_state"
              >
                {Array.from({ length: 8 }, (_, i) => `skel-${i}`).map((key) => (
                  <div
                    key={key}
                    className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-muted" />
                    <div className="p-3 space-y-2">
                      <div className="h-2.5 bg-muted rounded w-3/4" />
                      <div className="h-2.5 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-1/3 mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-24 text-center"
                data-ocid="category.empty_state"
              >
                <span className="text-6xl mb-4">🔍</span>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No products match your filters
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Try adjusting your price range or clearing filters
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                  data-ocid="category.clear_filters_empty_button"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                  data-ocid="category.product_grid"
                >
                  {paginated.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={(page - 1) * PAGE_SIZE + i + 1}
                      isWishlisted={wishlistedIds.has(product.id)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div
                    className="flex items-center justify-center gap-2 mt-8"
                    data-ocid="category.pagination"
                  >
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-muted/50 transition-colors"
                      data-ocid="category.pagination_prev"
                    >
                      ← Prev
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setPage(pageNum)}
                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                              page === pageNum
                                ? "bg-primary text-primary-foreground shadow-card"
                                : "bg-card border border-border hover:bg-muted/50 text-foreground"
                            }`}
                            data-ocid={`category.page.${pageNum}`}
                          >
                            {pageNum}
                          </button>
                        ),
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-muted/50 transition-colors"
                      data-ocid="category.pagination_next"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <dialog
          open
          className="fixed inset-0 z-50 md:hidden bg-transparent p-0 max-w-none w-full h-full m-0"
        >
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowMobileFilters(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            data-ocid="category.filter_drawer"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground font-display">
                Filters & Sort
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                aria-label="Close filters"
                data-ocid="category.close_filters_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <FilterPanel
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              minRating={minRating}
              onRatingChange={setMinRating}
              onlyInStock={onlyInStock}
              onStockChange={setOnlyInStock}
              sort={sort}
              onSortChange={(v) => {
                setSort(v);
                setShowMobileFilters(false);
              }}
              onClear={() => {
                clearFilters();
                setShowMobileFilters(false);
              }}
            />
            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="w-full mt-6 py-3 bg-primary text-primary-foreground rounded-2xl font-semibold hover:bg-primary/90 transition-colors"
              data-ocid="category.apply_filters_button"
            >
              Show {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
