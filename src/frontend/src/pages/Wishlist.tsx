import ProductCard from "@/components/ProductCard";
import {
  useAddToCart,
  usePriceDropAlerts,
  useRemoveFromWishlist,
  useWishlist,
} from "@/hooks/useBackend";
import { SAMPLE_PRODUCTS } from "@/types";
import type { Product } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Copy,
  ExternalLink,
  Heart,
  Share2,
  ShoppingCart,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const SAMPLE_WISHLIST_IDS = SAMPLE_PRODUCTS.filter((p) => p.isFeatured)
  .slice(0, 6)
  .map((p) => p.id);

function WishlistItemCard({
  product,
  index,
  onRemove,
  onMoveToCart,
  priceDropAlert,
}: {
  product: Product;
  index: number;
  onRemove: () => void;
  onMoveToCart: () => void;
  priceDropAlert?: { originalPrice: number; newPrice: number };
}) {
  const isOutOfStock = product.stockQty === 0;

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col group hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 dark:hover:border-primary/20"
      data-ocid={`wishlist.item.${index}`}
    >
      <Link
        to="/products/$productId"
        params={{ productId: product.id }}
        className="relative block aspect-[4/3] bg-muted/20 overflow-hidden"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/images/placeholder.svg";
          }}
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-card text-destructive text-xs font-semibold px-3 py-1 rounded-full border border-destructive/30">
              Out of Stock
            </span>
          </div>
        )}
        {priceDropAlert && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              <TrendingDown className="w-3 h-3" />
              Price Drop!
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm opacity-0 group-hover:opacity-100"
          aria-label="Remove from wishlist"
          data-ocid={`wishlist.remove_button.${index}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link
          to="/products/$productId"
          params={{ productId: product.id }}
          className="group/title"
        >
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight mb-1 group-hover/title:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`text-xs ${i <= Math.round(product.rating) ? "text-accent" : "text-muted"}`}
            >
              ★
            </span>
          ))}
          <span className="text-[11px] text-muted-foreground ml-0.5">
            ({product.reviewCount})
          </span>
        </div>

        {priceDropAlert ? (
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              ${priceDropAlert.newPrice.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground line-through">
              ${priceDropAlert.originalPrice.toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              -
              {Math.round(
                (1 - priceDropAlert.newPrice / priceDropAlert.originalPrice) *
                  100,
              )}
              %
            </span>
          </div>
        ) : (
          <span className="text-base font-bold text-primary mb-2">
            ${product.price.toFixed(2)}
          </span>
        )}

        <div className="flex items-center justify-between mt-auto gap-2">
          <button
            type="button"
            onClick={onRemove}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
            aria-label="Remove"
            data-ocid={`wishlist.remove_icon_button.${index}`}
          >
            <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
          </button>
          <button
            type="button"
            onClick={onMoveToCart}
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-card"
            data-ocid={`wishlist.move_to_cart_button.${index}`}
          >
            <ShoppingCart className="w-3 h-3" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { data: wishlistData } = useWishlist();
  const { data: priceDropAlerts = [] } = usePriceDropAlerts();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const [copied, setCopied] = useState(false);

  const wishlistProducts: Product[] = useMemo(() => {
    if (wishlistData) {
      if (wishlistData.length === 0) return [];
      return wishlistData
        .map(
          (item) =>
            item.product ??
            SAMPLE_PRODUCTS.find((p) => p.id === item.productId),
        )
        .filter((p): p is Product => !!p);
    }
    // Only return demo if data is still loading (undefined)
    return SAMPLE_PRODUCTS.filter((p) => SAMPLE_WISHLIST_IDS.includes(p.id));
  }, [wishlistData]);

  function handleRemove(productId: string) {
    removeFromWishlist.mutate(productId, {
      onSuccess: () => toast.success("Removed from wishlist"),
    });
  }

  function handleMoveToCart(product: Product) {
    addToCart.mutate(
      { productId: product.id, qty: 1 },
      {
        onSuccess: () => {
          toast.success(`${product.name} added to cart!`);
          removeFromWishlist.mutate(product.id);
        },
      },
    );
  }

  function handleShareWishlist() {
    const token = `wl_${Date.now().toString(36)}`;
    const url = `${window.location.origin}/shared-wishlist/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Wishlist link copied! Share it with friends 🎉");
    setTimeout(() => setCopied(false), 3000);
  }

  const suggestions = useMemo(() => {
    const ids = new Set(wishlistProducts.map((p) => p.id));
    return SAMPLE_PRODUCTS.filter((p) => !ids.has(p.id) && p.isFeatured).slice(
      0,
      4,
    );
  }, [wishlistProducts]);

  const priceDropMap = useMemo(() => {
    return new Map(priceDropAlerts.map((a) => [a.productId, a]));
  }, [priceDropAlerts]);

  return (
    <div
      className="min-h-screen bg-background dark:bg-background"
      data-ocid="wishlist.page"
    >
      <div className="bg-card border-b border-border dark:bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2.5">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              My Wishlist
              {wishlistProducts.length > 0 && (
                <span className="text-base font-normal text-muted-foreground">
                  ({wishlistProducts.length} items)
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2">
              {wishlistProducts.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleShareWishlist}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-muted/60 text-foreground rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                    data-ocid="wishlist.share_button"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Share List"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      for (const p of wishlistProducts) {
                        addToCart.mutate({ productId: p.id, qty: 1 });
                        removeFromWishlist.mutate(p.id);
                      }
                      toast.success("All items moved to cart!");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-card"
                    data-ocid="wishlist.move_all_to_cart_button"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Move All to Cart
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {wishlistProducts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="wishlist.empty_state"
          >
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-5">
              <Heart className="w-12 h-12 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Save products you love by tapping the heart icon.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/home"
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm shadow-card"
                data-ocid="wishlist.browse_home_link"
              >
                Browse Products
              </Link>
              <Link
                to="/search"
                className="px-6 py-2.5 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-muted/50 transition-colors text-sm"
                data-ocid="wishlist.search_link"
              >
                Search Groceries
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Price drop notification banner */}
            {priceDropAlerts.filter((a) =>
              wishlistProducts.some((p) => p.id === a.productId),
            ).length > 0 && (
              <div
                className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-3"
                data-ocid="wishlist.price_drop_banner"
              >
                <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Price drops on your wishlist!
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {
                      priceDropAlerts.filter((a) =>
                        wishlistProducts.some((p) => p.id === a.productId),
                      ).length
                    }{" "}
                    item(s) dropped in price — grab them now.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleShareWishlist}
                  className="ml-auto flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium shrink-0"
                  data-ocid="wishlist.share_link"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            )}

            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10"
              data-ocid="wishlist.product_grid"
            >
              {wishlistProducts.map((product, i) => (
                <WishlistItemCard
                  key={product.id}
                  product={product}
                  index={i + 1}
                  onRemove={() => handleRemove(product.id)}
                  onMoveToCart={() => handleMoveToCart(product)}
                  priceDropAlert={priceDropMap.get(product.id)}
                />
              ))}
            </div>

            {suggestions.length > 0 && (
              <section
                className="bg-muted/30 dark:bg-muted/10 rounded-2xl p-5 border border-border"
                data-ocid="wishlist.suggestions_section"
              >
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="text-accent">✨</span>
                  You Might Also Like
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {suggestions.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={i + 1}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
