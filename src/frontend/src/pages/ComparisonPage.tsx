import { useComparison } from "@/contexts/ComparisonContext";
import { SAMPLE_PRODUCTS } from "@/types";
import { Link } from "@tanstack/react-router";
import { GitCompare, ShoppingCart, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ComparisonPage() {
  const { comparisonItems, removeFromComparison } = useComparison();
  const addToCart = useAddToCart();
  
  const products = SAMPLE_PRODUCTS.filter(p => comparisonItems.includes(p.id));

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <GitCompare className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Compare Products</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          You haven't added any products to compare yet. Browse our catalog and click the compare icon on products you want to evaluate side-by-side.
        </p>
        <Link to="/search" className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  const features = [
    { key: "price", label: "Price", format: (v: number) => `$${v.toFixed(2)}` },
    { key: "category", label: "Category", format: (v: string) => <span className="capitalize">{v}</span> },
    { key: "rating", label: "Rating", format: (v: number) => <span className="flex items-center justify-center gap-1"><StarRating rating={v} /> {v}/5</span> },
    { key: "ageRestricted", label: "Age Restricted (18+)", format: (v: boolean) => v ? <CheckCircle2 className="w-5 h-5 text-red-500 mx-auto" /> : <XCircle className="w-5 h-5 text-muted-foreground/30 mx-auto" /> },
    { key: "stockQty", label: "Availability", format: (v: number) => v > 0 ? <span className="text-emerald-600 font-medium">In Stock</span> : <span className="text-red-500 font-medium">Out of Stock</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Compare Products</h1>
          <p className="text-muted-foreground mt-1">Evaluating {products.length} {products.length === 1 ? 'item' : 'items'}</p>
        </div>
        <Link to="/search" className="text-primary font-semibold text-sm hover:underline">
          + Add more products
        </Link>
      </div>

      <div className="overflow-x-auto pb-8 scrollbar-thin">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="w-48 p-4 align-bottom text-left border-b border-border">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Product details</span>
              </th>
              {products.map(p => (
                <th key={p.id} className="min-w-[240px] p-4 text-center align-bottom border-b border-border">
                  <div className="relative group">
                    <button 
                      onClick={() => removeFromComparison(p.id)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 rounded-full flex items-center justify-center transition-colors z-10 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="bg-white rounded-2xl border border-border p-4 h-full flex flex-col hover:shadow-lg transition-shadow">
                      <div className="h-32 mb-4 bg-muted/20 rounded-xl overflow-hidden p-2">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <h3 className="font-display font-bold text-base mb-1 line-clamp-2 min-h-[48px]">{p.name}</h3>
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">{p.description}</p>
                      <button 
                        onClick={() => {
                          if (p.stockQty > 0) {
                            addToCart.mutate({ productId: p.id, qty: 1 }, {
                              onSuccess: () => toast.success(`${p.name} added to cart!`)
                            });
                          }
                        }}
                        disabled={p.stockQty === 0}
                        className={cn("w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors", 
                          p.stockQty > 0 
                            ? "bg-primary text-white hover:bg-primary/90" 
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feat, i) => (
              <tr key={feat.key} className={i % 2 === 0 ? "bg-muted/30" : "bg-card"}>
                <td className="p-4 border-b border-border/50 text-sm font-semibold text-muted-foreground">
                  {feat.label}
                </td>
                {products.map(p => (
                  <td key={`${p.id}-${feat.key}`} className="p-4 border-b border-border/50 text-center text-sm">
                    {/* @ts-ignore */}
                    {feat.format(p[feat.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={cn("w-3.5 h-3.5", i <= Math.round(rating) ? "text-accent fill-accent" : "text-muted-foreground/30 fill-muted-foreground/30")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}
