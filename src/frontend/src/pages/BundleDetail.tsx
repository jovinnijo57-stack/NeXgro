import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart, useBundleById } from "@/hooks/useBackend";
import type { Bundle } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Gift,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// Demo data for preview
const DEMO_BUNDLE: Bundle = {
  id: "b1",
  name: "Breakfast Starter Kit",
  description:
    "Everything you need for a nutritious morning — eggs, milk, sourdough bread, and freshly squeezed orange juice. Designed to fuel your day with the best farm-fresh ingredients.",
  imageUrl:
    "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1200&q=80",
  discountPercent: 15,
  isActive: true,
  createdAt: BigInt(0),
  products: [
    {
      productId: "p9",
      productName: "Free-Range Eggs 12pk",
      quantity: 1,
      price: 6.49,
      imageUrl:
        "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80",
    },
    {
      productId: "p4",
      productName: "Whole Milk 1L",
      quantity: 1,
      price: 2.99,
      imageUrl:
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
    },
    {
      productId: "p6",
      productName: "Sourdough Loaf",
      quantity: 1,
      price: 5.99,
      imageUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    },
    {
      productId: "p8",
      productName: "Orange Juice 1L",
      quantity: 1,
      price: 4.29,
      imageUrl:
        "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&q=80",
    },
  ],
};

type ItemQty = Record<string, number>;

export default function BundleDetail() {
  const { bundleId } = useParams({ from: "/bundles/$bundleId" });
  const { data: backendBundle, isLoading } = useBundleById(bundleId);
  const addToCart = useAddToCart();
  const [adding, setAdding] = useState(false);

  const bundle = backendBundle ?? DEMO_BUNDLE;

  const [quantities, setQuantities] = useState<ItemQty>(() =>
    Object.fromEntries(bundle.products.map((p) => [p.productId, p.quantity])),
  );

  const totalOriginal = useMemo(
    () =>
      bundle.products.reduce(
        (sum, p) => sum + p.price * (quantities[p.productId] ?? p.quantity),
        0,
      ),
    [bundle.products, quantities],
  );

  const bundlePrice = totalOriginal * (1 - bundle.discountPercent / 100);
  const totalSavings = totalOriginal - bundlePrice;

  function changeQty(productId: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] ?? 1) + delta),
    }));
  }

  async function handleAddAll() {
    setAdding(true);
    try {
      for (const item of bundle.products) {
        const qty = quantities[item.productId] ?? item.quantity;
        await addToCart.mutateAsync({ productId: item.productId, qty });
      }
      toast.success(
        `🎁 Bundle added to cart! You saved $${totalSavings.toFixed(2)}`,
      );
    } catch {
      toast.error("Failed to add bundle. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link
        to="/bundles"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        All Bundles
      </Link>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-56 sm:h-72">
        <img
          src={bundle.imageUrl}
          alt={bundle.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-white" />
            <Badge className="bg-destructive text-white font-bold">
              {bundle.discountPercent}% OFF
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight">
            {bundle.name}
          </h1>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed mb-8">
        {bundle.description}
      </p>

      {/* Products grid */}
      <div className="mb-8">
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Items Included
        </h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-ocid="bundle_detail.products_list"
        >
          {bundle.products.map((item, idx) => (
            <div
              key={item.productId}
              className="flex gap-3 bg-card border border-border rounded-xl p-3 items-center"
              data-ocid={`bundle_detail.product.${idx + 1}`}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to="/products/$productId"
                  params={{ productId: item.productId }}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2 block"
                >
                  {item.productName}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
              {/* Qty stepper */}
              <div className="flex items-center gap-1 bg-muted rounded-full px-1 shrink-0">
                <button
                  type="button"
                  onClick={() => changeQty(item.productId, -1)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                  aria-label="Decrease"
                  data-ocid={`bundle_detail.qty_minus.${idx + 1}`}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-semibold w-5 text-center tabular-nums">
                  {quantities[item.productId] ?? item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => changeQty(item.productId, 1)}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                  aria-label="Increase"
                  data-ocid={`bundle_detail.qty_plus.${idx + 1}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-display font-bold text-foreground">
            Bundle Summary
          </h3>
        </div>

        <div className="space-y-2 text-sm mb-5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Items total (individual)
            </span>
            <span className="line-through text-muted-foreground">
              ${totalOriginal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-destructive font-medium">
            <span>Bundle discount ({bundle.discountPercent}%)</span>
            <span>−${totalSavings.toFixed(2)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-base font-bold">
            <span className="text-foreground">Bundle Price</span>
            <span className="text-primary">${bundlePrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3 mb-5">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm text-primary font-semibold">
            Total savings: ${totalSavings.toFixed(2)} with this bundle
          </p>
        </div>

        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 text-base font-semibold"
          onClick={handleAddAll}
          disabled={adding}
          data-ocid="bundle_detail.add_all_button"
        >
          <ShoppingCart className="w-5 h-5" />
          {adding ? "Adding to Cart…" : "Add All to Cart"}
        </Button>
      </div>
    </div>
  );
}
