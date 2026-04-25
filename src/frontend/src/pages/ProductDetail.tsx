import ProductCard from "@/components/ProductCard";
import {
  useAddToCart,
  useAddToWishlist,
  useBuyXGetYRules,
  useCategories,
  useProductById,
  useProductReviews,
  useProducts,
  useRemoveFromWishlist,
  useSetSubstituteProduct,
  useSubmitReview,
  useWishlist,
} from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from "@/types";
import type { Review } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronLeft,
  Heart,
  Leaf,
  Minus,
  Package,
  Plus,
  Send,
  ShoppingCart,
  Star,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function StarRatingDisplay({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const cls = size === "lg" ? "w-6 h-6" : size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            cls,
            i <= Math.round(rating)
              ? "fill-accent text-accent"
              : "fill-muted text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`₹{i} star`}
          data-ocid={`review.star.₹{i}`}
        >
          <Star
            className={cn(
              "w-6 h-6 transition-colors",
              i <= (hover || value)
                ? "fill-accent text-accent"
                : "fill-muted text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <div
      className="bg-card border border-border rounded-xl p-4"
      data-ocid={`review.item.₹{index}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {review.userName}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(
                Number(review.createdAt) / 1_000_000,
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <StarRatingDisplay rating={review.rating} size="sm" />
      </div>
      {review.title && (
        <p className="text-sm font-semibold text-foreground mb-1">
          {review.title}
        </p>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {review.text}
      </p>
    </div>
  );
}

// Static sample reviews for display
const SAMPLE_REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "p1",
    userId: "u1",
    userName: "Sarah M.",
    rating: 5,
    title: "Absolutely fresh and delicious!",
    text: "These are the best quality products I've ordered online. Arrived perfectly fresh, will definitely order again.",
    isApproved: true,
    helpfulCount: 12,
    createdAt: BigInt(
      Date.now() * 1_000_000 - 5 * 24 * 60 * 60 * 1_000_000_000,
    ),
  },
  {
    id: "r2",
    productId: "p1",
    userId: "u2",
    userName: "James T.",
    rating: 4,
    title: "Great value",
    text: "Very good quality at this price point. Packaging was secure and delivery was on time.",
    isApproved: true,
    helpfulCount: 8,
    createdAt: BigInt(
      Date.now() * 1_000_000 - 12 * 24 * 60 * 60 * 1_000_000_000,
    ),
  },
  {
    id: "r3",
    productId: "p1",
    userId: "u3",
    userName: "Priya K.",
    rating: 5,
    title: "My go-to order every week",
    text: "Consistent quality every single time. Love how fresh everything is. NeXgro has spoiled me for other grocery apps.",
    isApproved: true,
    helpfulCount: 21,
    createdAt: BigInt(
      Date.now() * 1_000_000 - 20 * 24 * 60 * 60 * 1_000_000_000,
    ),
  },
];

// ─── Static freshness data for demo products ──────────────────────────────────
const FRESHNESS_DATA: Record<
  string,
  {
    harvestDate?: string;
    bestBeforeDate?: string;
    bundleId?: string;
    bundleName?: string;
  }
> = {
  p1: {
    harvestDate: new Date(Date.now() - 18 * 3600000).toISOString(),
    bestBeforeDate: new Date(Date.now() + 4 * 24 * 3600000).toISOString(),
  },
  p2: {
    harvestDate: new Date(Date.now() - 24 * 3600000).toISOString(),
    bestBeforeDate: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
  },
  p3: {
    harvestDate: new Date(Date.now() - 10 * 3600000).toISOString(),
    bestBeforeDate: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
  },
  p4: {
    bestBeforeDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
    bundleId: "bundle-dairy",
    bundleName: "Dairy Essentials Bundle",
  },
  p5: {
    bestBeforeDate: new Date(Date.now() + 14 * 24 * 3600000).toISOString(),
    bundleId: "bundle-dairy",
    bundleName: "Dairy Essentials Bundle",
  },
  p6: {
    harvestDate: new Date(Date.now() - 6 * 3600000).toISOString(),
    bestBeforeDate: new Date(Date.now() + 2 * 24 * 3600000).toISOString(),
  },
  p10: {
    harvestDate: new Date(Date.now() - 30 * 3600000).toISOString(),
    bestBeforeDate: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
  },
};

export default function ProductDetail() {
  const { productId } = useParams({ from: "/products/$productId" });

  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewFilter, setReviewFilter] = useState(0);
  const [selectedSubstitute, setSelectedSubstitute] = useState<string>("");

  const { data: apiProduct } = useProductById(productId);
  const { data: apiReviews } = useProductReviews(productId);
  const { data: wishlistItems } = useWishlist();
  const { data: categories } = useCategories();
  const { data: allProducts } = useProducts();
  const { data: bxgyRules } = useBuyXGetYRules();
  const setSubstituteMutation = useSetSubstituteProduct();

  const product = useMemo(
    () =>
      apiProduct ??
      SAMPLE_PRODUCTS.find((p) => p.id === productId) ??
      SAMPLE_PRODUCTS[0],
    [apiProduct, productId],
  );

  const isWishlisted = useMemo(
    () => (wishlistItems ?? []).some((w) => w.productId === product.id),
    [wishlistItems, product.id],
  );

  const categoryInfo = useMemo(() => {
    const cats =
      categories && categories.length > 0 ? categories : SAMPLE_CATEGORIES;
    return cats.find((c) => c.id === product.categoryId);
  }, [categories, product.categoryId]);

  const relatedProducts = useMemo(
    () =>
      SAMPLE_PRODUCTS.filter(
        (p) => p.categoryId === product.categoryId && p.id !== product.id,
      ).slice(0, 6),
    [product.categoryId, product.id],
  );

  const sameCategoryProducts = useMemo(() => {
    const base =
      allProducts && allProducts.length > 0 ? allProducts : SAMPLE_PRODUCTS;
    return base
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 8);
  }, [allProducts, product.categoryId, product.id]);

  const reviews: Review[] = useMemo(() => {
    const base =
      apiReviews && apiReviews.length > 0 ? apiReviews : SAMPLE_REVIEWS;
    if (reviewFilter > 0) return base.filter((r) => r.rating === reviewFilter);
    return base;
  }, [apiReviews, reviewFilter]);

  // Freshness + bundle data
  const freshnessInfo = FRESHNESS_DATA[product.id] ?? {};
  const { harvestDate, bestBeforeDate, bundleId, bundleName } = freshnessInfo;

  // BuyXGetY rule for this product
  const bxgyRule = bxgyRules?.find((r) => r.productId === product.id);

  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const submitReview = useSubmitReview();

  const isOutOfStock = product.stockQty === 0;
  const isLowStock = product.stockQty > 0 && product.stockQty < 3;
  const showSubstitute = isOutOfStock || isLowStock;

  function handleAddToCart() {
    if (isOutOfStock) return;
    addToCart.mutate(
      { productId: product.id, qty },
      {
        onSuccess: () =>
          toast.success(`₹{product.name} added to cart!`, { duration: 2000 }),
      },
    );
  }

  function handleWishlist() {
    if (isWishlisted) {
      removeFromWishlist.mutate(product.id, {
        onSuccess: () => toast.success("Removed from wishlist"),
      });
    } else {
      addToWishlist.mutate(product.id, {
        onSuccess: () => toast.success("Added to wishlist ❤️"),
      });
    }
  }

  function handleSubstituteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const subId = e.target.value;
    setSelectedSubstitute(subId);
    setSubstituteMutation.mutate(
      { productId: product.id, substituteId: subId || null },
      {
        onSuccess: () =>
          toast.success(
            subId ? "Substitute preference saved!" : "Substitute cleared",
          ),
      },
    );
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }
    submitReview.mutate(
      {
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        text: reviewText,
      },
      {
        onSuccess: () => {
          toast.success("Review submitted for approval!");
          setReviewRating(0);
          setReviewTitle("");
          setReviewText("");
        },
      },
    );
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="product_detail.page">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              to="/home"
              className="hover:text-primary transition-colors"
              data-ocid="product_detail.home_link"
            >
              Home
            </Link>
            <span>/</span>
            {categoryInfo && (
              <>
                <Link
                  to="/categories/$categoryId"
                  params={{ categoryId: product.categoryId }}
                  className="hover:text-primary transition-colors"
                  data-ocid="product_detail.category_link"
                >
                  {categoryInfo.iconEmoji} {categoryInfo.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-5"
          data-ocid="product_detail.back_link"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Product main */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-muted/20 rounded-2xl overflow-hidden border border-border">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/images/placeholder.svg";
                }}
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-card text-destructive text-sm font-bold px-4 py-2 rounded-full border border-destructive/30">
                    Out of Stock
                  </span>
                </div>
              )}
              {product.isBestSeller && (
                <div className="absolute top-3 left-3">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    BEST SELLER
                  </span>
                </div>
              )}
              {product.isNewArrival && (
                <div className="absolute top-3 left-3">
                  <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                    NEW ARRIVAL
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              {categoryInfo && (
                <Link
                  to="/categories/$categoryId"
                  params={{ categoryId: product.categoryId }}
                  className="inline-flex items-center gap-1 text-xs text-primary font-semibold uppercase tracking-wide mb-2 hover:text-primary/80 transition-colors"
                >
                  {categoryInfo.iconEmoji} {categoryInfo.name}
                </Link>
              )}
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRatingDisplay rating={product.rating} size="md" />
              <span className="text-sm font-semibold text-foreground">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary font-display">
                ₹{product.price.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">per pack</span>
            </div>

            {/* Freshness section */}
            {(harvestDate || bestBeforeDate) && (
              <div
                className="flex flex-wrap gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
                data-ocid="product_detail.freshness_section"
              >
                {harvestDate && (
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Leaf className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-medium">
                      Harvested{" "}
                      {new Date(harvestDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {harvestDate && bestBeforeDate && (
                  <span className="text-emerald-300 text-xs">•</span>
                )}
                {bestBeforeDate && (
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-medium">
                      Best Before{" "}
                      {new Date(bestBeforeDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* BuyXGetY promotion banner */}
            {bxgyRule && (
              <div
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.96 0.04 20), oklch(0.98 0.02 340))",
                  borderColor: "oklch(0.80 0.10 20)",
                }}
                data-ocid="product_detail.bxgy_banner"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    🎉 Buy {bxgyRule.buyQty} Get {bxgyRule.getQty} Free
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bxgyRule.name}
                  </p>
                </div>
              </div>
            )}

            {/* Bundle info */}
            {bundleId && bundleName && (
              <div
                className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-xl"
                data-ocid="product_detail.bundle_section"
              >
                <Package className="w-4 h-4 text-violet-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-violet-700 font-medium">
                    Bundle:{" "}
                    <Link
                      to="/search"
                      className="font-bold hover:underline"
                      data-ocid="product_detail.bundle_link"
                    >
                      {bundleName}
                    </Link>
                  </p>
                  <p className="text-xs text-violet-500 mt-0.5">
                    This product is part of a discounted bundle
                  </p>
                </div>
              </div>
            )}

            {/* Stock badge */}
            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive bg-destructive/10 px-3 py-1.5 rounded-full border border-destructive/20">
                  ✗ Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  ⚠ Only {product.stockQty} left — order soon!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  ✓ In Stock — {product.stockQty} units available
                </span>
              )}
            </div>

            {/* Substitution preference */}
            {showSubstitute && sameCategoryProducts.length > 0 && (
              <div
                className="p-3 bg-muted/40 border border-border rounded-xl space-y-1.5"
                data-ocid="product_detail.substitute_section"
              >
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  🔄 Choose a Substitute
                  <span className="text-muted-foreground font-normal">
                    (if this item is unavailable)
                  </span>
                </p>
                <select
                  value={selectedSubstitute}
                  onChange={handleSubstituteChange}
                  className="w-full text-sm px-3 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  data-ocid="product_detail.substitute_select"
                  aria-label="Choose substitute product"
                >
                  <option value="">No substitute preference</option>
                  {sameCategoryProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Qty selector + add to cart */}
            <div
              className="flex items-center gap-3"
              data-ocid="product_detail.qty_section"
            >
              <div className="flex items-center border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-10 h-12 flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors disabled:opacity-40"
                  aria-label="Decrease quantity"
                  data-ocid="product_detail.qty_decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 h-12 flex items-center justify-center font-bold text-foreground border-x border-border">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQty((q) => Math.min(product.stockQty, q + 1))
                  }
                  disabled={qty >= product.stockQty}
                  className="w-10 h-12 flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors disabled:opacity-40"
                  aria-label="Increase quantity"
                  data-ocid="product_detail.qty_increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addToCart.isPending}
                className="flex-1 flex items-center justify-center gap-2.5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-card"
                data-ocid="product_detail.add_to_cart_button"
              >
                <ShoppingCart className="w-5 h-5" />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </button>

              <button
                type="button"
                onClick={handleWishlist}
                className={cn(
                  "w-12 h-12 border rounded-xl flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95",
                  isWishlisted
                    ? "border-red-300 bg-red-50 text-red-500"
                    : "border-border bg-card text-muted-foreground hover:text-red-400 hover:border-red-300",
                )}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                data-ocid="product_detail.wishlist_button"
              >
                <Heart
                  className={cn("w-5 h-5", isWishlisted && "fill-red-500")}
                />
              </button>
            </div>

            {/* Delivery info chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "🚚 Free delivery over $30",
                "⚡ Express 2-hour delivery",
                "↩️ Easy returns",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted/60 text-muted-foreground px-2.5 py-1 rounded-full border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section
            className="mb-12 bg-muted/30 rounded-2xl p-5 border border-border"
            data-ocid="product_detail.related_section"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-4">
              You may also like
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {relatedProducts.map((p, i) => (
                <div key={p.id} className="w-44 shrink-0 snap-start">
                  <ProductCard
                    product={p}
                    index={i + 1}
                    buyXGetYRules={bxgyRules}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section
          className="bg-card rounded-2xl border border-border p-5"
          data-ocid="product_detail.reviews_section"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-foreground">
              Customer Reviews
            </h2>
            <div className="flex items-center gap-2">
              <StarRatingDisplay rating={product.rating} size="sm" />
              <span className="text-sm font-bold text-foreground">
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Rating filter tabs */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-2 mb-5"
            data-ocid="product_detail.review_filters"
          >
            {[0, 5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setReviewFilter(star)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ₹{
                  reviewFilter === star
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-foreground hover:border-primary/40"
                }`}
                data-ocid={`review.filter.₹{star === 0 ? "all" : star}`}
              >
                {star === 0 ? "All" : `₹{star}★`}
              </button>
            ))}
          </div>

          {/* Review list */}
          <div className="space-y-3 mb-6">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No reviews with this rating yet.
              </p>
            ) : (
              reviews.map((review, i) => (
                <ReviewCard key={review.id} review={review} index={i + 1} />
              ))
            )}
          </div>

          {/* Submit review form */}
          <div
            className="border-t border-border pt-5"
            data-ocid="review.submit_section"
          >
            <h3 className="text-sm font-bold text-foreground mb-4">
              Write a Review
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1.5">
                  Your Rating *
                </p>
                <StarPicker value={reviewRating} onChange={setReviewRating} />
              </div>
              <div>
                <label
                  className="text-sm text-muted-foreground mb-1.5 block"
                  htmlFor="review-title"
                >
                  Title (optional)
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  data-ocid="review.title_input"
                />
              </div>
              <div>
                <label
                  className="text-sm text-muted-foreground mb-1.5 block"
                  htmlFor="review-text"
                >
                  Review *
                </label>
                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  data-ocid="review.text_textarea"
                />
              </div>
              <button
                type="submit"
                disabled={submitReview.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-card"
                data-ocid="review.submit_button"
              >
                <Send className="w-4 h-4" />
                {submitReview.isPending ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
