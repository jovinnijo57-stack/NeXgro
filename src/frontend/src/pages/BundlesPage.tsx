import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart, useBundles } from "@/hooks/useBackend";
import type { Bundle } from "@/types";
import { Link } from "@tanstack/react-router";
import { Gift, Package, ShoppingCart, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DEMO_BUNDLES: Bundle[] = [
  {
    id: "b1",
    name: "Breakfast Starter Kit",
    description:
      "Everything you need for a nutritious morning — eggs, milk, bread, and fresh juice.",
    imageUrl:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80",
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
          "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&q=80",
      },
      {
        productId: "p4",
        productName: "Whole Milk 1L",
        quantity: 1,
        price: 2.99,
        imageUrl:
          "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80",
      },
      {
        productId: "p6",
        productName: "Sourdough Loaf",
        quantity: 1,
        price: 5.99,
        imageUrl:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80",
      },
      {
        productId: "p8",
        productName: "Orange Juice 1L",
        quantity: 1,
        price: 4.29,
        imageUrl:
          "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=200&q=80",
      },
    ],
  },
  {
    id: "b2",
    name: "Healthy Snack Box",
    description:
      "Guilt-free snacking with nuts, yogurt, and fresh produce for the whole day.",
    imageUrl:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80",
    discountPercent: 20,
    isActive: true,
    createdAt: BigInt(0),
    products: [
      {
        productId: "p7",
        productName: "Mixed Nuts 200g",
        quantity: 1,
        price: 7.99,
        imageUrl:
          "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&q=80",
      },
      {
        productId: "p5",
        productName: "Greek Yogurt 500g",
        quantity: 2,
        price: 4.49,
        imageUrl:
          "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80",
      },
      {
        productId: "p10",
        productName: "Baby Spinach 150g",
        quantity: 1,
        price: 3.49,
        imageUrl:
          "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80",
      },
    ],
  },
  {
    id: "b3",
    name: "Salad Essentials",
    description:
      "Fresh greens, tomatoes, avocado, and cheese for the perfect salad every time.",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    discountPercent: 18,
    isActive: true,
    createdAt: BigInt(0),
    products: [
      {
        productId: "p10",
        productName: "Baby Spinach 150g",
        quantity: 1,
        price: 3.49,
        imageUrl:
          "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80",
      },
      {
        productId: "p1",
        productName: "Fresh Organic Tomatoes",
        quantity: 1,
        price: 3.99,
        imageUrl:
          "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200&q=80",
      },
      {
        productId: "p2",
        productName: "Avocado Hass",
        quantity: 2,
        price: 5.49,
        imageUrl:
          "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=200&q=80",
      },
      {
        productId: "p11",
        productName: "Cheddar Cheese 250g",
        quantity: 1,
        price: 5.29,
        imageUrl:
          "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=200&q=80",
      },
    ],
  },
  {
    id: "b4",
    name: "Weekend Brunch Bundle",
    description:
      "Everything for a lazy brunch — avocado, eggs, sourdough, OJ, and Greek yogurt.",
    imageUrl:
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&q=80",
    discountPercent: 12,
    isActive: true,
    createdAt: BigInt(0),
    products: [
      {
        productId: "p2",
        productName: "Avocado Hass",
        quantity: 2,
        price: 5.49,
        imageUrl:
          "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=200&q=80",
      },
      {
        productId: "p9",
        productName: "Free-Range Eggs 12pk",
        quantity: 1,
        price: 6.49,
        imageUrl:
          "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&q=80",
      },
      {
        productId: "p6",
        productName: "Sourdough Loaf",
        quantity: 1,
        price: 5.99,
        imageUrl:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80",
      },
      {
        productId: "p8",
        productName: "Orange Juice 1L",
        quantity: 1,
        price: 4.29,
        imageUrl:
          "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=200&q=80",
      },
      {
        productId: "p5",
        productName: "Greek Yogurt 500g",
        quantity: 1,
        price: 4.49,
        imageUrl:
          "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80",
      },
    ],
  },
  {
    id: "b5",
    name: "Dairy Essentials Pack",
    description:
      "Stock up on everyday dairy staples — milk, eggs, yogurt, and cheddar.",
    imageUrl:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&q=80",
    discountPercent: 10,
    isActive: true,
    createdAt: BigInt(0),
    products: [
      {
        productId: "p4",
        productName: "Whole Milk 1L",
        quantity: 2,
        price: 2.99,
        imageUrl:
          "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80",
      },
      {
        productId: "p9",
        productName: "Free-Range Eggs 12pk",
        quantity: 1,
        price: 6.49,
        imageUrl:
          "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&q=80",
      },
      {
        productId: "p5",
        productName: "Greek Yogurt 500g",
        quantity: 1,
        price: 4.49,
        imageUrl:
          "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80",
      },
      {
        productId: "p11",
        productName: "Cheddar Cheese 250g",
        quantity: 1,
        price: 5.29,
        imageUrl:
          "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=200&q=80",
      },
    ],
  },
  {
    id: "b6",
    name: "Hydration & Refresh Kit",
    description:
      "Stay refreshed with sparkling water, OJ, and healthy snacks for on-the-go.",
    imageUrl:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80",
    discountPercent: 14,
    isActive: true,
    createdAt: BigInt(0),
    products: [
      {
        productId: "p12",
        productName: "Sparkling Water 6pk",
        quantity: 2,
        price: 5.99,
        imageUrl:
          "https://images.unsplash.com/photo-1598343175494-a895a73c49db?w=200&q=80",
      },
      {
        productId: "p8",
        productName: "Orange Juice 1L",
        quantity: 1,
        price: 4.29,
        imageUrl:
          "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=200&q=80",
      },
      {
        productId: "p7",
        productName: "Mixed Nuts 200g",
        quantity: 1,
        price: 7.99,
        imageUrl:
          "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&q=80",
      },
    ],
  },
];

function BundleCard({
  bundle,
  index,
}: {
  bundle: Bundle;
  index: number;
}) {
  const addToCart = useAddToCart();
  const [adding, setAdding] = useState(false);

  const totalOriginal = bundle.products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0,
  );
  const bundlePrice = totalOriginal * (1 - bundle.discountPercent / 100);
  const savings = totalOriginal - bundlePrice;

  async function handleAddBundle(e: React.MouseEvent) {
    e.stopPropagation();
    setAdding(true);
    try {
      for (const item of bundle.products) {
        await addToCart.mutateAsync({
          productId: item.productId,
          qty: item.quantity,
        });
      }
      toast.success(`🎁 ${bundle.name} added to cart!`);
    } catch {
      toast.error("Failed to add bundle. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <article
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group"
      data-ocid={`bundles.item.${index + 1}`}
    >
      {/* Image — clicking navigates to detail */}
      <Link
        to="/bundles/$bundleId"
        params={{ bundleId: bundle.id }}
        className="block relative h-44 overflow-hidden"
        data-ocid={`bundles.link.${index + 1}`}
      >
        <img
          src={bundle.imageUrl}
          alt={bundle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-destructive text-destructive-foreground font-bold text-sm px-2.5">
            {bundle.discountPercent}% OFF
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-2 mb-1">
          <Gift className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <Link
            to="/bundles/$bundleId"
            params={{ bundleId: bundle.id }}
            className="font-display font-bold text-foreground text-base leading-snug hover:text-primary transition-colors"
          >
            {bundle.name}
          </Link>
        </div>
        <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
          {bundle.description}
        </p>

        {/* Products list */}
        <div className="space-y-1 mb-4">
          {bundle.products.slice(0, 3).map((p) => (
            <div
              key={p.productId}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground truncate max-w-[60%]">
                {p.quantity > 1 ? `${p.quantity}× ` : ""}
                {p.productName}
              </span>
              <span className="text-foreground font-medium">
                ${(p.price * p.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          {bundle.products.length > 3 && (
            <p className="text-xs text-primary font-medium">
              +{bundle.products.length - 3} more items
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-end gap-2 mb-4">
          <div>
            <p className="text-xs text-muted-foreground line-through">
              ${totalOriginal.toFixed(2)}
            </p>
            <p className="text-xl font-display font-bold text-primary">
              ${bundlePrice.toFixed(2)}
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-0 text-xs mb-0.5">
            Save ${savings.toFixed(2)}
          </Badge>
        </div>

        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-9"
          onClick={handleAddBundle}
          disabled={adding}
          data-ocid={`bundles.add_button.${index + 1}`}
        >
          <ShoppingCart className="w-4 h-4" />
          {adding ? "Adding…" : "Add Bundle to Cart"}
        </Button>
      </div>
    </article>
  );
}

export default function BundlesPage() {
  const { data: backendBundles, isLoading } = useBundles();
  const bundles =
    backendBundles && backendBundles.length > 0 ? backendBundles : DEMO_BUNDLES;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Product Bundles 🎁
            </h1>
            <p className="text-muted-foreground text-sm">
              Save more when you bundle — handpicked combos at unbeatable prices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 p-3 bg-accent/5 border border-accent/20 rounded-xl">
          <Tag className="w-4 h-4 text-accent shrink-0" />
          <p className="text-sm text-accent font-medium">
            All bundles are pre-configured for maximum savings. Click any bundle
            to customize quantities.
          </p>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center min-h-[40vh] gap-4"
          data-ocid="bundles.empty_state"
        >
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <Gift className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-display font-bold text-foreground">
              No bundles yet
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Check back soon — new bundles are added regularly.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          data-ocid="bundles.list"
        >
          {bundles.map((bundle, idx) => (
            <BundleCard key={bundle.id} bundle={bundle} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
