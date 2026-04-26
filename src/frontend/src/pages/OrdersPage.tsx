import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/useBackend";
import type { Order, OrderStatus } from "@/types";
import { SAMPLE_PRODUCTS } from "@/types";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAddToCart } from "@/hooks/useBackend";
import { toast } from "sonner";
import { ChevronRight, Clock, Loader2, Package, QrCode, RefreshCw, ShoppingBag, X } from "lucide-react";

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
  {
    Pending: {
      label: "Pending",
      className: "bg-accent/10 text-accent border-accent/20",
    },
    Processing: {
      label: "Processing",
      className:
        "bg-secondary/20 text-secondary-foreground border-secondary/30",
    },
    Shipped: {
      label: "Shipped",
      className: "bg-muted text-foreground border-border",
    },
    Delivered: {
      label: "Delivered",
      className: "bg-primary/10 text-primary border-primary/20",
    },
    Cancelled: {
      label: "Cancelled",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };

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
      street: "42 Maple St",
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
        status: "Delivered",
        timestamp: BigInt(Date.now() - 21600000) * BigInt(1_000_000),
      },
    ],
    createdAt: BigInt(Date.now() - 3 * 86400000) * BigInt(1_000_000),
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
      street: "42 Maple St",
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
        status: "Shipped",
        timestamp: BigInt(Date.now() - 21600000) * BigInt(1_000_000),
      },
    ],
    createdAt: BigInt(Date.now() - 86400000) * BigInt(1_000_000),
  },
  {
    id: "ORD-20240421-003",
    userId: "demo",
    items: [
      {
        productId: "p5",
        productName: "Greek Yogurt 500g",
        price: 4.49,
        quantity: 2,
        imageUrl: SAMPLE_PRODUCTS[4].imageUrl,
      },
    ],
    subtotal: 8.98,
    deliveryFee: 2.0,
    tax: 0.72,
    total: 11.7,
    loyaltyPointsRedeemed: 0,
    deliveryAddress: {
      id: "a1",
      userId: "demo",
      label: "Home",
      street: "42 Maple St",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
      phone: "+1 415 555 0101",
      isDefault: true,
    },
    status: "Processing",
    statusHistory: [
      {
        status: "Pending",
        timestamp: BigInt(Date.now() - 21600000) * BigInt(1_000_000),
      },
      {
        status: "Processing",
        timestamp: BigInt(Date.now() - 7200000) * BigInt(1_000_000),
      },
    ],
    createdAt: BigInt(Date.now() - 21600000) * BigInt(1_000_000),
  },
];

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Simple QR code SVG placeholder — renders a patterned grid visually resembling a QR */
function QRCodeDisplay({ value }: { value: string }) {
  // Generate a deterministic bit-grid from the string
  const size = 13;
  const bits: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    const charCode = value.charCodeAt(i % value.length);
    bits.push((charCode >> (i % 8)) % 2 === 1);
  }
  const cellSize = 20;
  const totalSize = size * cellSize;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-card border-4 border-card rounded-2xl p-3 shadow-elevated">
        <svg
          width={totalSize}
          height={totalSize}
          viewBox={`0 0 ${totalSize} ${totalSize}`}
          role="img"
          aria-label={`QR code for order ${value}`}
        >
          <title>QR code for order {value}</title>
          <rect width={totalSize} height={totalSize} fill="white" />
          {bits.map((bit, i) => {
            const col = i % size;
            const row = Math.floor(i / size);
            return bit ? (
              <rect
                key={`qr-cell-${col}-${row}`}
                x={col * cellSize}
                y={row * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#111"
              />
            ) : null;
          })}
          {/* Corner markers */}
          {[
            { x: 0, y: 0, id: "tl" },
            { x: (size - 7) * cellSize, y: 0, id: "tr" },
            { x: 0, y: (size - 7) * cellSize, id: "bl" },
          ].map((pos) => (
            <g key={`corner-${pos.id}`}>
              <rect
                x={pos.x}
                y={pos.y}
                width={7 * cellSize}
                height={7 * cellSize}
                fill="#111"
              />
              <rect
                x={pos.x + cellSize}
                y={pos.y + cellSize}
                width={5 * cellSize}
                height={5 * cellSize}
                fill="white"
              />
              <rect
                x={pos.x + 2 * cellSize}
                y={pos.y + 2 * cellSize}
                width={3 * cellSize}
                height={3 * cellSize}
                fill="#111"
              />
            </g>
          ))}
        </svg>
      </div>
      <p className="text-xs text-muted-foreground font-mono">Scan to reorder</p>
    </div>
  );
}

function QRModal({
  orderId,
  onClose,
}: { orderId: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm px-4"
      data-ocid="orders.qr_modal.dialog"
    >
      <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-foreground">
              Quick Reorder QR
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Scan to add all items to cart
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close"
            data-ocid="orders.qr_modal.close_button"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <QRCodeDisplay value={orderId} />
        <p className="text-xs text-center text-muted-foreground mt-4">
          Order ID: <span className="font-mono text-foreground">{orderId}</span>
        </p>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={onClose}
          data-ocid="orders.qr_modal.cancel_button"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  index,
}: { order: Order; index: number }) {
  const addToCart = useAddToCart();
  const [reordering, setReordering] = useState(false);

  const handleReorder = async () => {
    setReordering(true);
    try {
      for (const item of order.items) {
        await addToCart.mutateAsync({
          productId: item.productId,
          qty: item.quantity,
        });
      }
      toast.success("Items added to cart!");
    } catch {
      toast.error("Failed to reorder");
    } finally {
      setReordering(false);
    }
  };
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.Pending;
  const previewItems = order.items.slice(0, 3);
  const extraCount = order.items.length - 3;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-4 hover:shadow-elevated hover:border-primary/20 transition-all duration-200 dark:hover:border-primary/20">
      <Link
        to="/orders/$orderId"
        params={{ orderId: order.id }}
        data-ocid={`orders.item.${index + 1}`}
        className="block"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-semibold text-foreground">
                {order.id}
              </span>
              <Badge
                className={`text-xs border ${cfg.className}`}
                data-ocid={`orders.status.${index + 1}`}
              >
                {cfg.label}
              </Badge>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-foreground text-base">
              ${order.total.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {previewItems.map((item) => (
            <div
              key={item.productId}
              className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0"
            >
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {extraCount > 0 && (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
              +{extraCount}
            </div>
          )}
          <div className="ml-auto flex items-center gap-1 text-primary text-sm font-medium">
            View Details
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground truncate">
          {previewItems.map((i) => i.productName).join(" · ")}
          {extraCount > 0 && ` · +${extraCount} more`}
        </p>
      </Link>

      {/* Direct reorder button */}
      <div className="mt-3 pt-3 border-t border-border flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReorder}
          disabled={reordering}
          className="gap-2 text-xs h-8"
        >
          {reordering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Reorder Items
        </Button>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { data: rawOrders, isLoading } = useOrders();
  const [qrOrderId, setQrOrderId] = useState<string | null>(null);

  const orders = useMemo(() => {
    const raw = rawOrders ?? [];
    return raw.length > 0 ? raw : DEMO_ORDERS;
  }, [rawOrders]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {qrOrderId && (
        <QRModal orderId={qrOrderId} onClose={() => setQrOrderId(null)} />
      )}

      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-6"
        data-ocid="orders.page"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              My Orders
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track and manage your orders
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-0 text-sm px-3 py-1">
            {orders.length} orders
          </Badge>
        </div>

        {orders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center min-h-[50vh] gap-5"
            data-ocid="orders.empty_state"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-display font-bold text-foreground">
                No orders yet
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Place your first order to see it here
              </p>
            </div>
            <Link to="/home">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                data-ocid="orders.start_shopping_button"
              >
                <ShoppingBag className="w-4 h-4" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4" data-ocid="orders.list">
            {orders.map((order, idx) => (
              <OrderCard
                key={order.id}
                order={order}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
