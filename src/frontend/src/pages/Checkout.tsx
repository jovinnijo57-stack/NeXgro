import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddAddress,
  useBuyXGetYRules,
  useCart,
  useCheckDeliveryRadius,
  useDeleteAddress,
  useLoyaltyBalance,
  usePlaceOrder,
  useSetDefaultAddress,
  useUpdateAddress,
  useUserAddresses,
  useUserProfile,
  useWalletBalance,
} from "@/hooks/useBackend";
import OSMMapPicker from "@/components/OSMMapPicker";
import { cn } from "@/lib/utils";
import type { CartItem, SavedAddress } from "@/types";
import { SAMPLE_PRODUCTS } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Edit2,
  Gift,
  Loader2,
  MapPin,
  Package,
  Plus,
  Star,
  Tag,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const STANDARD_DELIVERY_FEE = 2.0;
const EXPRESS_DELIVERY_FEE = 5.0;
const TAX_RATE = 0.08;

const TIP_OPTIONS = [0, 20, 50, 100] as const;

function enrichItem(item: CartItem): CartItem {
  if (item.product) return item;
  const p = SAMPLE_PRODUCTS.find((p) => p.id === item.productId);
  return p ? { ...item, product: p } : item;
}

const DEMO_CART: CartItem[] = [
  {
    userId: "demo",
    productId: "p1",
    quantity: 2,
    addedAt: BigInt(0),
    product: SAMPLE_PRODUCTS[0],
  },
  {
    userId: "demo",
    productId: "p6",
    quantity: 1,
    addedAt: BigInt(0),
    product: SAMPLE_PRODUCTS[5],
  },
  {
    userId: "demo",
    productId: "p8",
    quantity: 3,
    addedAt: BigInt(0),
    product: SAMPLE_PRODUCTS[7],
  },
];

const DEMO_ADDRESSES: SavedAddress[] = [];

interface AddressForm {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
}
const EMPTY_FORM: AddressForm = {
  label: "Home",
  street: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  isDefault: false,
};

const STEPS = ["Address", "Delivery", "Review & Pay"] as const;
type Step = 0 | 1 | 2;

function generateDeliverySlots(): { label: string; value: string }[] {
  const now = new Date();
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);

  return Array.from({ length: 5 }, (_, i) => {
    const slotStart = new Date(start);
    slotStart.setHours(slotStart.getHours() + i);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotEnd.getHours() + 1);
    const fmt = (d: Date) =>
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const dateLabel =
      i === 0
        ? "Today"
        : slotStart.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
    return {
      label: `${dateLabel}, ${fmt(slotStart)} – ${fmt(slotEnd)}`,
      value: slotStart.toISOString(),
    };
  });
}

const DELIVERY_SLOTS = generateDeliverySlots();

const ECO_SLOTS = [
  { id: "eco1", label: "Neighborly Drop (Today 4-5 PM)", discount: 1.0, icon: "🌿" },
  { id: "eco2", label: "Batch Delivery (Today 7-8 PM)", discount: 0.5, icon: "📦" }
];

type PaymentMethod = "online" | "cod";

export default function Checkout() {
  const navigate = useNavigate();
  const { data: rawCart, isLoading: cartLoading } = useCart();
  const { data: rawAddresses, isLoading: addrLoading } = useUserAddresses();
  const { data: loyaltyBalance } = useLoyaltyBalance();
  const { data: walletBalanceCents = 0 } = useWalletBalance();
  const { data: buyXGetYRules = [] } = useBuyXGetYRules();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();
  const placeOrder = usePlaceOrder();
  const { data: profile } = useUserProfile();
  const checkRadius = useCheckDeliveryRadius();

  const [step, setStep] = useState<Step>(0);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<AddressForm>(EMPTY_FORM);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [isExpressDelivery, setIsExpressDelivery] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [loyaltyToRedeem, setLoyaltyToRedeem] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [showCustomTip, setShowCustomTip] = useState(false);

  const cartItems = useMemo(() => {
    const raw = rawCart ?? [];
    return (raw.length > 0 ? raw : DEMO_CART)
      .map(enrichItem)
      .filter((i) => !!i.product);
  }, [rawCart]);

  const addresses = useMemo(() => {
    return rawAddresses ?? [];
  }, [rawAddresses]);

  const loyaltyPts = loyaltyBalance ?? 0;
  const walletBalance = walletBalanceCents / 100;

  const subtotal = useMemo(
    () =>
      cartItems.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0),
    [cartItems],
  );

  const buyXGetYSavings = useMemo(() => {
    if (!buyXGetYRules?.length) return 0;
    let savings = 0;
    for (const rule of buyXGetYRules) {
      const cartItem = cartItems.find((i) => i.productId === rule.productId);
      if (!cartItem?.product) continue;
      const sets = Math.floor(cartItem.quantity / (rule.buyQty + rule.getQty));
      savings += sets * rule.getQty * cartItem.product.price;
    }
    return savings;
  }, [cartItems, buyXGetYRules]);

  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(2.0);
  
  // Update delivery fee when address changes or on mount
  useMemo(() => {
    const runCheck = async () => {
      // Use profile lat/lng if available (mocked/future), otherwise check localStorage
      let lat = (profile as any)?.userLat;
      let lng = (profile as any)?.userLong;
      
      if (!lat || !lng) {
        const stored = localStorage.getItem("nexgro-selected-location");
        if (stored) {
          const { lat: sLat, lng: sLng } = JSON.parse(stored);
          lat = sLat;
          lng = sLng;
        }
      }

      if (lat && lng) {
        const result = (await checkRadius.mutateAsync({ lat, lng })) as any;
        if ((result.tag === "InRange" || result.tag === "withinRadius") && result.deliveryFee) {
          setCalculatedDeliveryFee(result.deliveryFee);
        }
      }
    };
    runCheck();
  }, [selectedAddressId, profile]);

  const deliveryFee = isExpressDelivery
    ? EXPRESS_DELIVERY_FEE
    : calculatedDeliveryFee;
  const tax = (subtotal - buyXGetYSavings - couponDiscount) * TAX_RATE;
  const loyaltyDollarValue = loyaltyToRedeem / 100;
  const walletDeduction = useWallet
    ? Math.min(
        walletBalance,
        subtotal +
          deliveryFee +
          tax -
          couponDiscount -
          loyaltyDollarValue -
          buyXGetYSavings,
      )
    : 0;

  const effectiveTip = showCustomTip
    ? Number.parseFloat(customTip) || 0
    : tipAmount;

  const total = Math.max(
    0,
    subtotal +
      deliveryFee +
      tax -
      couponDiscount -
      loyaltyDollarValue -
      buyXGetYSavings -
      walletDeduction +
      effectiveTip,
  );

  const totalSavings =
    couponDiscount + loyaltyDollarValue + buyXGetYSavings + walletDeduction;

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ??
    addresses.find((a) => a.isDefault) ??
    addresses[0];

  function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();
    if (code === "NEXGRO10") {
      const disc = subtotal * 0.1;
      setAppliedCoupon(code);
      setCouponDiscount(disc);
      toast.success(`Coupon applied! You save ₹${disc.toFixed(2)}`);
    } else if (code === "SAVE5") {
      setAppliedCoupon(code);
      setCouponDiscount(5);
      toast.success("Coupon applied! You save ₹5.00");
    } else {
      toast.error("Invalid or expired coupon code.");
    }
  }

  const handleSaveAddress = async () => {
    if (!newAddress.street || !newAddress.city) {
      toast.error("Please provide address details or pin on map.");
      return;
    }
    
    // Check for exact duplicate
    const existing = addresses.find(
      (a) =>
        a.street.toLowerCase() === newAddress.street.toLowerCase() &&
        a.city.toLowerCase() === newAddress.city.toLowerCase() &&
        a.id !== editingAddressId
    );
    
    if (existing) {
      toast.info("This address already exists! Selecting it instead.");
      handleSelectAddress(existing.id);
      setShowNewForm(false);
      setEditingAddressId(null);
      setNewAddress(EMPTY_FORM);
      return;
    }
    
    if (editingAddressId) {
      await updateAddress.mutateAsync({
        ...newAddress,
        id: editingAddressId,
        userId: "me",
      });
      toast.success("Address updated!");
    } else {
      const saved = await addAddress.mutateAsync(newAddress);
      if (saved?.id) handleSelectAddress(saved.id);
      toast.success("Address added!");
    }
    
    setShowNewForm(false);
    setEditingAddressId(null);
    setNewAddress(EMPTY_FORM);
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    await deleteAddress.mutateAsync(addrId);
    if (selectedAddressId === addrId) setSelectedAddressId("");
    toast.success("Address deleted!");
  };

  const handleSelectAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    setDefaultAddress.mutate(addrId);
  };

  async function handlePlaceOrder() {
    if (!isExpressDelivery && !selectedSlot) {
      toast.error("Please select a delivery time slot.");
      return;
    }
    const result = await placeOrder.mutateAsync({
      addressId: selectedAddress?.id ?? "addr1",
      couponCode: appliedCoupon || undefined,
      loyaltyPointsToRedeem: loyaltyToRedeem,
      deliverySlot: isExpressDelivery ? undefined : selectedSlot,
      isExpressDelivery,
      walletAmountToUse: Math.round(walletDeduction * 100),
      tipAmount: effectiveTip,
    });
    if (result.success && result.orderId) {
      toast.success(
        `Order placed! ${paymentMethod === "cod" ? "Pay on delivery. " : ""}🎉`,
      );
      setPlacedOrderId(result.orderId);
      setShowOrderSuccess(true);
    } else {
      toast.error(result.error ?? "Failed to place order. Please try again.");
    }
  }

  if (cartLoading || addrLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 dark:bg-background">
      {/* Order Success Modal */}
      {showOrderSuccess && placedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-elevated animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">Order Successful!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Your order #{placedOrderId} has been placed successfully. {paymentMethod === "cod" ? "You can pay via cash or UPI on delivery." : "Payment received."}
            </p>
            <button
              onClick={() => navigate({ to: "/orders/$orderId/track", params: { orderId: placedOrderId } })}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              Track Order Live
            </button>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => i < step && setStep(i as Step)}
              className={cn(
                "flex items-center gap-2 font-medium text-sm transition-colors",
                i === step
                  ? "text-primary"
                  : i < step
                    ? "text-primary/60 hover:text-primary cursor-pointer"
                    : "text-muted-foreground cursor-default",
              )}
              data-ocid={`checkout.step_${i + 1}_button`}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className="hidden sm:block">{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-4">
          {/* ── Step 0: Address ── */}
          {step === 0 && (
            <div
              className="bg-card rounded-2xl border border-border shadow-card p-5 dark:bg-card"
              data-ocid="checkout.address_panel"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg text-foreground">
                  Delivery Address
                </h2>
              </div>
              <div className="space-y-3 mb-4" data-ocid="checkout.address_list">
                {addresses.map((addr, idx) => (
                  <div
                    key={addr.id}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      selectedAddressId === addr.id ||
                        (!selectedAddressId && addr.isDefault)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40",
                    )}
                    onClick={() => handleSelectAddress(addr.id)}
                    data-ocid={`checkout.address.${idx + 1}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={
                        selectedAddressId === addr.id ||
                        (!selectedAddressId && addr.isDefault)
                      }
                      readOnly
                      className="mt-0.5 accent-primary pointer-events-none"
                      data-ocid={`checkout.address_radio.${idx + 1}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm text-foreground">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <Badge className="text-[10px] bg-primary/10 text-primary border-0 px-1.5 py-0">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {addr.street}, {addr.city}, {addr.state} {addr.zip}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        📞 {addr.phone}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingAddressId(addr.id);
                          setNewAddress({
                            label: addr.label,
                            street: addr.street,
                            city: addr.city,
                            state: addr.state,
                            zip: addr.zip,
                            phone: addr.phone,
                            isDefault: addr.isDefault
                          });
                          setShowNewForm(true);
                        }}
                        className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                        title="Edit Address"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteAddress(addr.id);
                        }}
                        className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {!showNewForm ? (
                <button
                  type="button"
                  onClick={() => setShowNewForm(true)}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                  data-ocid="checkout.add_address_button"
                >
                  <Plus className="w-4 h-4" />
                  Add new address
                </button>
              ) : (
                <div
                  className="p-4 bg-muted/40 rounded-xl border border-border space-y-3"
                  data-ocid="checkout.new_address_form"
                >
                  <h4 className="font-semibold text-sm">
                    {editingAddressId ? "Edit Address" : "New Address"}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label
                        htmlFor="checkout-addr-label"
                        className="block text-xs text-muted-foreground mb-1"
                      >
                        Label
                      </label>
                      <select
                        id="checkout-addr-label"
                        value={newAddress.label}
                        onChange={(e) =>
                          setNewAddress((p) => ({
                            ...p,
                            label: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-card"
                        data-ocid="checkout.address_label_select"
                      >
                        {["Home", "Work", "Other"].map((l) => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                    {/* Map Picker for Address */}
                    <div className="col-span-2 space-y-2">
                      <label className="block text-xs text-muted-foreground">Pin Location on Map</label>
                      <div className="h-48 rounded-xl overflow-hidden border border-border relative">
                        <OSMMapPicker 
                          initialLat={12.9716}
                          initialLng={77.5946}
                          onLocationSelect={(lat, lng, addr) => {
                            setNewAddress(p => ({
                              ...p,
                              street: addr,
                              city: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                            }));
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Pinned coordinates will be used to calculate delivery distance.</p>
                    </div>

                    {(["street", "city", "state", "zip", "phone"] as const).map(
                      (key) => (
                        <div
                          key={key}
                          className={key === "street" ? "col-span-2" : ""}
                        >
                          <label
                            htmlFor={`checkout-addr-${key}`}
                            className="block text-xs text-muted-foreground mb-1"
                          >
                            {key === "street" ? "Address / Coordinates" : key.charAt(0).toUpperCase() + key.slice(1)}
                          </label>
                          <input
                            id={`checkout-addr-${key}`}
                            type="text"
                            value={newAddress[key]}
                            onChange={(e) =>
                              setNewAddress((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-card"
                            data-ocid={`checkout.new_address_${key}_input`}
                          />
                        </div>
                      ),
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveAddress}
                      disabled={addAddress.isPending}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      data-ocid="checkout.save_address_button"
                    >
                      {addAddress.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Save Address"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowNewForm(false);
                        setEditingAddressId(null);
                        setNewAddress(EMPTY_FORM);
                      }}
                      data-ocid="checkout.cancel_address_button"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <Button
                className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold gap-2"
                onClick={() => setStep(1)}
                disabled={addresses.length === 0}
                data-ocid="checkout.continue_to_delivery_button"
              >
                Continue to Delivery <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ── Step 1: Delivery ── */}
          {step === 1 && (
            <div
              className="bg-card rounded-2xl border border-border shadow-card p-5 dark:bg-card"
              data-ocid="checkout.delivery_panel"
            >
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg text-foreground">
                  Delivery Options
                </h2>
              </div>

              <button
                type="button"
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all mb-4 text-left",
                  isExpressDelivery
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/40",
                )}
                onClick={() => {
                  const next = !isExpressDelivery;
                  setIsExpressDelivery(next);
                  if (next) setSelectedSlot("");
                }}
                data-ocid="checkout.express_delivery_toggle"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    isExpressDelivery
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted",
                  )}
                >
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      Express Delivery (ASAP, ~10 min)
                    </span>
                    <Badge className="text-[10px] bg-accent/20 text-accent border-0 px-1.5">
                      +₹5.00
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Priority handling — delivered as fast as possible
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isExpressDelivery}
                  readOnly
                  className="w-4 h-4 accent-accent pointer-events-none"
                  data-ocid="checkout.express_delivery_checkbox"
                />
              </button>

              {!isExpressDelivery && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">
                    Choose a delivery window{" "}
                    <span className="text-destructive">*</span>
                  </p>
                  <div
                    className="space-y-2"
                    data-ocid="checkout.delivery_slots_list"
                  >
                    {DELIVERY_SLOTS.map((slot, idx) => (
                      <label
                        key={slot.value}
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all",
                          selectedSlot === slot.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40",
                        )}
                        data-ocid={`checkout.delivery_slot.${idx + 1}`}
                      >
                        <input
                          type="radio"
                          name="delivery-slot"
                          value={slot.value}
                          checked={selectedSlot === slot.value}
                          onChange={() => {
                            // Click same slot again to deselect
                            setSelectedSlot((prev) => prev === slot.value ? "" : slot.value);
                          }}
                          onClick={() => {
                            if (selectedSlot === slot.value) setSelectedSlot("");
                          }}
                          className="accent-primary"
                          data-ocid={`checkout.delivery_slot_radio.${idx + 1}`}
                        />
                        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium text-foreground">
                          {slot.label}
                        </span>
                        {idx === 0 && (
                          <Badge className="ml-auto text-[10px] bg-primary/10 text-primary border-0">
                            Earliest
                          </Badge>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Eco-Friendly Slots */}
              <div className="mt-6 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-700">Eco-Friendly Slots</h3>
                    <p className="text-[10px] text-emerald-600/80">Save money & CO2 by sharing a delivery route</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {ECO_SLOTS.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setIsExpressDelivery(false);
                        setSelectedSlot(slot.label);
                        toast.success(`Eco-slot selected! ₹${slot.discount.toFixed(2)} saved.`);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                        selectedSlot === slot.label ? "border-emerald-500 bg-white shadow-sm" : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{slot.icon}</span>
                        <span className="text-xs font-bold text-emerald-800">{slot.label}</span>
                      </div>
                      <Badge className="bg-emerald-500 text-white border-0 text-[10px]">−₹{slot.discount.toFixed(2)}</Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Coupon Code
                </p>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 dark:bg-card"
                      data-ocid="checkout.coupon_input"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      className="shrink-0"
                      data-ocid="checkout.apply_coupon_button"
                    >
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-foreground">
                        {appliedCoupon}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        −₹{couponDiscount.toFixed(2)} off
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon("");
                        setCouponCode("");
                        setCouponDiscount(0);
                      }}
                      className="text-xs text-destructive hover:underline"
                      data-ocid="checkout.remove_coupon_button"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Loyalty */}
              {loyaltyPts > 0 && (
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-accent" />
                    Loyalty Points ({loyaltyPts} pts available)
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={Math.min(loyaltyPts, Math.floor(subtotal * 100))}
                    step={10}
                    value={loyaltyToRedeem}
                    onChange={(e) => setLoyaltyToRedeem(Number(e.target.value))}
                    className="w-full accent-accent"
                    data-ocid="checkout.loyalty_slider"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 pts</span>
                    <span className="text-accent font-medium">
                      {loyaltyToRedeem} pts = −₹{loyaltyDollarValue.toFixed(2)}
                    </span>
                    <span>
                      {Math.min(loyaltyPts, Math.floor(subtotal * 100))} pts
                    </span>
                  </div>
                </div>
              )}

              {/* Wallet */}
              {walletBalance > 0 && (
                <div className="mt-5 pt-5 border-t border-border">
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all text-left",
                      useWallet
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40",
                    )}
                    onClick={() => setUseWallet((prev) => !prev)}
                    data-ocid="checkout.wallet_toggle"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                        useWallet
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm text-foreground">
                        Use Wallet Credit
                      </span>
                      <p className="text-xs text-muted-foreground">
                        ₹{walletBalance.toFixed(2)} available
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={useWallet}
                      readOnly
                      className="w-4 h-4 accent-primary pointer-events-none"
                      data-ocid="checkout.wallet_checkbox"
                    />
                  </button>
                  {useWallet && (
                    <p className="text-xs text-primary mt-2 text-right">
                      −₹{walletDeduction.toFixed(2)} will be deducted from your
                      wallet
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setStep(0)}
                  data-ocid="checkout.back_to_address_button"
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold gap-2"
                  onClick={() => {
                    if (!isExpressDelivery && !selectedSlot) {
                      toast.error("Please select a delivery time slot.");
                      return;
                    }
                    setStep(2);
                  }}
                  data-ocid="checkout.continue_to_review_button"
                >
                  Continue to Review <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Review & Pay ── */}
          {step === 2 && (
            <div
              className="bg-card rounded-2xl border border-border shadow-card p-5 dark:bg-card"
              data-ocid="checkout.review_panel"
            >
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg text-foreground">
                  Review Your Order
                </h2>
              </div>

              {selectedAddress && (
                <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-xl mb-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Delivering to
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedAddress.label} — {selectedAddress.street},{" "}
                      {selectedAddress.city}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="ml-auto text-xs text-primary hover:underline shrink-0"
                    data-ocid="checkout.change_address_button"
                  >
                    Change
                  </button>
                </div>
              )}

              <div className="space-y-3 mb-5" data-ocid="checkout.items_list">
                {cartItems.map((item, idx) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3"
                    data-ocid={`checkout.item.${idx + 1}`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.product?.imageUrl}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      ₹{((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment method */}
              {total > 0 && (
                <div className="mb-5 pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left",
                        paymentMethod === "online"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                      data-ocid="checkout.payment_online_button"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          paymentMethod === "online"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                        )}
                      >
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Online
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Card / UPI / Wallet
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left",
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40",
                      )}
                      data-ocid="checkout.payment_cod_button"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          paymentMethod === "cod"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                        )}
                      >
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Cash on Delivery
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pay when delivered
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {total === 0 && useWallet && (
                <div className="mb-5 pt-4 border-t border-border">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Fully Paid by Wallet</p>
                      <p className="text-xs text-muted-foreground">No additional payment required</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tip for delivery person */}
              <div
                className="mb-5 pt-4 border-t border-border"
                data-ocid="checkout.tip_section"
              >
                <p className="text-sm font-semibold text-foreground mb-3">
                  Tip for delivery person 🙏 (optional)
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {TIP_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTipAmount(t);
                        setShowCustomTip(false);
                      }}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all",
                        tipAmount === t && !showCustomTip
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:border-primary/40",
                      )}
                      data-ocid={`checkout.tip_option.${t}`}
                    >
                      {t === 0 ? "No tip" : `₹${t}`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomTip(true);
                      setTipAmount(0);
                    }}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all",
                      showCustomTip
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:border-primary/40",
                    )}
                    data-ocid="checkout.tip_custom_button"
                  >
                    Custom
                  </button>
                  {showCustomTip && (
                    <input
                      type="number"
                      placeholder="₹ Amount"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      className="w-28 px-3 py-2 text-sm rounded-xl border-2 border-primary bg-background focus:outline-none dark:bg-card"
                      data-ocid="checkout.tip_custom_input"
                    />
                  )}
                </div>
                {effectiveTip > 0 && (
                  <p className="text-xs text-primary mt-2 font-medium">
                    ₹{effectiveTip} tip added — thank you for appreciating your
                    delivery partner! 💚
                  </p>
                )}
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-bold gap-2 shadow-elevated"
                onClick={handlePlaceOrder}
                disabled={placeOrder.isPending}
                data-ocid="checkout.place_order_button"
              >
                {placeOrder.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Placing Order…
                  </>
                ) : paymentMethod === "cod" ? (
                  <>
                    <Banknote className="w-4 h-4" />
                    Place Order (Cash on Delivery) · ₹{total.toFixed(2)}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Place Order · ₹{total.toFixed(2)}
                  </>
                )}
              </Button>
              {placeOrder.isError && (
                <p
                  className="text-xs text-destructive mt-2 text-center"
                  data-ocid="checkout.order.error_state"
                >
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: price summary */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-card rounded-2xl border border-border shadow-card p-5 sticky top-20 dark:bg-card">
            <h3 className="font-display font-semibold text-foreground mb-4">
              Price Details
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal ({cartItems.length} items)
                </span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isExpressDelivery ? "Express Delivery" : "Delivery Fee"}
                </span>
                <span
                  className={cn(
                    "font-medium",
                    isExpressDelivery && "text-accent",
                  )}
                >
                  ₹{deliveryFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%)</span>
                <span className="font-medium">₹{tax.toFixed(2)}</span>
              </div>
              {buyXGetYSavings > 0 && (
                <div className="flex justify-between text-accent">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    Buy X Get Y
                  </span>
                  <span className="font-medium">
                    −₹{buyXGetYSavings.toFixed(2)}
                  </span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    Coupon ({appliedCoupon})
                  </span>
                  <span className="font-medium">
                    −₹{couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              {loyaltyToRedeem > 0 && (
                <div className="flex justify-between text-accent">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    Loyalty Points
                  </span>
                  <span className="font-medium">
                    −₹{loyaltyDollarValue.toFixed(2)}
                  </span>
                </div>
              )}
              {walletDeduction > 0 && (
                <div className="flex justify-between text-primary">
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    Wallet Credit
                  </span>
                  <span className="font-medium">
                    −₹{walletDeduction.toFixed(2)}
                  </span>
                </div>
              )}
              {effectiveTip > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Tip</span>
                  <span className="font-medium">+₹{effectiveTip}</span>
                </div>
              )}
              <div className="border-t border-border pt-2.5 flex justify-between text-base font-bold text-foreground">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
            {totalSavings > 0 && (
              <div
                className="mt-4 p-3 bg-accent/10 rounded-xl border border-accent/20"
                data-ocid="checkout.savings_summary"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-sm font-bold text-foreground">
                    You're saving ₹{totalSavings.toFixed(2)}! 🎉
                  </p>
                </div>
              </div>
            )}
            {loyaltyPts > 0 && loyaltyToRedeem === 0 && (
              <div className="mt-3 p-2.5 bg-accent/10 rounded-lg flex items-center gap-2">
                <Star className="w-4 h-4 text-accent shrink-0" />
                <p className="text-xs text-foreground">
                  You'll earn ~{Math.floor(total)} loyalty points!
                </p>
              </div>
            )}
            {paymentMethod === "cod" && (
              <div className="mt-3 p-2.5 bg-muted border border-border rounded-lg flex items-center gap-2">
                <Banknote className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-foreground">
                  Please keep exact change ready for delivery.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
