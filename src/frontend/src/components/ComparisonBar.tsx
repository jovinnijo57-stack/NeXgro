import { useComparison } from "@/contexts/ComparisonContext";
import { SAMPLE_PRODUCTS } from "@/types";
import { Link, useLocation } from "@tanstack/react-router";
import { GitCompare, X, ChevronRight } from "lucide-react";

export function ComparisonBar() {
  const { comparisonItems, removeFromComparison } = useComparison();
  const location = useLocation();

  // Don't show the bar if we're already on the comparison page
  if (location.pathname === "/products/compare" || comparisonItems.length === 0) {
    return null;
  }

  const products = SAMPLE_PRODUCTS.filter(p => comparisonItems.includes(p.id));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-card border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between pointer-events-auto transform transition-all duration-300 translate-y-0 opacity-100">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground flex items-center gap-2">
              Compare Products
              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{comparisonItems.length} added</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Add up to 4 products to evaluate them side by side.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-3 overflow-hidden">
            {products.slice(0, 4).map((p, i) => (
              <div key={p.id} className="relative group w-10 h-10 rounded-full border-2 border-card bg-white shrink-0 overflow-hidden" style={{ zIndex: 4 - i }}>
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain p-1" />
                <button 
                  onClick={() => removeFromComparison(p.id)}
                  className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {comparisonItems.length > 4 && (
              <div className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground z-0">
                +{comparisonItems.length - 4}
              </div>
            )}
          </div>
          
          <div className="w-px h-8 bg-border hidden sm:block mx-2"></div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => comparisonItems.forEach(id => removeFromComparison(id))}
              className="text-xs font-semibold text-muted-foreground hover:text-destructive px-2"
            >
              Clear
            </button>
            <Link 
              to="/products/compare" 
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-md"
            >
              Compare <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
