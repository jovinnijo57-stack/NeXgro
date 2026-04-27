import { AgeGateModal, isAgeVerified } from "@/components/AgeGateModal";
import { useComparison } from "@/contexts/ComparisonContext";
import {
  useAddToCart,
  useAddToWishlist,
  useRemoveFromWishlist,
  useCart,
  useRemoveFromCart,
} from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import type { BuyXGetYRule, Product } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  GitCompare,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "compact" | "featured";
  isWishlisted?: boolean;
  flashDiscountPercent?: number;
  buyXGetYRules?: BuyXGetYRule[];
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "w-3 h-3",
              i <= Math.round(rating)
                ? "fill-accent text-accent"
                : "fill-muted text-muted-foreground",
            )}
          />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground">({count})</span>
    </div>
  );
}

interface FreshnessBadgesProps {
  harvestDate?: string;
  bestBeforeDate?: string;
  bundleId?: string;
  bxgyRule?: BuyXGetYRule;
  compact?: boolean;
}

function FreshnessBadges({
  harvestDate,
  bestBeforeDate,
  bundleId,
  bxgyRule,
  compact,
}: FreshnessBadgesProps) {
  const badges: React.ReactNode[] = [];

  if (harvestDate) {
    const harvested = new Date(harvestDate);
    const hoursAgo = (Date.now() - harvested.getTime()) / 3600000;
    if (hoursAgo <= 48) {
      badges.push(
        <span
          key="fresh"
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full font-semibold",
            compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5",
            "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700",
          )}
        >
          🌿 Fresh Today
        </span>,
      );
    }
  }

  if (bestBeforeDate) {
    const bb = new Date(bestBeforeDate);
    const formatted = bb.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    badges.push(
      <span
        key="bb"
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full font-semibold",
          compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5",
          "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700",
        )}
      >
        📅 Best Before {formatted}
      </span>,
    );
  }

  if (bundleId) {
    badges.push(
      <span
        key="bundle"
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full font-semibold",
          compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5",
          "bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-700",
        )}
      >
        🎁 Bundle
      </span>,
    );
  }

  if (bxgyRule) {
    badges.push(
      <span
        key="bxgy"
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full font-semibold",
          compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5",
          "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-700",
        )}
      >
        🎉 Buy {bxgyRule.buyQty} Get {bxgyRule.getQty}
      </span>,
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", compact ? "mt-0.5" : "mt-1")}>
      {badges}
    </div>
  );
}

export function ProductCard({
  product,
  index = 0,
  variant = "default",
  isWishlisted = false,
  flashDiscountPercent,
  buyXGetYRules,
}: ProductCardProps) {
  const [showAgeGate, setShowAgeGate] = useState(false);

  const { data: cart } = useCart();
  const cartItem = cart?.find((item) => item.productId === product.id);
  const inCart = !!cartItem;
  const qty = cartItem ? cartItem.quantity : 1;

  const addToCart = useAddToCart();
  const removeFromCart = useRemoveFromCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { addToComparison, removeFromComparison, isInComparison } =
    useComparison();

  const isOutOfStock = product.stockQty === 0;
  const discountedPrice = flashDiscountPercent
    ? product.price * (1 - flashDiscountPercent / 100)
    : null;

  const bxgyRule = buyXGetYRules?.find((r) => r.productId === product.id);

  const harvestDate = (product as Product & { harvestDate?: string })
    .harvestDate;
  const bestBeforeDate = (product as Product & { bestBeforeDate?: string })
    .bestBeforeDate;
  const bundleId = (product as Product & { bundleId?: string }).bundleId;

  const inComparison = isInComparison(product.id);

  function doAddToCart(newQty: number = 1) {
    addToCart.mutate(
      { productId: product.id, qty: newQty },
      {
        onSuccess: () => {
          toast.success(`${product.name} cart updated!`, { duration: 2000 });
        },
      },
    );
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (isOutOfStock) return;
    if (product.ageRestricted && !isAgeVerified()) {
      setShowAgeGate(true);
      return;
    }
    doAddToCart();
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate(product.id, {
        onSuccess: () => {
          toast.success("Added to wishlist");
        },
      });
    }
  }

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    if (inComparison) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product.id);
      toast.success("Added to comparison");
    }
  }

  if (variant === "compact") {
    return (
      <Link
        to="/products/$productId"
        params={{ productId: product.id }}
        className="flex items-center gap-3 bg-card hover:bg-muted/30 dark:hover:bg-muted/10 rounded-xl p-3 border border-border transition-all duration-200 group"
        data-ocid={`product.item.${index}`}
      >
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted/30 shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/images/placeholder.svg";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {product.name}
          </p>
          <StarRating rating={product.rating} count={product.reviewCount} />
          <p className="text-sm font-bold text-primary mt-0.5">
            ₹{product.price.toFixed(2)}
          </p>
          <FreshnessBadges
            harvestDate={harvestDate}
            bestBeforeDate={bestBeforeDate}
            bundleId={bundleId}
            bxgyRule={bxgyRule}
            compact
          />
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="group-hover:scale-105 transition-transform"
          aria-label="Add to cart"
        >
          <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-sm hover:bg-primary/90 transition-all">
            Add
          </span>
        </button>
      </Link>
    );
  }

  return (
    <>
      {showAgeGate && (
        <AgeGateModal
          productName={product.name}
          onConfirm={() => {
            setShowAgeGate(false);
            doAddToCart();
          }}
          onCancel={() => setShowAgeGate(false)}
        />
      )}
      <Link
        to="/products/$productId"
        params={{ productId: product.id }}
        className="group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5 flex flex-col dark:hover:border-primary/20"
        data-ocid={`product.item.${index}`}
      >
        {/* Image container */}
        <div className="relative aspect-[4/3] bg-muted/20 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/assets/images/placeholder.svg";
            }}
          />

          {/* Image overlay badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {flashDiscountPercent && (
              <span className="flash-deal-banner text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {flashDiscountPercent}% OFF
              </span>
            )}
            {bxgyRule && !flashDiscountPercent && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Buy {bxgyRule.buyQty} Get {bxgyRule.getQty}
              </span>
            )}
            {product.ageRestricted && (
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                18+
              </span>
            )}
            {product.isNewArrival &&
              !flashDiscountPercent &&
              !bxgyRule &&
              !product.ageRestricted && (
                <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  NEW
                </span>
              )}
            {product.isBestSeller &&
              !flashDiscountPercent &&
              !product.isNewArrival &&
              !bxgyRule &&
              !product.ageRestricted && (
                <span className="bg-secondary text-secondary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  BEST
                </span>
              )}
          </div>

          {/* Top-right action buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <button
              type="button"
              onClick={handleWishlist}
              className={cn(
                "w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-xs",
                isWishlisted
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-red-400",
              )}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              data-ocid={`product.wishlist_button.${index}`}
            >
              <Heart className={cn("w-4 h-4", isWishlisted && "fill-red-500")} />
            </button>
            <button
              type="button"
              onClick={handleCompare}
              className={cn(
                "w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-all duration-200 shadow-xs",
                inComparison
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
              aria-label={inComparison ? "Remove from comparison" : "Compare"}
              data-ocid={`product.compare_button.${index}`}
            >
              <GitCompare className="w-4 h-4" />
            </button>
          </div>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-card text-muted-foreground text-xs font-semibold px-3 py-1 rounded-full border border-border">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-xs text-muted-foreground mb-0.5 line-clamp-1">
            {product.description}
          </p>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight mb-1">
            {product.name}
          </h3>
          <StarRating rating={product.rating} count={product.reviewCount} />

          <FreshnessBadges
            harvestDate={harvestDate}
            bestBeforeDate={bestBeforeDate}
            bundleId={bundleId}
            bxgyRule={bxgyRule}
          />

          <div className="flex items-end justify-between mt-auto pt-2">
            <div>
              {discountedPrice ? (
                <div>
                  <span className="text-base font-bold text-accent">
                    ₹{discountedPrice.toFixed(2)}
                  </span>
                  <span className="ml-1.5 text-xs text-muted-foreground line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-base font-bold text-primary">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Cart controls */}
            {inCart ? (
              <div
                className="flex items-center gap-1 bg-primary/10 rounded-full px-1"
                data-ocid={`product.qty_control.${index}`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (qty > 1) {
                      doAddToCart(qty - 1);
                    } else {
                      removeFromCart.mutate(product.id);
                    }
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold text-primary min-w-[16px] text-center">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    doAddToCart(qty + 1);
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addToCart.isPending}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                  isOutOfStock
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/80 shadow-card active:scale-95",
                )}
                aria-label="Add to cart"
                data-ocid={`product.add_to_cart.${index}`}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}

export default ProductCard;
