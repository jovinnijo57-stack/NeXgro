import { X } from "lucide-react";
import { useState } from "react";

interface AgeGateModalProps {
  productName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function isAgeVerified(): boolean {
  return localStorage.getItem("age_verified") === "true";
}

export function AgeGateModal({ productName, onConfirm, onCancel }: AgeGateModalProps) {
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("age_verified", "true");
      onConfirm();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-300">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">18+</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Age Verification Required</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {productName ? `The "${productName}" is` : "This product is"} age-restricted. You must be at least 18 years old to view and purchase this item.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "I am 18 or older"}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 bg-muted text-muted-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
        <div className="px-6 py-4 bg-muted/30 border-t border-border text-[10px] text-muted-foreground text-center">
          By proceeding, you agree to our Terms of Service and confirm you meet the legal age requirements.
        </div>
      </div>
    </div>
  );
}
