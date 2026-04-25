import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCoupons,
  useCart,
  useLoyaltyBalance,
  useProducts,
  useRemoveFromCart,
  useSubscribeStockNotification,
  useUpdateCartQty,
} from "@/hooks/useBackend";
import type { CartItem, Coupon, Product } from "@/types";
import { SAMPLE_PRODUCTS } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CheckCircle,
  Minus,
  Plus,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const DELIVERY_FEE = 2.0;
const TAX_RATE = 0.08;

function enrichCartItem(item: CartItem): CartItem {
  if (item.product) return item;
  const product = SAMPLE_PRODUCTS.find((p) => p.id === item.productId);
  return product ? { ...item, product } : item;
}

// ─── Substitute modal ─────────────────────────────────────────────────────────

function SubstituteModal({
  open,
  onClose,
  currentSubId,
  products,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  currentSubId?: string;
  products: Product[];
  onSelect: (productId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md max-h-[70vh] overflow-y-auto"
        data-ocid="cart.substitute.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            Choose a Substitute
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          If your item is out of stock, we'll deliver this substitute instead.
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              onSelect("none");
              onClose();
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
              !currentSubId
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
            data-ocid="cart.substitute.no_substitute_option"
          >
            <span className="text-sm text-muted-foreground">
              No substitute — cancel if out of stock
            </span>
          </button>
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onSelect(p.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                currentSubId === p.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {p.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  ₹{p.price.toFixed(2)}
                </p>
              </div>
              {currentSubId === p.id && (
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cart item row ─────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  index,
  allProducts,
  substituteMap,
  onChangeSubstitute,
}: {
  item: CartItem;
  index: number;
  allProducts: Product[];
  substituteMap: Record<string, string | undefined>;
  onChangeSubstitute: (productId: string, subId: string | undefined) => void;
}) {
  const updateQty = useUpdateCartQty();
  const removeItem = useRemoveFromCart();
  const subscribeStock = useSubscribeStockNotification();
  const qc = useQueryClient();
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  // Debounce qty updates to prevent backend thrashing
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQtyChange = useCallback(
    (newQty: number) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        if (newQty < 1) {
          removeItem.mutate(item.productId, {
            onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
          });
        } else {
          updateQty.mutate(
            { productId: item.productId, qty: newQty },
            { onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }) },
          );
        }
      }, 300);
    },
    [item.productId, removeItem, updateQty, qc],
  );

  const product = item.product;
  if (!product) return null;
  const lineTotal = product.price * item.quantity;
  const isLowStock = product.stockQty < 3;
  const isOutOfStock = product.stockQty === 0;
  const subId = substituteMap[item.productId] ?? item.substituteProductId;
  const substituteName = subId
    ? (allProducts.find((p) => p.id === subId)?.name ??
      SAMPLE_PRODUCTS.find((p) => p.id === subId)?.name)
    : undefined;

  function handleNotifyClick() {
    subscribeStock.mutate(item.productId, {
      onSuccess: () => {
        setSubscribed(true);
        toast.success(
          `You'll be notified when ${product?.name ?? "this item"} is back!`,
        );
      },
      onError: () => toast.error("Couldn't subscribe. Please try again."),
    });
  }

  function handleSubSelect(selectedId: string) {
    const resolvedId = selectedId === "none" ? undefined : selectedId;
    onChangeSubstitute(item.productId, resolvedId);
    if (selectedId !== "none") {
      toast.success("Substitute preference saved!");
    }
  }

  return (
    <>
      <div
        className="flex gap-4 py-4 border-b border-border last:border-0"
        data-ocid={`cart.item.${index + 1}`}
      >
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0 relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold uppercase tracking-wide">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link to="/products/$productId" params={{ productId: product.id }}>
            <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-primary font-semibold mt-1 text-sm">
            ₹{product.price.toFixed(2)}
          </p>

          {/* Substitute tag */}
          {substituteName && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge className="bg-secondary text-secondary-foreground border-0 text-[10px] px-1.5 py-0">
                <RefreshCw className="w-2.5 h-2.5 mr-1" />
                Sub: {substituteName}
              </Badge>
              <button
                type="button"
                onClick={() => setSubModalOpen(true)}
                className="text-[10px] text-primary underline underline-offset-2 hover:no-underline"
                data-ocid={`cart.change_substitute.${index + 1}`}
              >
                Change
              </button>
            </div>
          )}

          {/* No substitute — offer to add one */}
          {!substituteName && (
            <button
              type="button"
              onClick={() => setSubModalOpen(true)}
              className="mt-1.5 text-[10px] text-muted-foreground underline underline-offset-2 hover:text-primary transition-colors"
              data-ocid={`cart.add_substitute.${index + 1}`}
            >
              + Add substitute preference
            </button>
          )}

          {/* Low/out-of-stock notify button */}
          {(isLowStock || isOutOfStock) && (
            <div className="mt-2">
              {subscribed ? (
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Notification set
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[11px] gap-1 px-2 border-primary/40 text-primary hover:bg-primary/5"
                  onClick={handleNotifyClick}
                  disabled={subscribeStock.isPending}
                  data-ocid={`cart.notify_stock.${index + 1}`}
                >
                  <Bell className="w-3 h-3" />
                  {isOutOfStock
                    ? "Notify when back in stock"
                    : `Only ${product.stockQty} left — notify me`}
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-2.5 gap-3">
            <div className="flex items-center gap-1 bg-muted rounded-full px-1">
              <button
                type="button"
                onClick={() => handleQtyChange(item.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                aria-label="Decrease quantity"
                data-ocid={`cart.qty_minus.${index + 1}`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-semibold w-6 text-center tabular-nums">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQtyChange(item.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                aria-label="Increase quantity"
                data-ocid={`cart.qty_plus.${index + 1}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-sm font-bold text-foreground">
              ₹{lineTotal.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() =>
                removeItem.mutate(item.productId, {
                  onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
                })
              }
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Remove item"
              data-ocid={`cart.delete_button.${index + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <SubstituteModal
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        currentSubId={subId}
        products={
          allProducts.length > 0
            ? allProducts.filter((p) => p.id !== item.productId)
            : SAMPLE_PRODUCTS.filter((p) => p.id !== item.productId)
        }
        onSelect={handleSubSelect}
      />
    </>
  );
}

// ─── Main cart page ───────────────────────────────────────────────────────────

export default function Cart() {
  const { data: rawCart, isLoading } = useCart();
  const { data: coupons } = useAdminCoupons();
  const { data: loyaltyBalance } = useLoyaltyBalance();
  const { data: allProducts = [] } = useProducts();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [loyaltyRedemption, setLoyaltyRedemption] = useState(0);
  const [substituteMap, setSubstituteMap] = useState<
    Record<string, string | undefined>
  >({});

  const cartItems = useMemo(() => {
    const raw = rawCart ?? [];
    return raw.map(enrichCartItem).filter((i) => !!i.product);
  }, [rawCart]);

  const balance = loyaltyBalance ?? 0;

  const subtotal = useMemo(
    () =>
      cartItems.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0),
    [cartItems],
  );

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discountType === "percentage"
      ? (subtotal * appliedCoupon.discountValue) / 100
      : Math.min(appliedCoupon.discountValue, subtotal);
  }, [appliedCoupon, subtotal]);

  const loyaltyDiscount = loyaltyRedemption / 10;
  const taxableAmount = Math.max(
    0,
    subtotal - couponDiscount - loyaltyDiscount,
  );
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax + DELIVERY_FEE;
  const maxRedeemable = Math.min(balance, Math.floor(subtotal * 10));

  const DEMO_COUPONS: Coupon[] = [
    {
      id: "d1",
      code: "NEXGRO10",
      discountType: "percentage",
      discountValue: 10,
      expirationDate: BigInt(0),
      isActive: true,
      usageLimit: 100,
      usageCount: 0,
    },
    {
      id: "d2",
      code: "SAVE5",
      discountType: "fixed",
      discountValue: 5,
      expirationDate: BigInt(0),
      isActive: true,
      usageLimit: 50,
      usageCount: 0,
    },
  ];

  function handleApplyCoupon() {
    setCouponError("");
    const all: Coupon[] =
      coupons && coupons.length > 0 ? coupons : DEMO_COUPONS;
    const found = all.find(
      (c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive,
    );
    if (found) {
      setAppliedCoupon(found);
      setCouponCode("");
    } else {
      setCouponError("Invalid or expired coupon code. Try NEXGRO10 or SAVE5.");
    }
  }

  function handleChangeSubstitute(
    productId: string,
    subId: string | undefined,
  ) {
    setSubstituteMap((prev) => ({ ...prev, [productId]: subId }));
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4"
        data-ocid="cart.empty_state"
      >
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mt-1">
            Add some fresh items to get started!
          </p>
        </div>
        <Link to="/home">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            data-ocid="cart.start_shopping_button"
          >
            <ShoppingBag className="w-4 h-4" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">
        Shopping Cart{" "}
        <span className="text-muted-foreground font-normal text-lg">
          ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: item list */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5">
            <div data-ocid="cart.list">
              {cartItems.map((item, idx) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  index={idx}
                  allProducts={allProducts}
                  substituteMap={substituteMap}
                  onChangeSubstitute={handleChangeSubstitute}
                />
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-sm text-foreground">
                Coupon Code
              </h3>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-0 font-mono">
                    {appliedCoupon.code}
                  </Badge>
                  <span className="text-sm text-primary font-medium">
                    {appliedCoupon.discountType === "percentage"
                      ? `${appliedCoupon.discountValue}% off`
                      : `₹${appliedCoupon.discountValue} off`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  data-ocid="cart.coupon_remove_button"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  placeholder="Enter coupon code (e.g. NEXGRO10)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  data-ocid="cart.coupon_input"
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode}
                  data-ocid="cart.coupon_apply_button"
                >
                  Apply
                </Button>
              </div>
            )}
            {couponError && (
              <p
                className="text-xs text-destructive mt-1.5"
                data-ocid="cart.coupon.error_state"
              >
                {couponError}
              </p>
            )}
          </div>

          {/* Loyalty points */}
          {balance > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-sm text-foreground">
                    Loyalty Points
                  </h3>
                </div>
                <Badge className="bg-accent/10 text-accent border-0">
                  {balance} pts
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Use up to {maxRedeemable} points to save $
                {(maxRedeemable / 10).toFixed(2)}
              </p>
              <input
                type="range"
                min={0}
                max={maxRedeemable}
                value={loyaltyRedemption}
                step={10}
                onChange={(e) => setLoyaltyRedemption(Number(e.target.value))}
                className="w-full accent-primary"
                data-ocid="cart.loyalty_slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 pts</span>
                <span className="text-primary font-medium">
                  Redeeming {loyaltyRedemption} pts (−$
                  {loyaltyDiscount.toFixed(2)})
                </span>
                <span>{maxRedeemable} pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-card rounded-2xl border border-border shadow-card p-5 sticky top-20">
            <h3 className="font-display font-bold text-foreground mb-4">
              Order Summary
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>−₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Loyalty Points</span>
                  <span>−₹{loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium">₹{DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span className="font-medium">₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2.5 flex justify-between text-base font-bold text-foreground">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="block mt-5">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 text-base font-semibold"
                data-ocid="cart.checkout_button"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/home" className="block mt-3">
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                data-ocid="cart.continue_shopping_button"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
