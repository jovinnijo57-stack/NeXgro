import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToCart, useOrders, useSubmitReview } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { SAMPLE_PRODUCTS } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  Check,
  Clock,
  Loader2,
  MapIcon,
  MapPin,
  Navigation,
  Package,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Star,
  Truck,
  Zap,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const DEMO_ORDERS: Order[] = [
  {
    id: "ORD-20240421-001",
    userId: "demo",
    items: [
      {
        productId: "p1",
        productName: "Fresh Organic Tomatoes",
        price: 3.99,
        quantity: 2,
        imageUrl: SAMPLE_PRODUCTS[0].imageUrl,
      },
      {
        productId: "p6",
        productName: "Sourdough Loaf",
        price: 5.99,
        quantity: 1,
        imageUrl: SAMPLE_PRODUCTS[5].imageUrl,
      },
      {
        productId: "p4",
        productName: "Whole Milk 1L",
        price: 2.99,
        quantity: 2,
        imageUrl: SAMPLE_PRODUCTS[3].imageUrl,
      },
    ],
    subtotal: 19.95,
    deliveryFee: 2.0,
    tax: 1.6,
    total: 23.55,
    loyaltyPointsRedeemed: 0,
    deliveryAddress: {
      id: "a1",
      userId: "demo",
      label: "Home",
      street: "42 Maple Street",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
      phone: "+1 415 555 0101",
      isDefault: true,
    },
    status: "Delivered",
    statusHistory: [
      {
        status: "Pending",
        timestamp: BigInt(Date.now() - 3 * 86400000) * BigInt(1_000_000),
      },
      {
        status: "Processing",
        timestamp: BigInt(Date.now() - 2 * 86400000) * BigInt(1_000_000),
      },
      {
        status: "Shipped",
        timestamp: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
      },
      {
        status: "Delivered",
        timestamp: BigInt(Date.now() - 21600000) * BigInt(1_000_000),
      },
    ],
    createdAt: BigInt(Date.now() - 3 * 86400000) * BigInt(1_000_000),
    estimatedDelivery: BigInt(Date.now() - 21600000) * BigInt(1_000_000),
  },
  {
    id: "ORD-20240421-002",
    userId: "demo",
    items: [
      {
        productId: "p8",
        productName: "Orange Juice 1L",
        price: 4.29,
        quantity: 3,
        imageUrl: SAMPLE_PRODUCTS[7].imageUrl,
      },
      {
        productId: "p7",
        productName: "Mixed Nuts 200g",
        price: 7.99,
        quantity: 1,
        imageUrl: SAMPLE_PRODUCTS[6].imageUrl,
      },
    ],
    subtotal: 20.86,
    deliveryFee: 2.0,
    tax: 1.67,
    total: 24.53,
    loyaltyPointsRedeemed: 50,
    deliveryAddress: {
      id: "a1",
      userId: "demo",
      label: "Home",
      street: "42 Maple Street",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
      phone: "+1 415 555 0101",
      isDefault: true,
    },
    status: "Shipped",
    statusHistory: [
      {
        status: "Pending",
        timestamp: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
      },
      {
        status: "Processing",
        timestamp: BigInt(Date.now() - 64800000) * BigInt(1_000_000),
      },
      {
        status: "Shipped",
        timestamp: BigInt(Date.now() - 21600000) * BigInt(1_000_000),
      },
    ],
    createdAt: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
    estimatedDelivery: BigInt(Date.now() + 14400000) * BigInt(1_000_000),
  },
];

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  emoji: string;
  mapStatus?: OrderStatus;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "confirmed",
    label: "Order Confirmed",
    description: "We received your order and it's being verified",
    icon: ShoppingBag,
    emoji: "🛒",
    mapStatus: "Pending",
  },
  {
    id: "processing",
    label: "Being Processed",
    description: "Our team is picking and checking your items",
    icon: Package,
    emoji: "📦",
    mapStatus: "Processing",
  },
  {
    id: "packed",
    label: "Packed & Ready",
    description: "Your order is packed and waiting for pickup",
    icon: PackageCheck,
    emoji: "✅",
    mapStatus: "Processing",
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    description: "Your rider is on the way to your address",
    icon: Truck,
    emoji: "🚚",
    mapStatus: "Shipped",
  },
  {
    id: "delivered",
    label: "Delivered",
    description: "Your order has been delivered successfully",
    icon: PackageCheck,
    emoji: "🎉",
    mapStatus: "Delivered",
  },
];

const STATUS_TO_STEP: Record<OrderStatus, number> = {
  Pending: 0,
  Processing: 2,
  Shipped: 3,
  Delivered: 4,
  Cancelled: -1,
};

function formatTs(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStepTimestamp(stepIdx: number, order: Order): bigint | undefined {
  const histMap: Record<string, bigint> = Object.fromEntries(
    order.statusHistory.map((h) => [h.status, h.timestamp]),
  );
  if (stepIdx === 0) return histMap.Pending;
  if (stepIdx === 1) return histMap.Processing;
  if (stepIdx === 2) {
    const proc = histMap.Processing;
    return proc ? proc + BigInt(1800000) * BigInt(1_000_000) : undefined;
  }
  if (stepIdx === 3) return histMap.Shipped;
  if (stepIdx === 4) return histMap.Delivered;
  return undefined;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (current / (total - 1)) * 100));
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
      <div
        className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusTimeline({ order }: { order: Order }) {
  const currentStep = STATUS_TO_STEP[order.status] ?? 0;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div data-ocid="order_detail.timeline">
      <ProgressBar current={currentStep} total={TIMELINE_STEPS.length} />
      <div className="relative">
        {TIMELINE_STEPS.map((step, idx) => {
          const done = idx <= currentStep;
          const active = idx === currentStep;
          const pending = idx > currentStep;
          const Icon = step.icon;
          const ts = getStepTimestamp(idx, order);

          return (
            <div
              key={step.id}
              className={cn(
                "flex gap-4 transition-all duration-500",
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2",
              )}
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 relative",
                    done && !active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : active
                        ? "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/25"
                        : "bg-muted text-muted-foreground",
                  )}
                  data-ocid={`order_detail.step_${idx + 1}`}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                  )}
                  {done && !active ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-10 my-1 rounded-full transition-colors duration-500",
                      idx < currentStep ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pb-1 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base">{step.emoji}</span>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      done && !active
                        ? "text-foreground"
                        : active
                          ? "text-primary"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                  {active && (
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0">
                      Current
                    </Badge>
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs mt-0.5",
                    pending
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground",
                  )}
                >
                  {step.description}
                </p>
                {ts && (
                  <p className="text-[11px] text-primary/70 font-medium mt-0.5">
                    {formatTs(ts)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Live Map Simulation ──────────────────────────────────────────────────────

interface MapCoords {
  x: number;
  y: number;
}

function LiveMap({ order, deliveryLabel }: { order: Order; deliveryLabel: string }) {
  const isActive = order.status === "Shipped" || order.status === "Processing";
  const [agentPos, setAgentPos] = useState<MapCoords>({ x: 10, y: 20 });
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const TOTAL_STEPS = 60; // 2 min at 2s intervals
  const customerPos: MapCoords = { x: 70, y: 65 };

  useEffect(() => {
    if (!isActive) return;
    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = Math.min(e + 1, TOTAL_STEPS);
        const t = next / TOTAL_STEPS;
        // Simulate a slightly curved path
        const startX = 10;
        const startY = 20;
        const midX = 35;
        const midY = 40;
        const endX = customerPos.x;
        const endY = customerPos.y;
        // Quadratic Bezier: B(t) = (1-t)^2*P0 + 2t(1-t)*P1 + t^2*P2
        const mt = 1 - t;
        const x = mt * mt * startX + 2 * mt * t * midX + t * t * endX;
        const y = mt * mt * startY + 2 * mt * t * midY + t * t * endY;
        setAgentPos({ x, y });
        return next;
      });
    }, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const distRemaining = Math.max(0, (1 - elapsed / TOTAL_STEPS) * 3.2).toFixed(
    1,
  );
  const etaMinutes = Math.ceil(((TOTAL_STEPS - elapsed) * 2) / 60);

  return (
    <div
      className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
      data-ocid="order_detail.live_map"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold text-foreground">
            Live Delivery Tracking
          </span>
        </div>
        {isActive && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              <Navigation className="w-3 h-3 inline mr-1" />
              {distRemaining} km away
            </span>
            <span>
              <Clock className="w-3 h-3 inline mr-1" />
              ETA {etaMinutes} min
            </span>
          </div>
        )}
      </div>
      {isActive && (
        <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              R
            </div>
            <span><span className="font-medium text-foreground">Rahul Kumar</span> is your delivery partner</span>
          </div>
          <Button variant="outline" size="sm" className="h-6 px-2 text-[10px]">Contact</Button>
        </div>
      )}

      {/* Map canvas */}
      <div
        className="relative bg-muted/30 dark:bg-muted/10"
        style={{ height: 200 }}
      >
        {/* Grid streets */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-label="Delivery map"
          role="img"
        >
          {/* Roads */}
          {[20, 40, 60, 80].map((y) => (
            <line
              key={`h${y}`}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="var(--border)"
              strokeWidth="1.5"
            />
          ))}
          {[25, 50, 75].map((x) => (
            <line
              key={`v${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="100"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
          ))}
          {/* Diagonal connector */}
          <line
            x1="10"
            y1="20"
            x2="70"
            y2="65"
            stroke="oklch(0.60 0.16 142)"
            strokeWidth="1"
            strokeDasharray="3 2"
            opacity="0.5"
          />

          {/* Customer pin */}
          <circle
            cx={customerPos.x}
            cy={customerPos.y}
            r="3"
            fill="oklch(0.48 0.16 142)"
          />
          <circle
            cx={customerPos.x}
            cy={customerPos.y}
            r="5"
            fill="oklch(0.48 0.16 142)"
            opacity="0.25"
          />

          {/* Delivery agent (Bike/Scooter Shape) */}
          {isActive && (
            <g style={{ transform: `translate(${agentPos.x - 3}px, ${agentPos.y - 3}px)` }}>
               {/* Detailed Scooter Shape */}
               <g fill="oklch(0.55 0.20 33)">
                 <path d="M1,5 L5,5 L6,2 L2,2 Z" />
                 <rect x="0.5" y="4" width="4.5" height="1.5" rx="0.5" />
                 <circle cx="1.5" cy="5.5" r="1.2" fill="black" />
                 <circle cx="4.5" cy="5.5" r="1.2" fill="black" />
                 <rect x="0" y="1" width="3" height="3" rx="0.5" fill="oklch(0.48 0.16 142)" />
                 <path d="M5,2 L6,2 L6.5,3.5 L5.5,3.5 Z" />
               </g>
               <circle cx="3" cy="3" r="6" fill="oklch(0.55 0.20 33)" opacity="0.1" className="animate-pulse" />
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-card/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "oklch(0.48 0.16 142)" }}
            />
            <span className="text-foreground font-medium">
              {deliveryLabel}
            </span>
          </div>
          {isActive && (
            <div className="flex items-center gap-1.5 text-xs bg-card/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "oklch(0.55 0.20 33)" }}
              />
              <span className="text-foreground font-medium">Agent</span>
            </div>
          )}
        </div>

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-card/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-border text-center">
              <MapIcon className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground font-medium">
                Live tracking available when order is shipped
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PushNotificationBanner() {
  const [show, setShow] = useState(false);
  const [asking, setAsking] = useState(false);
  const dismissed = useRef(false);

  useEffect(() => {
    if (dismissed.current) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  async function handleAllow() {
    setAsking(true);
    try {
      await Notification.requestPermission();
      toast.success("🔔 Notifications enabled!");
    } catch {
      /* noop */
    } finally {
      setAsking(false);
      setShow(false);
    }
  }

  if (!show) return null;

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-auto px-4 animate-slide-in"
      data-ocid="order_detail.push_notif_banner"
    >
      <div className="bg-card border border-primary/30 rounded-2xl shadow-elevated p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Get notified when your order status updates
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            We'll ping you when your delivery is on its way.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="h-7 text-xs px-3"
              onClick={handleAllow}
              disabled={asking}
              data-ocid="order_detail.push_allow_button"
            >
              {asking ? <Loader2 className="w-3 h-3 animate-spin" /> : "Allow"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-3"
              onClick={() => {
                dismissed.current = true;
                setShow(false);
              }}
              data-ocid="order_detail.push_later_button"
            >
              Later
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            dismissed.current = true;
            setShow(false);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors text-xs font-bold"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
function ReviewOrder({ orderId }: { orderId: string }) {
  const submitReview = useSubmitReview();
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (submitted) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 text-center animate-in fade-in duration-500">
        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
        <p className="font-bold text-emerald-700 dark:text-emerald-400">Thanks for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-card animate-in slide-in-from-bottom-4 duration-500">
      <h3 className="font-display font-bold text-lg mb-1 text-foreground">Rate your experience</h3>
      <p className="text-sm text-muted-foreground mb-4">How was your order and delivery from NeXgro?</p>
      
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform active:scale-90"
          >
            <Star
              className={cn(
                "w-8 h-8 transition-colors",
                star <= (hover || rating) ? "text-amber-400 fill-amber-400" : "text-muted border-muted"
              )}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a review for the products and delivery partner (Rahul)..."
        className="w-full min-h-[100px] p-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none mb-4 text-foreground"
      />

      <button
        disabled={isSubmitting}
        onClick={async () => {
          if (rating === 0) {
            toast.error("Please select a rating");
            return;
          }
          setIsSubmitting(true);
          try {
            await submitReview.mutateAsync({
              productId: "delivery", // Virtual product ID for delivery rating
              rating,
              title: "Order Delivery Experience",
              text: comment || "Delivered successfully",
            });
            setSubmitted(true);
            toast.success("Review submitted! Thank you.");
          } catch {
            toast.error("Failed to submit review.");
          } finally {
            setIsSubmitting(false);
          }
        }}
        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}

import { CheckCircle, Phone } from "lucide-react";

export default function OrderDetail() {
  const params = useParams({ strict: false }) as { orderId?: string };
  const orderId = params.orderId ?? "";
  const { data: rawOrders, isLoading } = useOrders();
  const addToCart = useAddToCart();
  const [reordering, setReordering] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "map">("timeline");

  const orders = useMemo(() => {
    const raw = rawOrders ?? [];
    return raw.length > 0 ? raw : DEMO_ORDERS;
  }, [rawOrders]);
  const order = useMemo(
    () => orders.find((o) => o.id === orderId) ?? DEMO_ORDERS[0],
    [orders, orderId],
  );

  const displayAddress = useMemo(() => {
    const saved = localStorage.getItem("nexgro_user_location");
    if (saved && order.deliveryAddress.street.includes("Maple Street")) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...order.deliveryAddress,
          label: parsed.addressName || "Home",
          street: parsed.address || order.deliveryAddress.street,
          city: parsed.city || order.deliveryAddress.city,
          state: parsed.state || order.deliveryAddress.state,
          zip: parsed.zip || order.deliveryAddress.zip,
        };
      } catch {
        return order.deliveryAddress;
      }
    }
    return order.deliveryAddress;
  }, [order.deliveryAddress]);

  const reviewRef = useRef<HTMLDivElement>(null);

  const scrollToReview = () => {
    reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  async function handleCancel() {
    if (!order) return;
    const userEmail = localStorage.getItem("currentUserEmail");
    if (!userEmail) return;

    const lowerEmail = userEmail.toLowerCase().trim();
    const currentCount = Number(localStorage.getItem(`cancel_count_${lowerEmail}`) || 0);
    const newCount = currentCount + 1;
    localStorage.setItem(`cancel_count_${lowerEmail}`, newCount.toString());

    if (newCount >= 3) {
      const banned = JSON.parse(localStorage.getItem("nexgro_banned_users") || "[]");
      if (!banned.includes(lowerEmail)) {
        localStorage.setItem("nexgro_banned_users", JSON.stringify([...banned, lowerEmail]));
      }
      toast.error("Account suspended due to excessive cancellations.");
      setTimeout(() => { window.location.href = "/banned"; }, 1500);
    } else {
      toast.success(`Order cancelled. Warnings: ${newCount}/3`);
      // In a real app, we'd update the backend order status here.
      // For the demo, we'll just reload.
      setTimeout(() => { window.location.reload(); }, 1000);
    }
  }

  async function handleReorder() {
    if (!order) return;
    setReordering(true);
    try {
      for (const item of order.items) {
        await addToCart.mutateAsync({
          productId: item.productId,
          qty: item.quantity,
        });
      }
      toast.success("All items added to cart! 🛒");
    } catch {
      toast.error("Failed to reorder. Please try again.");
    } finally {
      setReordering(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className="max-w-3xl mx-auto px-4 py-12 text-center"
        data-ocid="order_detail.error_state"
      >
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="font-display font-bold text-xl text-foreground">
          Order not found
        </h2>
        <Link to="/orders" className="mt-4 inline-block">
          <Button variant="outline" data-ocid="order_detail.back_button">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const loyaltyEarned = Math.floor(order.total);
  const totalSavings =
    (order as Order & { totalSavings?: number }).totalSavings ?? 0;
  const currentStep = STATUS_TO_STEP[order.status] ?? 0;
  const stepLabel = TIMELINE_STEPS[currentStep]?.label ?? order.status;

  return (
    <>
      <PushNotificationBanner />
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-6"
        data-ocid="order_detail.page"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/orders">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              data-ocid="order_detail.back_button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-xl text-foreground truncate">
                {order.id}
              </h1>
              {order.status === "Delivered" && loyaltyEarned > 0 && (
                <Badge
                  className="bg-accent/10 text-accent border-0 flex items-center gap-1"
                  data-ocid="order_detail.loyalty_badge"
                >
                  <Star className="w-3 h-3" />+{loyaltyEarned} pts earned
                </Badge>
              )}
              {totalSavings > 0 && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-0 flex items-center gap-1">
                  💰 Saved ₹{totalSavings.toFixed(2)}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Placed{" "}
              {new Date(Number(order.createdAt) / 1_000_000).toLocaleDateString(
                "en-US",
                { month: "long", day: "numeric", year: "numeric" },
              )}
              {" · "}
              <span
                className={cn(
                  "font-medium",
                  order.status === "Delivered"
                    ? "text-primary"
                    : order.status === "Cancelled"
                      ? "text-destructive"
                      : "text-amber-600",
                )}
              >
                {stepLabel}
              </span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {order.status === "Pending" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                className="gap-2"
                data-ocid="order_detail.cancel_button"
              >
                <X className="w-3.5 h-3.5" />
                Cancel Order
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReorder}
              disabled={reordering}
              className="gap-2"
              data-ocid="order_detail.reorder_button"
            >
              {reordering ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Reorder</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">
            {/* Status + Map tabs */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="flex bg-muted rounded-xl p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("timeline")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      activeTab === "timeline"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    data-ocid="order_detail.timeline_tab"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("map")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      activeTab === "map"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    data-ocid="order_detail.map_tab"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    Live Map
                  </button>
                </div>
                {activeTab === "timeline" && (
                  <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Step {currentStep + 1}</span>
                    <span>/</span>
                    <span>{TIMELINE_STEPS.length}</span>
                  </div>
                )}
              </div>
              {activeTab === "timeline" ? (
                <StatusTimeline order={order} />
              ) : (
                <LiveMap order={order} deliveryLabel={displayAddress.label} />
              )}
              {order.status === "Delivered" && (
                <div className="mt-8 border-t border-border pt-6" ref={reviewRef}>
                  <ReviewOrder orderId={order.id} />
                </div>
              )}
            </div>

            {/* Delivery info */}
            {order.estimatedDelivery && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                {(order as Order & { isExpressDelivery?: boolean })
                  .isExpressDelivery ? (
                  <Zap className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Est. delivery</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatTs(order.estimatedDelivery)}
                  </p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-5">
              <h2 className="font-display font-semibold text-foreground mb-4">
                Items Ordered
              </h2>
              <div className="space-y-3" data-ocid="order_detail.items_list">
                {order.items.map((item, idx) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3"
                    data-ocid={`order_detail.item.${idx + 1}`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
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
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold text-foreground">
                  Delivery Address
                </h2>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">
                  {displayAddress.label}
                </p>
                <p>{displayAddress.street}</p>
                <p>
                  {displayAddress.city}, {displayAddress.state}{" "}
                  {displayAddress.zip}
                </p>
                <p className="mt-1">📞 {displayAddress.phone}</p>
              </div>
            </div>
          </div>

          {/* Right pricing */}
          <div>
            <div className="bg-card rounded-2xl border border-border shadow-card p-5 sticky top-20">
              <h2 className="font-display font-semibold text-foreground mb-4">
                Price Breakdown
              </h2>
              <div
                className="space-y-2.5 text-sm"
                data-ocid="order_detail.pricing"
              >
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ₹{order.subtotal.toFixed(2)}
                  </span>
                </div>
                {order.loyaltyPointsRedeemed > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Loyalty Discount</span>
                    <span>
                      −₹{(order.loyaltyPointsRedeemed / 10).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">
                    ₹{order.deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2.5 flex justify-between text-base font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
              {order.status === "Delivered" && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-foreground">
                    <span className="font-semibold text-primary">
                      +{loyaltyEarned} points
                    </span>{" "}
                    earned on this order
                  </p>
                </div>
              )}
              {order.status === "Delivered" && (
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="default" className="w-full gap-2" onClick={scrollToReview}>
                    <Star className="w-3.5 h-3.5" />
                    Rate Delivery & Products
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-4 gap-2"
                onClick={handleReorder}
                disabled={reordering}
                data-ocid="order_detail.reorder_button_sidebar"
              >
                {reordering ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Reorder All Items
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
