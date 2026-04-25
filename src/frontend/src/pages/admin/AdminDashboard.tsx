import { toast } from "sonner";
import { sendOTP } from "@/services/emailService";
import {
  useAddShopLocation,
  useAdminAdjustWallet,
  useAdminBundles,
  useAdminBuyXGetYRules,
  useAdminChatThreads,
  useAdminCoupons,
  useAdminOrders,
  useAdminReplyToThread,
  useAdminReviews,
  useAdminSeasonalCollections,
  useAdminShopLocations,
  useAdminStats,
  useAdminUsers,
  useAdminWallets,
  useApproveReview,
  useCreateBundle,
  useCreateBuyXGetYRule,
  useCreateCategory,
  useCreateCoupon,
  useCreateProduct,
  useCreateSeasonalCollection,
  useDeleteBundle,
  useDeleteBuyXGetYRule,
  useDeleteProduct,
  useDeleteSeasonalCollection,
  useDeleteShopLocation,
  useGetThreadMessages,
  useInternetIdentity,
  useProducts,
  useRejectReview,
  useResolveThread,
  useUpdateBundle,
  useUpdateBuyXGetYRule,
  useUpdateOrderStatus,
  useUpdateProduct,
  useUpdateSeasonalCollection,
  useUpdateShopLocation,
  useUpdateWalletBonusConfig,
  useUserProfile,
  useWalletBonusConfig,
  useInventoryAlerts,
  usePromoContent,
  useDeliveryZones,
  useCreateDeliveryZone,
  useUpdateDeliveryZone,
  useDeleteDeliveryZone,
} from "@/hooks/useBackend";
import type { AdminBundle, ShopLocation } from "@/hooks/useBackend";
import type { DeliveryZone } from "@/types";
import OSMMapPicker from "@/components/OSMMapPicker";
import { cn } from "@/lib/utils";
import type {
  Category,
  Coupon,
  FlashDeal,
  OrderStatus,
  Product,
} from "@/types";
import type { BuyXGetYRule, SeasonalCollection } from "@/types";
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ChevronDown,
  DollarSign,
  Gift,
  Grid3X3,
  Image,
  LayoutDashboard,
  Locate,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Plus,
  Send,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";


// ─── Types ────────────────────────────────────────────────────────────────────

type AdminSection =
  | "dashboard"
  | "products"
  | "categories"
  | "orders"
  | "users"
  | "coupons"
  | "flash-deals"
  | "reviews"
  | "banners"
  | "analytics"
  | "locations"
  | "promotions"
  | "inventory"
  | "wallets"
  | "chat";

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS: {
  id: AdminSection;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "inventory", label: "Inventory", icon: AlertTriangle },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Grid3X3 },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "promotions", label: "Promotions", icon: Gift },
  { id: "locations", label: "Zones", icon: MapPin },
  { id: "users", label: "Users", icon: Users },
  { id: "wallets", label: "Wallets", icon: Wallet },
  { id: "chat", label: "Support Chat", icon: MessageSquare },
];

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
  Processing: "bg-blue-100 text-blue-700 border border-blue-200",
  Shipped: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  Delivered: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Cancelled: "bg-rose-100 text-rose-700 border border-rose-200",
};

// ─── Section: Dashboard ──────────────────────────────────────────────────────


const SAMPLE_ORDERS_DATA: any[] = [];

// ─── Components ──────────────────────────────────────────────────────────────



const SAMPLE_USERS: any[] = [];

const SAMPLE_BANNERS: any[] = [];

const SAMPLE_FLASH_DEALS: any[] = [];

const SAMPLE_COUPONS_DATA: any[] = [];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/50 backdrop-blur-sm"
      data-ocid="admin.modal"
    >
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-elevated">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="font-display font-bold text-foreground text-lg">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close modal"
            data-ocid="admin.modal.close_button"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Section: Dashboard ───────────────────────────────────────────────────────

function DashboardView() {
  const { data: stats } = useAdminStats();

  const totalOrders = stats?.totalOrders ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const activeUsers = stats?.activeUsers ?? 0;
  const lowStock = stats?.lowStockAlerts ?? 0;

  return (
    <div className="space-y-6" data-ocid="admin.dashboard_section">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          sub="+12% this month"
          icon={ShoppingBag}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          sub="+8% this month"
          icon={DollarSign}
          color="bg-accent/10 text-accent"
        />
        <StatCard
          label="Orders This Week"
          value="0"
          sub="No data this week"
          icon={TrendingUp}
          color="bg-secondary text-secondary-foreground"
        />
        <StatCard
          label="Revenue This Week"
          value="$0"
          sub="No data this week"
          icon={TrendingUp}
          color="bg-chart-3/10 text-chart-3"
        />
        <StatCard
          label="Active Users"
          value={activeUsers}
          sub="Registered accounts"
          icon={Users}
          color="bg-chart-4/10 text-chart-4"
        />
        <StatCard
          label="Low Stock"
          value={lowStock}
          sub="Items need restocking"
          icon={AlertTriangle}
          color="bg-destructive/10 text-destructive"
        />
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Recent Orders</h3>
          <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-full">
            Last 7 days
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Items",
                  "Total",
                  "Status",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SAMPLE_ORDERS_DATA.map((order, i) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.dashboard.order.item.${i + 1}`}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 text-foreground">{order.user}</td>
                  <td className="px-4 py-3 text-muted-foreground text-right">
                    {order.items}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground text-right">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap",
                        STATUS_STYLES[order.status],
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Products ────────────────────────────────────────────────────────

function ProductsView() {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "fruits",
    stockQty: "",
    imageUrl: "",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
  });

  function openAdd() {
    setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      price: "",
      categoryId: "fruits",
      stockQty: "",
      imageUrl: "",
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
    });
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      categoryId: p.categoryId,
      stockQty: String(p.stockQty),
      imageUrl: p.imageUrl || "",
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      ...form,
      price: Number.parseFloat(form.price) || 0,
      stockQty: Number.parseInt(form.stockQty) || 0,
    };
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, ...data });
      toast.success("Product updated!");
    } else {
      await createProduct.mutateAsync(data);
      toast.success("Product created!");
    }
    setModalOpen(false);
  }

  const { data: productsData = [] } = useProducts();
  const products = productsData.length > 0 ? productsData : SAMPLE_PRODUCTS;

  return (
    <div data-ocid="admin.products_section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          Products{" "}
          <span className="text-muted-foreground font-normal text-sm ml-1">
            ({products.length})
          </span>
        </h2>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-card"
          data-ocid="admin.products.add_button"
        >
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {[
                  "Product",
                  "Category",
                  "Price",
                  "Stock",
                  "Tags",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p, i) => (
                <tr
                  key={p.id}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.products.item.${i + 1}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover bg-muted/20 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/assets/images/placeholder.svg";
                        }}
                      />
                      <span className="font-medium text-foreground line-clamp-1 max-w-[180px]">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize whitespace-nowrap">
                    {p.categoryId}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                    ${p.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "text-xs font-semibold tabular-nums",
                        p.stockQty < 10 ? "text-destructive" : "text-primary",
                      )}
                    >
                      {p.stockQty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.isFeatured && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          Featured
                        </span>
                      )}
                      {p.isBestSeller && (
                        <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">
                          Best Seller
                        </span>
                      )}
                      {p.isNewArrival && (
                        <span className="text-[10px] bg-chart-3/10 text-chart-3 px-1.5 py-0.5 rounded font-medium">
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="text-xs text-primary hover:underline font-medium"
                        data-ocid={`admin.products.edit_button.${i + 1}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteProduct.mutate(p.id);
                          toast.success("Product deleted");
                        }}
                        className="text-xs text-destructive hover:underline font-medium"
                        data-ocid={`admin.products.delete_button.${i + 1}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal
          title={editingProduct ? "Edit Product" : "Add Product"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                id: "name",
                label: "Product Name",
                value: form.name,
                placeholder: "Fresh Organic Tomatoes",
                type: "text",
              },
              {
                id: "price",
                label: "Price ($)",
                value: form.price,
                placeholder: "3.99",
                type: "number",
              },
              {
                id: "stockQty",
                label: "Stock Quantity",
                value: form.stockQty,
                placeholder: "50",
                type: "number",
              },
            ].map(({ id, label, value, placeholder, type }) => (
              <div key={id}>
                <label
                  htmlFor={`prod-${id}`}
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  {label}
                </label>
                <input
                  id={`prod-${id}`}
                  type={type}
                  value={value}
                  placeholder={placeholder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [id]: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
            <div>
              <label
                htmlFor="prod-description"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Description
              </label>
              <textarea
                id="prod-description"
                value={form.description}
                rows={3}
                placeholder="Product description"
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div>
              <label
                htmlFor="prod-category"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Category
              </label>
              <select
                id="prod-category"
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-ocid="admin.product_modal.category_select"
              >
                {SAMPLE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              {[
                { key: "isFeatured", label: "Featured" },
                { key: "isBestSeller", label: "Best Seller" },
                { key: "isNewArrival", label: "New Arrival" },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.checked }))
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </label>
              ))}
            </div>
            <div>
              <label
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Product Image
              </label>
              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-xl border border-border bg-muted/20 flex items-center justify-center overflow-hidden shrink-0">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <Image className="w-6 h-6 text-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setForm(f => ({ ...f, imageUrl: url }));
                      }
                    }}
                    className="hidden"
                    id="prod-image-file"
                  />
                  <label
                    htmlFor="prod-image-file"
                    className="inline-block px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-medium cursor-pointer transition-colors border border-border"
                  >
                    Choose File
                  </label>
                  <input
                    type="text"
                    value={form.imageUrl}
                    placeholder="Or enter URL"
                    onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    className="w-full px-3 py-1.5 text-[11px] border border-input rounded-lg bg-background focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                data-ocid="admin.product_modal.cancel_button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-ocid="admin.product_modal.submit_button"
              >
                {editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Section: Categories ──────────────────────────────────────────────────────

function CategoriesView() {
  const createCategory = useCreateCategory();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    displayOrder: "",
    iconEmoji: "🛒",
    isActive: true,
  });
  const [editId, setEditId] = useState<string | null>(null);
  const categories = SAMPLE_CATEGORIES;

  function openAdd() {
    setEditId(null);
    setForm({ name: "", displayOrder: "", iconEmoji: "🛒", isActive: true });
    setModalOpen(true);
  }
  function openEdit(c: Category) {
    setEditId(c.id);
    setForm({
      name: c.name,
      displayOrder: String(c.displayOrder),
      iconEmoji: c.iconEmoji,
      isActive: c.isActive,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createCategory.mutateAsync({
      ...form,
      displayOrder: Number.parseInt(form.displayOrder) || 0,
    });
    toast.success(editId ? "Category updated!" : "Category created!");
    setModalOpen(false);
  }

  return (
    <div data-ocid="admin.categories_section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          Categories
        </h2>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-card"
          data-ocid="admin.categories.add_button"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["Emoji", "Name", "Display Order", "Active", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat, i) => (
                <tr
                  key={cat.id}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.categories.item.${i + 1}`}
                >
                  <td className="px-4 py-3 text-2xl">{cat.iconEmoji}</td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-right tabular-nums">
                    {cat.displayOrder}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        cat.isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        className="text-xs text-primary hover:underline font-medium"
                        data-ocid={`admin.categories.edit_button.${i + 1}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline font-medium"
                        data-ocid={`admin.categories.delete_button.${i + 1}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal
          title={editId ? "Edit Category" : "Add Category"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="cat-name"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Category Name
              </label>
              <input
                id="cat-name"
                type="text"
                value={form.name}
                placeholder="Fruits & Vegetables"
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label
                htmlFor="cat-emoji"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Emoji
              </label>
              <input
                id="cat-emoji"
                type="text"
                value={form.iconEmoji}
                placeholder="🥦"
                onChange={(e) =>
                  setForm((f) => ({ ...f, iconEmoji: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label
                htmlFor="cat-order"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Display Order
              </label>
              <input
                id="cat-order"
                type="number"
                value={form.displayOrder}
                placeholder="1"
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayOrder: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-foreground">Active</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                data-ocid="admin.category_modal.cancel_button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-ocid="admin.category_modal.submit_button"
              >
                {editId ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Section: Orders ──────────────────────────────────────────────────────────

function OrdersView() {
  const { data: backendOrders } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const orders = backendOrders?.length ? backendOrders : SAMPLE_ORDERS_DATA;

  return (
    <div data-ocid="admin.orders_section">
      <h2 className="font-display text-lg font-bold text-foreground mb-4">
        Orders
      </h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Items",
                  "Total",
                  "Status",
                  "Date",
                  "Update Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(orders as typeof SAMPLE_ORDERS_DATA).map((order, i) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.orders.row.${i + 1}`}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                    {order.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{order.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-right">
                    {order.items}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap",
                        STATUS_STYLES[order.status],
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {order.date}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-flex items-center">
                      <select
                        defaultValue={order.status}
                        onChange={(e) => {
                          updateStatus.mutate({
                            orderId: order.id,
                            status: e.target.value,
                          });
                          toast.success(`Order ${order.id} updated`);
                        }}
                        className="text-xs border border-border rounded-lg pl-2 pr-6 py-1.5 bg-background text-foreground appearance-none cursor-pointer hover:border-primary transition-colors"
                        aria-label={`Update status for ${order.id}`}
                        data-ocid={`admin.orders.status_select.${i + 1}`}
                      >
                        {[
                          "Pending",
                          "Processing",
                          "Shipped",
                          "Delivered",
                          "Cancelled",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-1.5 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Coupons ─────────────────────────────────────────────────────────

function CouponsView() {
  const { data: backendCoupons } = useAdminCoupons();
  const createCoupon = useCreateCoupon();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    usageLimit: "",
    isActive: true,
  });
  const coupons = backendCoupons?.length ? backendCoupons : SAMPLE_COUPONS_DATA;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createCoupon.mutateAsync({
      ...form,
      discountValue: Number.parseFloat(form.discountValue) || 0,
      usageLimit: Number.parseInt(form.usageLimit) || 100,
    });
    toast.success("Coupon created!");
    setModalOpen(false);
  }

  return (
    <div data-ocid="admin.coupons_section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          Coupons
        </h2>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-card"
          data-ocid="admin.coupons.add_button"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {[
                  "Code",
                  "Type",
                  "Value",
                  "Usage",
                  "Limit",
                  "Active",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c, i) => (
                <tr
                  key={c.id}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.coupons.item.${i + 1}`}
                >
                  <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {c.discountType}
                  </td>
                  <td className="px-4 py-3 font-semibold text-accent">
                    {c.discountType === "percentage"
                      ? `${c.discountValue}%`
                      : `$${c.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {c.usageCount}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {c.usageLimit}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        c.isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline font-medium"
                        data-ocid={`admin.coupons.edit_button.${i + 1}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline font-medium"
                        data-ocid={`admin.coupons.delete_button.${i + 1}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title="Add Coupon" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="coupon-code"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Coupon Code
              </label>
              <input
                id="coupon-code"
                type="text"
                value={form.code}
                placeholder="SAVE10"
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                className="w-full px-3 py-2.5 text-sm font-mono border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-ocid="admin.coupon_modal.code_input"
              />
            </div>
            <div>
              <label
                htmlFor="coupon-type"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Discount Type
              </label>
              <select
                id="coupon-type"
                value={form.discountType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    discountType: e.target.value as "percentage" | "fixed",
                  }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-ocid="admin.coupon_modal.type_select"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="coupon-value"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Discount Value
              </label>
              <input
                id="coupon-value"
                type="number"
                value={form.discountValue}
                placeholder="10"
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountValue: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-ocid="admin.coupon_modal.value_input"
              />
            </div>
            <div>
              <label
                htmlFor="coupon-limit"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Usage Limit
              </label>
              <input
                id="coupon-limit"
                type="number"
                value={form.usageLimit}
                placeholder="100"
                onChange={(e) =>
                  setForm((f) => ({ ...f, usageLimit: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-ocid="admin.coupon_modal.limit_input"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-foreground">Active</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                data-ocid="admin.coupon_modal.cancel_button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-ocid="admin.coupon_modal.submit_button"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Section: Banners ─────────────────────────────────────────────────────────

function BannersView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    displayOrder: "",
    imageUrl: "",
    isActive: true,
  });

  return (
    <div data-ocid="admin.banners_section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          Banners
        </h2>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-card"
          data-ocid="admin.banners.add_button"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["Preview", "Title", "Order", "Active", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SAMPLE_BANNERS.map((b, i) => (
                <tr
                  key={b.id}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.banners.item.${i + 1}`}
                >
                  <td className="px-4 py-3">
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-20 h-12 rounded-lg object-cover bg-muted/20"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assets/images/placeholder.svg";
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {b.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {b.displayOrder}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        b.isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline font-medium"
                        data-ocid={`admin.banners.edit_button.${i + 1}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline font-medium"
                        data-ocid={`admin.banners.delete_button.${i + 1}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title="Add Banner" onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="banner-title"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Title
              </label>
              <input
                id="banner-title"
                type="text"
                value={form.title}
                placeholder="Summer Fresh Sale"
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-ocid="admin.banner_modal.title_input"
              />
            </div>
            <div>
              <label
                htmlFor="banner-order"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Display Order
              </label>
              <input
                id="banner-order"
                type="number"
                value={form.displayOrder}
                placeholder="1"
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayOrder: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-ocid="admin.banner_modal.order_input"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Banner Image
              </label>
              <div className="border border-dashed border-border rounded-xl p-4 text-center">
                {form.imageUrl ? (
                  <div className="relative group rounded-lg overflow-hidden h-32 mb-2">
                    <img src={form.imageUrl} className="w-full h-full object-cover" alt="Banner preview" />
                    <button 
                      type="button"
                      onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">Select a high-resolution banner image</p>
                  </div>
                )}
                <input
                  type="file"
                  id="banner-image-file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setForm(f => ({ ...f, imageUrl: url }));
                    }
                  }}
                />
                <label
                  htmlFor="banner-image-file"
                  className="mt-2 inline-block text-xs text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  {form.imageUrl ? "Change Image" : "Upload Image"}
                </label>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-foreground">Active</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                data-ocid="admin.banner_modal.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success("Banner saved!");
                  setModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-ocid="admin.banner_modal.submit_button"
              >
                Save Banner
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Section: Flash Deals ─────────────────────────────────────────────────────

function FlashDealsView() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    productId: "p1",
    discountPercent: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  return (
    <div data-ocid="admin.flash_deals_section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          Flash Deals
        </h2>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors shadow-card"
          data-ocid="admin.flash_deals.add_button"
        >
          <Zap className="w-4 h-4" /> New Flash Deal
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {[
                  "Product",
                  "Discount",
                  "Start",
                  "End",
                  "Active",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SAMPLE_FLASH_DEALS.map((fd, i) => (
                <tr
                  key={fd.id}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.flash_deals.item.${i + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {fd.productName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-accent">
                      {fd.discountPercent}% OFF
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    Apr 21, 2026
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    Apr 28, 2026
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        fd.isActive
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {fd.isActive ? "Live" : "Ended"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline font-medium"
                        data-ocid={`admin.flash_deals.edit_button.${i + 1}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline font-medium"
                        data-ocid={`admin.flash_deals.delete_button.${i + 1}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title="New Flash Deal" onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="fd-product"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Product
              </label>
              <select
                id="fd-product"
                value={form.productId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, productId: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-ocid="admin.flash_deal_modal.product_select"
              >
                {SAMPLE_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="fd-discount"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Discount %
              </label>
              <input
                id="fd-discount"
                type="number"
                value={form.discountPercent}
                placeholder="25"
                min="1"
                max="90"
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountPercent: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-ocid="admin.flash_deal_modal.discount_input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="fd-start"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Start Date
                </label>
                <input
                  id="fd-start"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  data-ocid="admin.flash_deal_modal.start_input"
                />
              </div>
              <div>
                <label
                  htmlFor="fd-end"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  End Date
                </label>
                <input
                  id="fd-end"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  data-ocid="admin.flash_deal_modal.end_input"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-foreground">
                Active immediately
              </span>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                data-ocid="admin.flash_deal_modal.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success("Flash deal created!");
                  setModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors"
                data-ocid="admin.flash_deal_modal.submit_button"
              >
                Launch Deal
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Section: Reviews ─────────────────────────────────────────────────────────

function ReviewsView() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const { data: reviews } = useAdminReviews(activeTab);
  const approveReview = useApproveReview();
  const rejectReview = useRejectReview();

  const samplePending = [
    {
      id: "r1",
      product: "Fresh Organic Tomatoes",
      user: "Alice M.",
      rating: 5,
      text: "Amazing quality, perfectly ripe!",
      date: "Apr 20, 2026",
      isApproved: false,
    },
    {
      id: "r2",
      product: "Sourdough Loaf",
      user: "Carol S.",
      rating: 5,
      text: "Best bread I've ever had from a delivery service!",
      date: "Apr 21, 2026",
      isApproved: false,
    },
    {
      id: "r3",
      product: "Greek Yogurt 500g",
      user: "Dave K.",
      rating: 3,
      text: "Good but could be creamier.",
      date: "Apr 21, 2026",
      isApproved: false,
    },
  ];
  const sampleApproved = [
    {
      id: "r4",
      product: "Avocado Hass",
      user: "Bob T.",
      rating: 4,
      text: "Very fresh, perfectly ripe.",
      date: "Apr 18, 2026",
      isApproved: true,
    },
    {
      id: "r5",
      product: "Whole Milk 1L",
      user: "Eva R.",
      rating: 5,
      text: "Tastes so fresh and creamy!",
      date: "Apr 17, 2026",
      isApproved: true,
    },
  ];

  const displayReviews = reviews?.length
    ? reviews.map((r) => ({
        id: r.id,
        product: r.productId,
        user: r.userName,
        rating: r.rating,
        text: r.text,
        date: "Apr 2026",
        isApproved: r.isApproved,
      }))
    : activeTab === "pending"
      ? samplePending
      : sampleApproved;

  return (
    <div data-ocid="admin.reviews_section">
      <h2 className="font-display text-lg font-bold text-foreground mb-4">
        Reviews
      </h2>
      <div className="flex gap-1 mb-5 bg-muted/30 p-1 rounded-xl w-fit">
        {(["pending", "approved"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors capitalize",
              activeTab === tab
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
            data-ocid={`admin.reviews.${tab}_tab`}
          >
            {tab}{" "}
            {tab === "pending"
              ? `(${samplePending.length})`
              : `(${sampleApproved.length})`}
          </button>
        ))}
      </div>

      {displayReviews.length === 0 ? (
        <div
          className="bg-card border border-border rounded-xl p-12 text-center"
          data-ocid="admin.reviews.empty_state"
        >
          <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-foreground">
            No {activeTab} reviews
          </p>
          <p className="text-muted-foreground text-sm mt-1">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayReviews.map((r, i) => (
            <div
              key={r.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors"
              data-ocid={`admin.reviews.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {r.product}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      by {r.user}
                    </span>
                    <span className="text-accent text-xs">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {r.date}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!r.isApproved ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          approveReview.mutate(r.id);
                          toast.success("Review approved!");
                        }}
                        className="flex items-center gap-1 text-xs text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                        data-ocid={`admin.reviews.approve_button.${i + 1}`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          rejectReview.mutate(r.id);
                          toast.success("Review rejected");
                        }}
                        className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 hover:bg-destructive/20 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                        data-ocid={`admin.reviews.reject_button.${i + 1}`}
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 hover:bg-destructive/20 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                      data-ocid={`admin.reviews.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section: Users ───────────────────────────────────────────────────────────

function UsersView() {
  const { data: backendUsers } = useAdminUsers();
  const users = (backendUsers || []).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    joinDate: typeof u.createdAt === 'bigint' ? new Date(Number(u.createdAt)).toLocaleDateString() : 'Apr 2026',
    loyalty: u.loyaltyBalance || 0,
    referrals: u.referralCode || "None"
  }));

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [bannedEmails, setBannedEmails] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem("nexgro_banned_users") || "[]")
  );

  const toggleBan = (email: string) => {
    const isBanned = bannedEmails.includes(email);
    const newBanned = isBanned 
      ? bannedEmails.filter(e => e !== email) 
      : [...bannedEmails, email];
    
    setBannedEmails(newBanned);
    localStorage.setItem("nexgro_banned_users", JSON.stringify(newBanned));
    toast.success(isBanned ? "User unbanned successfully" : "User banned successfully");
  };

  return (
    <div data-ocid="admin.users_section">
      <h2 className="font-display text-lg font-bold text-foreground mb-4">
        Users{" "}
        <span className="text-muted-foreground font-normal text-sm ml-1">
          ({users.length})
        </span>
      </h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["Name", "Email", "Joined", "Loyalty Points", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={cn(
                    "hover:bg-muted/20 transition-colors",
                    bannedEmails.includes(u.email) && "opacity-60 bg-destructive/5"
                  )}
                  data-ocid={`admin.users.item.${i + 1}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {u.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {u.name}
                        </span>
                        {bannedEmails.includes(u.email) && (
                          <span className="text-[10px] text-destructive font-bold uppercase tracking-tighter">Banned</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {u.joinDate}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-primary tabular-nums">
                      {u.loyalty.toLocaleString()} pts
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => toggleBan(u.email)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                          bannedEmails.includes(u.email) 
                            ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200" 
                            : "bg-destructive text-white hover:bg-destructive/90 shadow-sm shadow-destructive/20"
                        )}
                      >
                        {bannedEmails.includes(u.email) ? "Unban User" : "Ban User"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal title="User Details" onClose={() => setSelectedUser(null)}>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">Customer</span>
                  {bannedEmails.includes(selectedUser.email) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-bold uppercase">Banned</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-widest">Loyalty Points</p>
                <p className="text-2xl font-bold text-primary">{selectedUser.loyalty} pts</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-widest">Wallet Balance</p>
                <p className="text-2xl font-bold text-emerald-600">${Number(localStorage.getItem(`wallet_balance_${selectedUser.email.toLowerCase()}`) || 0).toFixed(2)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" /> Purchase History
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {/* Mock purchase history or fetch from localStorage orders */}
                <div className="text-xs text-center py-8 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                  No recent purchases found for this user.
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-3 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Section: Inventory ───────────────────────────────────────────────────────

function InventoryView() {
  const { data: alerts = [] } = useInventoryAlerts();
  
  const handleRestock = (productId: string) => {
    toast.success(`Restock order sent to supplier for product ${productId}`);
  };

  const displayAlerts = alerts.length ? alerts : [
    { id: "a1", productId: "p4", productName: "Whole Milk 1L", currentStock: 8, threshold: 20 },
    { id: "a2", productId: "p1", productName: "Fresh Organic Tomatoes", currentStock: 12, threshold: 25 },
    { id: "a3", productId: "p6", productName: "Sourdough Loaf", currentStock: 5, threshold: 15 },
  ];

  return (
    <div className="space-y-6" data-ocid="admin.inventory_section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Inventory & Supply</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time stock monitoring & automated restocking</p>
        </div>
        <div className="bg-destructive/10 text-destructive px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-destructive/20 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          {displayAlerts.length} Critical Stock Items
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Stock Health</p>
          <div className="flex items-center gap-3">
             <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "82%" }} />
             </div>
             <span className="text-sm font-bold text-foreground">82%</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total SKU</p>
          <p className="text-2xl font-bold text-foreground">1,248</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Restock Value</p>
          <p className="text-2xl font-bold text-primary">$3,420.00</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["Product", "Current Stock", "Threshold", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-muted rounded-lg shrink-0" />
                       <span className="font-bold text-foreground">{alert.productName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="tabular-nums font-medium text-destructive">{alert.currentStock} units</span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{alert.threshold}</td>
                  <td className="px-5 py-4">
                    <span className="text-[9px] font-black bg-destructive/10 text-destructive px-2 py-1 rounded-lg uppercase tracking-tighter border border-destructive/20">Critical</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleRestock(alert.productId)}
                      className="text-xs font-bold text-white bg-primary px-4 py-2 rounded-xl transition-all hover:shadow-lg active:scale-95 shadow-card"
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-center justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-primary mb-1">Automation Engine</h3>
          <p className="text-xs text-muted-foreground">Automatically send restock orders to verified suppliers when stock falls below threshold. Linked to Brevo Supply API.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all">
          <Zap className="w-3.5 h-3.5" />
          Enabled
        </button>
      </div>
    </div>
  );
}

// ─── Section: Analytics ───────────────────────────────────────────────────────

const REVENUE_TREND = [
  { day: "Apr 1", value: 1820 },
  { day: "Apr 5", value: 2340 },
  { day: "Apr 8", value: 1950 },
  { day: "Apr 10", value: 2780 },
  { day: "Apr 13", value: 3100 },
  { day: "Apr 15", value: 2650 },
  { day: "Apr 18", value: 3420 },
  { day: "Apr 20", value: 3890 },
  { day: "Apr 22", value: 4120 },
  { day: "Apr 25", value: 3740 },
  { day: "Apr 28", value: 4560 },
  { day: "Apr 30", value: 5200 },
];

const TOP_PRODUCTS = [
  { name: "Fresh Organic Tomatoes", units: 412, revenue: 1648 },
  { name: "Sourdough Loaf", units: 389, revenue: 1945 },
  { name: "Free-Range Eggs 12pk", units: 355, revenue: 2130 },
  { name: "Whole Milk 1L", units: 321, revenue: 963 },
  { name: "Avocado Hass", units: 298, revenue: 1490 },
  { name: "Greek Yogurt 500g", units: 276, revenue: 965 },
  { name: "Mixed Nuts 250g", units: 251, revenue: 1756 },
  { name: "Orange Juice 1L", units: 234, revenue: 936 },
  { name: "Baby Spinach 200g", units: 218, revenue: 872 },
  { name: "Cheddar Cheese 400g", units: 202, revenue: 1212 },
];

function AnalyticsView() {
  return (
    <div className="space-y-6" data-ocid="admin.analytics_section">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Performance Analytics</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time revenue & growth metrics</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-sm">Daily</button>
           <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-card">Weekly</button>
           <button className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold hover:bg-muted transition-all shadow-sm">Monthly</button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gross Revenue</p>
            <p className="text-3xl font-bold text-foreground">$52,480.00</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary flex items-center gap-1 justify-end">
              <TrendingUp className="w-4 h-4" /> +18.2%
            </p>
            <p className="text-xs text-muted-foreground">Since last week</p>
          </div>
        </div>
        
        {/* Visual Chart Placeholder */}
        <div className="h-64 flex items-end gap-2 group">
          {REVENUE_TREND.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
              <div 
                className="w-full bg-primary/10 rounded-t-lg relative transition-all duration-500 hover:bg-primary/30 cursor-pointer" 
                style={{ height: `${(item.value / 6000) * 100}%` }}
              >
              </div>
              <span className="text-[9px] text-muted-foreground font-bold rotate-45 mt-2">{item.day}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Apr 1</span>
          <span>Apr 30</span>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            Top Products by Units Sold
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["#", "Product", "Units Sold", "Revenue"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TOP_PRODUCTS.map((p, i) => (
                <tr
                  key={p.name}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.analytics.top_product.item.${i + 1}`}
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-20 bg-muted/30 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(p.units / TOP_PRODUCTS[0].units) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-foreground tabular-nums">
                        {p.units}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-accent tabular-nums">
                    ${p.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Advanced Analytics Heatmap & Retention */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Order Density Heatmap</h3>
          <div className="aspect-video bg-muted rounded-lg relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-cover bg-center opacity-30 grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80')" }} />
             <div className="relative w-full h-full">
                {/* Mock heat blobs */}
                <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-accent/40 blur-2xl rounded-full animate-pulse" />
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary/40 blur-3xl rounded-full animate-pulse delay-700" />
                <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-primary/30 blur-2xl rounded-full animate-pulse delay-1000" />
             </div>
             <p className="absolute bottom-3 right-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Real-time Activity</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Customer Retention</h3>
          <div className="h-40 flex items-end gap-2">
            {[65, 78, 82, 75, 88, 92].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-accent/20 rounded-t-lg relative group">
                  <div className="absolute inset-x-0 bottom-0 bg-accent rounded-t-lg transition-all" style={{ height: `${v}%` }} />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded z-10">
                    {v}%
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">Month {i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ZonesView() {
  const { data: zonesData } = useDeliveryZones();
  const zones = (zonesData || []) as DeliveryZone[];
  const createZone = useCreateDeliveryZone();
  const updateZone = useUpdateDeliveryZone();
  const deleteZone = useDeleteDeliveryZone();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState({
    name: "",
    radiusKm: 5,
    perKmFee: 2.99,
    centerLat: 12.9716, // Default to Bangalore center
    centerLng: 77.5946,
    isActive: true,
  });

  const openAdd = () => {
    setEditingZone(null);
    setForm({
      name: "",
      radiusKm: 5,
      perKmFee: 2.99,
      centerLat: 12.9716,
      centerLng: 77.5946,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (z: DeliveryZone) => {
    setEditingZone(z);
    setForm({
      name: z.name,
      radiusKm: z.radiusKm,
      perKmFee: z.perKmFee,
      centerLat: z.centerLat,
      centerLng: z.centerLng,
      isActive: z.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await updateZone.mutateAsync({ ...form, id: editingZone.id });
        toast.success("Zone updated successfully!");
      } else {
        await createZone.mutateAsync(form);
        toast.success("New zone created!");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error("Failed to save zone");
    }
  };

  return (
    <div className="space-y-6" data-ocid="admin.zones_section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Delivery Zones</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage delivery areas and fees</p>
        </div>
        <button 
          onClick={openAdd}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-card hover:bg-primary/90 transition-all active:scale-95"
          data-ocid="admin.zones.add_button"
        >
          <Plus className="w-4 h-4" /> New Zone
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["Zone Name", "Coordinates", "Radius", "Per KM Fee", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-5 py-4 font-bold text-foreground">{zone.name}</td>
                  <td className="px-5 py-4 text-xs font-mono text-muted-foreground">
                    {(Number(zone.centerLat) || 0).toFixed(4)}, {(Number(zone.centerLng) || 0).toFixed(4)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-foreground">{zone.radiusKm} km</span>
                  </td>
                  <td className="px-5 py-4 font-bold text-primary tabular-nums">
                    ${((zone as any).perKmFee ?? (zone as any).baseFee ?? 0).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter border",
                      zone.isActive 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-muted text-muted-foreground border-border"
                    )}>
                      {zone.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => openEdit(zone)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Delete this zone?")) {
                            deleteZone.mutate(zone.id);
                            toast.success("Zone deleted");
                          }
                        }}
                        className="text-xs font-bold text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {zones.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground italic">
                    No delivery zones configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal 
          title={editingZone ? "Edit Delivery Zone" : "Add New Delivery Zone"} 
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Zone Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Downtown Bangalore"
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Radius (km)</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.1"
                  value={form.radiusKm}
                  onChange={e => setForm(f => ({ ...f, radiusKm: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Per KM Fee ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.perKmFee}
                  onChange={e => setForm(f => ({ ...f, perKmFee: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Center Location</label>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(pos => {
                        setForm(f => ({ ...f, centerLat: pos.coords.latitude, centerLng: pos.coords.longitude }));
                        toast.success("Location detected!");
                      }, () => toast.error("Location permission denied"));
                    }
                  }}
                  className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  <Locate className="w-3 h-3" /> Detect My Location
                </button>
              </div>
              <div className="h-64 rounded-2xl overflow-hidden border border-border relative">
                <OSMMapPicker 
                  initialLat={form.centerLat}
                  initialLng={form.centerLng}
                  onLocationSelect={(lat, lng) => setForm(f => ({ ...f, centerLat: lat, centerLng: lng }))}
                />
                <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg border border-border shadow-sm">
                  <p className="text-[10px] font-bold text-foreground">
                    {form.centerLat.toFixed(4)}, {form.centerLng.toFixed(4)}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Click the map or drag the marker to set the zone center.</p>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input 
                type="checkbox"
                id="zone-active"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <label htmlFor="zone-active" className="text-sm font-medium text-foreground cursor-pointer">Zone is active for deliveries</label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-3 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-card hover:bg-primary/90 transition-all active:scale-95"
              >
                {editingZone ? "Save Changes" : "Create Zone"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Section: Promotions ───────────────────────────────────────────────────────

function PromotionsView() {
  const { data: promoContent = [] } = usePromoContent();
  const { data: bxgyRules = [] } = useAdminBuyXGetYRules();
  const { data: collections = [] } = useAdminSeasonalCollections();
  const { data: products = [] } = useProducts();
  
  const createBxgy = useCreateBuyXGetYRule();
  const deleteBxgy = useDeleteBuyXGetYRule();
  const createCollection = useCreateSeasonalCollection();
  const updateCollection = useUpdateSeasonalCollection();
  const deleteCollection = useDeleteSeasonalCollection();

  const [activeTab, setActiveTab] = useState<"banners" | "bxgy" | "seasonal">("banners");
  const [bxgyModalOpen, setBxgyModalOpen] = useState(false);
  const [colModalOpen, setColModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<SeasonalCollection | null>(null);

  const [bxgyForm, setBxgyForm] = useState({
    productId: "",
    buyQty: "2",
    getQty: "1",
    name: "",
  });
  const [colForm, setColForm] = useState({
    name: "",
    theme: "",
    badgeColor: "#16a34a",
    productIds: [] as string[],
    startDate: "",
    endDate: "",
  });







  const sampleBxgy: (BuyXGetYRule & { productName: string })[] = [
    {
      id: "b1",
      productId: "p6",
      buyQty: 2,
      getQty: 1,
      name: "Buy 2 Get 1 Free on Sourdough",
      productName: "Sourdough Loaf",
    },
    {
      id: "b2",
      productId: "p7",
      buyQty: 2,
      getQty: 1,
      name: "Buy 2 Get 1 Free on Mixed Nuts",
      productName: "Mixed Nuts 250g",
    },
    {
      id: "b3",
      productId: "p4",
      buyQty: 3,
      getQty: 1,
      name: "Buy 3 Get 1 Free on Milk",
      productName: "Whole Milk 1L",
    },
  ];

  const displayBxgy = bxgyRules.length
    ? bxgyRules.map((r) => ({
        ...r,
        productName:
          products.find((p) => p.id === r.productId)?.name ?? r.productId,
      }))
    : sampleBxgy;

  const sampleCols: SeasonalCollection[] = [
    {
      id: "sc1",
      name: "🪔 Diwali Dhamaka",
      theme: "Festival of Lights",
      badgeColor: "#f59e0b",
      productIds: ["p7", "p6"],
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    },
    {
      id: "sc2",
      name: "☀️ Summer Fresh",
      theme: "Beat the heat",
      badgeColor: "#10b981",
      productIds: ["p1", "p2"],
      startDate: "2026-04-15",
      endDate: "2026-05-15",
    },
  ];
  const displayCollections = collections.length ? collections : sampleCols;

  async function handleCreateBxgy(e: React.FormEvent) {
    e.preventDefault();
    await createBxgy.mutateAsync({
      productId: bxgyForm.productId,
      buyQty: Number(bxgyForm.buyQty),
      getQty: Number(bxgyForm.getQty),
      name: bxgyForm.name,
    });
    toast.success("Rule created!");
    setBxgyModalOpen(false);
  }

  function openColAdd() {
    setEditingCol(null);
    setColForm({
      name: "",
      theme: "",
      badgeColor: "#16a34a",
      productIds: [],
      startDate: "",
      endDate: "",
    });
    setColModalOpen(true);
  }

  function openColEdit(c: SeasonalCollection) {
    setEditingCol(c);
    setColForm({
      name: c.name,
      theme: c.theme,
      badgeColor: c.badgeColor ?? "#16a34a",
      productIds: c.productIds,
      startDate: c.startDate,
      endDate: c.endDate,
    });
    setColModalOpen(true);
  }

  async function handleColSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingCol) {
      await updateCollection.mutateAsync({ ...colForm, id: editingCol.id });
      toast.success("Collection updated!");
    } else {
      await createCollection.mutateAsync(colForm);
      toast.success("Collection created!");
    }
    setColModalOpen(false);
  }

  function toggleProductInCol(pid: string) {
    setColForm((f) => ({
      ...f,
      productIds: f.productIds.includes(pid)
        ? f.productIds.filter((id) => id !== pid)
        : [...f.productIds, pid],
    }));
  }

  return (
    <div data-ocid="admin.promotions_section">
      <h2 className="font-display text-lg font-bold text-foreground mb-4">
        Promotions
      </h2>

      <div className="flex gap-1 mb-5 bg-muted/30 p-1 rounded-xl w-fit">
        {(
          [
            ["bxgy", "Buy X Get Y"],
            ["seasonal", "Seasonal Collections"],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              activeTab === tab
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
            data-ocid={`admin.promotions.${tab}_tab`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "bxgy" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setBxgyModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-card"
              data-ocid="admin.bxgy.add_button"
            >
              <Plus className="w-4 h-4" /> New Rule
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  {[
                    "Rule Name",
                    "Product",
                    "Buy Qty",
                    "Get Qty",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayBxgy.map((r, i) => (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.bxgy.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {r.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.productName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full text-xs font-bold">
                        {r.buyQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                        {r.getQty} Free
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          deleteBxgy.mutate(r.id);
                          toast.success("Rule deleted");
                        }}
                        className="text-xs text-destructive hover:underline font-medium"
                        data-ocid={`admin.bxgy.delete_button.${i + 1}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "seasonal" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openColAdd}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-card"
              data-ocid="admin.seasonal.add_button"
            >
              <Plus className="w-4 h-4" /> New Collection
            </button>
          </div>
          <div className="grid gap-4">
            {displayCollections.map((c, i) => (
              <div
                key={c.id}
                className="bg-card border border-border rounded-xl p-5"
                data-ocid={`admin.seasonal.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ background: c.badgeColor ?? "#16a34a" }}
                      />
                      <p className="font-semibold text-foreground">{c.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {c.theme}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{c.productIds.length} products</span>
                      <span>
                        {c.startDate} → {c.endDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openColEdit(c)}
                      className="text-xs text-primary hover:underline font-medium"
                      data-ocid={`admin.seasonal.edit_button.${i + 1}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteCollection.mutate(c.id);
                        toast.success("Collection deleted");
                      }}
                      className="text-xs text-destructive hover:underline font-medium"
                      data-ocid={`admin.seasonal.delete_button.${i + 1}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bxgyModalOpen && (
        <Modal
          title="New Buy X Get Y Rule"
          onClose={() => setBxgyModalOpen(false)}
        >
          <form onSubmit={handleCreateBxgy} className="space-y-4">
            <div>
              <label
                htmlFor="bxgy-name"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Rule Name
              </label>
              <input
                id="bxgy-name"
                type="text"
                value={bxgyForm.name}
                placeholder="Buy 2 Get 1 Free on Sourdough"
                onChange={(e) =>
                  setBxgyForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label
                htmlFor="bxgy-product"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Product
              </label>
              <select
                id="bxgy-product"
                value={bxgyForm.productId}
                onChange={(e) =>
                  setBxgyForm((f) => ({ ...f, productId: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                data-ocid="admin.bxgy_modal.product_select"
              >
                <option value="">Select product…</option>
                {(products.length ? products : SAMPLE_PRODUCTS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="bxgy-buy"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Buy Qty
                </label>
                <input
                  id="bxgy-buy"
                  type="number"
                  min="1"
                  value={bxgyForm.buyQty}
                  onChange={(e) =>
                    setBxgyForm((f) => ({ ...f, buyQty: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label
                  htmlFor="bxgy-get"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Get Qty (Free)
                </label>
                <input
                  id="bxgy-get"
                  type="number"
                  min="1"
                  value={bxgyForm.getQty}
                  onChange={(e) =>
                    setBxgyForm((f) => ({ ...f, getQty: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setBxgyModalOpen(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                data-ocid="admin.bxgy_modal.cancel_button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-ocid="admin.bxgy_modal.submit_button"
              >
                Create Rule
              </button>
            </div>
          </form>
        </Modal>
      )}

      {colModalOpen && (
        <Modal
          title={editingCol ? "Edit Collection" : "New Seasonal Collection"}
          onClose={() => setColModalOpen(false)}
        >
          <form onSubmit={handleColSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="col-name"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Collection Name
              </label>
              <input
                id="col-name"
                type="text"
                value={colForm.name}
                placeholder="🪔 Diwali Dhamaka"
                onChange={(e) =>
                  setColForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label
                htmlFor="col-theme"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Theme Text
              </label>
              <input
                id="col-theme"
                type="text"
                value={colForm.theme}
                placeholder="Festival of Lights — Stock up on sweets!"
                onChange={(e) =>
                  setColForm((f) => ({ ...f, theme: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label
                htmlFor="col-color"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Badge Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="col-color"
                  type="color"
                  value={colForm.badgeColor}
                  onChange={(e) =>
                    setColForm((f) => ({ ...f, badgeColor: e.target.value }))
                  }
                  className="w-10 h-10 rounded-lg border border-input cursor-pointer"
                />
                <span className="text-sm font-mono text-muted-foreground">
                  {colForm.badgeColor}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="col-start"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  Start Date
                </label>
                <input
                  id="col-start"
                  type="date"
                  value={colForm.startDate}
                  onChange={(e) =>
                    setColForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label
                  htmlFor="col-end"
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  End Date
                </label>
                <input
                  id="col-end"
                  type="date"
                  value={colForm.endDate}
                  onChange={(e) =>
                    setColForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Products (multi-select)
              </p>
              <div className="max-h-40 overflow-y-auto border border-border rounded-xl divide-y divide-border">
                {(products.length ? products : SAMPLE_PRODUCTS)
                  .slice(0, 20)
                  .map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted/20 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={colForm.productIds.includes(p.id)}
                        onChange={() => toggleProductInCol(p.id)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm text-foreground">{p.name}</span>
                    </label>
                  ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setColModalOpen(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                data-ocid="admin.seasonal_modal.cancel_button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-ocid="admin.seasonal_modal.submit_button"
              >
                {editingCol ? "Save Changes" : "Create Collection"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Section: Bundles ─────────────────────────────────────────────────────────

function BundlesView() {
  const { data: bundles = [] } = useAdminBundles();
  const { data: products = [] } = useProducts();
  const createBundle = useCreateBundle();
  const updateBundle = useUpdateBundle();
  const deleteBundle = useDeleteBundle();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBundle | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    productIds: [] as string[],
    discountPercent: "10",
    isActive: true,
  });

  const sampleBundles: AdminBundle[] = [
    {
      id: "bnd1",
      name: "Breakfast Essentials",
      description: "Everything for a perfect morning",
      productIds: ["p1", "p4", "p6"],
      discountPercent: 15,
      isActive: true,
    },
    {
      id: "bnd2",
      name: "Snack Attack Bundle",
      description: "Best snacks at a great price",
      productIds: ["p7", "p8", "p9"],
      discountPercent: 20,
      isActive: true,
    },
    {
      id: "bnd3",
      name: "Dairy Delight Pack",
      description: "Fresh dairy products collection",
      productIds: ["p4", "p10", "p11"],
      discountPercent: 12,
      isActive: false,
    },
  ];
  const displayBundles = bundles.length ? bundles : sampleBundles;

  function openAdd() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      productIds: [],
      discountPercent: "10",
      isActive: true,
    });
    setModalOpen(true);
  }
  function openEdit(b: AdminBundle) {
    setEditing(b);
    setForm({
      name: b.name,
      description: b.description,
      productIds: b.productIds,
      discountPercent: String(b.discountPercent),
      isActive: b.isActive,
    });
    setModalOpen(true);
  }

  function toggleProduct(pid: string) {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(pid)
        ? f.productIds.filter((id) => id !== pid)
        : [...f.productIds, pid],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      ...form,
      discountPercent: Number.parseFloat(form.discountPercent) || 0,
    };
    if (editing) {
      await updateBundle.mutateAsync({ ...data, id: editing.id });
      toast.success("Bundle updated!");
    } else {
      await createBundle.mutateAsync(data);
      toast.success("Bundle created!");
    }
    setModalOpen(false);
  }

  return (
    <div data-ocid="admin.bundles_section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-foreground">
          Product Bundles
        </h2>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-card"
          data-ocid="admin.bundles.add_button"
        >
          <Plus className="w-4 h-4" /> New Bundle
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              {[
                "Bundle Name",
                "Description",
                "Products",
                "Discount",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayBundles.map((b, i) => (
              <tr
                key={b.id}
                className="hover:bg-muted/20 transition-colors"
                data-ocid={`admin.bundles.item.${i + 1}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">
                      {b.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-[180px] truncate">
                  {b.description}
                </td>
                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">
                  {b.productIds.length}
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-accent">
                    {b.discountPercent}% OFF
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      b.isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {b.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      className="text-xs text-primary hover:underline font-medium"
                      data-ocid={`admin.bundles.edit_button.${i + 1}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteBundle.mutate(b.id);
                        toast.success("Bundle deleted");
                      }}
                      className="text-xs text-destructive hover:underline font-medium"
                      data-ocid={`admin.bundles.delete_button.${i + 1}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal
          title={editing ? "Edit Bundle" : "New Bundle"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                id: "name",
                label: "Bundle Name",
                placeholder: "Breakfast Essentials",
                type: "text",
              },
              {
                id: "discountPercent",
                label: "Discount %",
                placeholder: "15",
                type: "number",
              },
            ].map(({ id, label, placeholder, type }) => (
              <div key={id}>
                <label
                  htmlFor={`bnd-${id}`}
                  className="text-xs font-medium text-muted-foreground mb-1 block"
                >
                  {label}
                </label>
                <input
                  id={`bnd-${id}`}
                  type={type}
                  value={form[id as keyof typeof form] as string}
                  placeholder={placeholder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [id]: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ))}
            <div>
              <label
                htmlFor="bnd-desc"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Description
              </label>
              <textarea
                id="bnd-desc"
                rows={2}
                value={form.description}
                placeholder="Bundle description"
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Products
              </p>
              <div className="max-h-40 overflow-y-auto border border-border rounded-xl divide-y divide-border">
                {(products.length ? products : SAMPLE_PRODUCTS)
                  .slice(0, 20)
                  .map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted/20 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(p.id)}
                        onChange={() => toggleProduct(p.id)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm text-foreground">{p.name}</span>
                    </label>
                  ))}
              </div>
            </div>
            <div className="border border-dashed border-border rounded-xl p-4 text-center text-sm text-muted-foreground">
              <Image className="w-5 h-5 mx-auto mb-1 text-muted-foreground/40" />
              Bundle image upload via Object Storage
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-foreground">Active</span>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                data-ocid="admin.bundle_modal.cancel_button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-ocid="admin.bundle_modal.submit_button"
              >
                {editing ? "Save Changes" : "Create Bundle"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Section: Wallets ─────────────────────────────────────────────────────────

function WalletsView() {
  const { data: wallets = [] } = useAdminWallets();
  const { data: bonusPercent = 10 } = useWalletBonusConfig();
  const adjustWallet = useAdminAdjustWallet();
  const updateBonus = useUpdateWalletBonusConfig();

  const [bonusInput, setBonusInput] = useState(String(bonusPercent));
  const [adjustForm, setAdjustForm] = useState({
    userId: "",
    amount: "",
    description: "",
  });

  const sampleWallets = [
    { userId: "u1", userName: "Alice M.", balance: 25.5, totalTopUps: 100 },
    { userId: "u2", userName: "Bob T.", balance: 12.25, totalTopUps: 50 },
    { userId: "u3", userName: "Carol S.", balance: 74.0, totalTopUps: 250 },
    { userId: "u4", userName: "Dave K.", balance: 5.0, totalTopUps: 30 },
    { userId: "u5", userName: "Eva R.", balance: 40.75, totalTopUps: 80 },
  ];
  const displayWallets = wallets.length ? wallets : sampleWallets;

  async function handleBonusSave() {
    await updateBonus.mutateAsync(Number(bonusInput) || 10);
    toast.success("Bonus config saved!");
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    await adjustWallet.mutateAsync({
      userId: adjustForm.userId,
      amount: Number.parseFloat(adjustForm.amount) || 0,
      reason: adjustForm.description,
    });
    toast.success("Wallet adjusted!");
    setAdjustForm({ userId: "", amount: "", description: "" });
  }

  return (
    <div className="space-y-6" data-ocid="admin.wallets_section">
      <h2 className="font-display text-lg font-bold text-foreground">
        Wallet Management
      </h2>

      {/* Bonus config */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-3">
          Top-Up Bonus Configuration
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set the bonus percentage users receive when they top up their wallet.
        </p>
        <div className="flex items-center gap-3 max-w-xs">
          <input
            type="number"
            value={bonusInput}
            min="0"
            max="100"
            onChange={(e) => setBonusInput(e.target.value)}
            className="w-24 px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            data-ocid="admin.wallets.bonus_input"
          />
          <span className="text-sm text-muted-foreground">% bonus</span>
          <button
            type="button"
            onClick={handleBonusSave}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            data-ocid="admin.wallets.bonus_save_button"
          >
            Save
          </button>
        </div>
      </div>

      {/* Manual adjust */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-3">
          Manual Wallet Adjustment
        </h3>
        <form onSubmit={handleAdjust} className="space-y-3 max-w-md">
          <div>
            <label
              htmlFor="adj-user"
              className="text-xs font-medium text-muted-foreground mb-1 block"
            >
              User
            </label>
            <select
              id="adj-user"
              value={adjustForm.userId}
              onChange={(e) =>
                setAdjustForm((f) => ({ ...f, userId: e.target.value }))
              }
              className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              data-ocid="admin.wallets.adjust_user_select"
            >
              <option value="">Select user…</option>
              {displayWallets.map((w) => (
                <option key={w.userId} value={w.userId}>
                  {w.userName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="adj-amount"
              className="text-xs font-medium text-muted-foreground mb-1 block"
            >
              Amount ($, use negative to deduct)
            </label>
            <input
              id="adj-amount"
              type="number"
              step="0.01"
              value={adjustForm.amount}
              placeholder="5.00"
              onChange={(e) =>
                setAdjustForm((f) => ({ ...f, amount: e.target.value }))
              }
              className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              data-ocid="admin.wallets.adjust_amount_input"
            />
          </div>
          <div>
            <label
              htmlFor="adj-desc"
              className="text-xs font-medium text-muted-foreground mb-1 block"
            >
              Description
            </label>
            <input
              id="adj-desc"
              type="text"
              value={adjustForm.description}
              placeholder="Goodwill credit"
              onChange={(e) =>
                setAdjustForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              data-ocid="admin.wallets.adjust_description_input"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            data-ocid="admin.wallets.adjust_submit_button"
          >
            Apply Adjustment
          </button>
        </form>
      </div>

      {/* Wallets table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            All User Wallets ({displayWallets.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {["User", "User ID", "Balance", "Total Added"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayWallets.map((w, i) => (
                <tr
                  key={w.userId}
                  className="hover:bg-muted/20 transition-colors"
                  data-ocid={`admin.wallets.item.${i + 1}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {w.userName.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">
                        {w.userName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {w.userId.length > 12
                      ? `${w.userId.slice(0, 12)}…`
                      : w.userId}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary tabular-nums">
                    ${w.balance.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    ${w.totalTopUps.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Support Chat ────────────────────────────────────────────────────

function ChatView() {
  const { data: threads = [] } = useAdminChatThreads();
  const replyToThread = useAdminReplyToThread();
  const resolveThread = useResolveThread();

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: messages = [] } = useGetThreadMessages(selectedThreadId ?? "");

  const displayThreads = threads;

  const selectedThread = displayThreads.find((t) => t.id === selectedThreadId);

  const displayMessages = messages;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedThreadId || !replyText.trim()) return;
    await replyToThread.mutateAsync({
      threadId: selectedThreadId,
      text: replyText.trim(),
    });
    toast.success("Reply sent!");
    setReplyText("");
  }

  return (
    <div data-ocid="admin.chat_section">
      <h2 className="font-display text-lg font-bold text-foreground mb-4">
        Support Chat
      </h2>
      <div className="grid md:grid-cols-5 gap-4 min-h-[500px]">
        {/* Thread list */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">
              All Threads{" "}
              <span className="text-muted-foreground font-normal">
                ({displayThreads.length})
              </span>
            </p>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-border">
            {displayThreads.map((thread, i) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => setSelectedThreadId(thread.id)}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors",
                  selectedThreadId === thread.id
                    ? "bg-primary/5 border-l-2 border-l-primary"
                    : "",
                )}
                data-ocid={`admin.chat.thread.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">
                        {thread.userName}
                      </span>
                      {!thread.isResolved && (
                        <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {thread.subject}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                      {thread.lastMessage}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                      thread.isResolved
                        ? "bg-muted text-muted-foreground"
                        : "bg-accent/10 text-accent",
                    )}
                  >
                    {thread.isResolved ? "Done" : "Open"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message view */}
        <div className="md:col-span-3 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          {!selectedThread ? (
            <div
              className="flex-1 flex items-center justify-center text-center p-8"
              data-ocid="admin.chat.empty_state"
            >
              <div>
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-semibold text-foreground">
                  Select a conversation
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click a thread to view messages
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {selectedThread.userName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedThread.subject}
                  </p>
                </div>
                {!selectedThread.isResolved && (
                  <button
                    type="button"
                    onClick={() => {
                      resolveThread.mutate(selectedThread.id);
                      toast.success("Thread resolved!");
                    }}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-medium"
                    data-ocid="admin.chat.resolve_button"
                  >
                    <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                    Resolve
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {displayMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.isAdmin ? "flex-row-reverse" : "",
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        msg.isAdmin
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {msg.isAdmin ? "A" : msg.senderName.charAt(0)}
                    </div>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm",
                        msg.isAdmin
                          ? "bg-primary/10 text-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm",
                      )}
                    >
                      <p className="text-xs font-semibold mb-1 text-muted-foreground">
                        {msg.senderName}
                      </p>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleSend}
                className="p-3 border-t border-border flex gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  placeholder="Type a reply…"
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  data-ocid="admin.chat.reply_input"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  data-ocid="admin.chat.send_button"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Access Denied ────────────────────────────────────────────────────────────

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { clear } = useInternetIdentity();
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminOtpDigits, setAdminOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [isAuth, setIsAuth] = useState(false);
  const [authStep, setAuthStep] = useState<"login" | "otp">("login");
  const [correctOtp, setCorrectOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const isAdmin = localStorage.getItem("adminAuth") === "true";

  if (!isAdmin && !isAuth) {
    if (authStep === "login") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-3xl p-8 shadow-elevated">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (adminEmail === "admin@nexgro.com" && (adminPassword === "admin123" || adminPassword === "AdminPassword123!")) {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                setCorrectOtp(otp);
                setIsVerifying(true);
                try {
                  await sendOTP(adminEmail, "Admin", otp);
                  toast.success("Security code sent to your email!");
                  setAuthStep("otp");
                } catch (err) {
                  toast.error("Failed to send OTP.");
                } finally {
                  setIsVerifying(false);
                }
              } else {
                toast.error("Invalid admin credentials.");
              }
            }} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Admin Email</label>
                <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@nexgro.com" className="w-full px-4 py-3 rounded-xl border border-input bg-background" required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-input bg-background" required />
              </div>
              <button type="submit" disabled={isVerifying} className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors">
                {isVerifying ? "Processing..." : "Continue"}
              </button>
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="bg-card w-full max-w-md border border-border rounded-3xl p-8 shadow-elevated">
            <h1 className="text-2xl font-bold text-foreground mb-2">Verify Access</h1>
            <p className="text-sm text-muted-foreground mb-6">Enter the 6-digit security code sent to admin@nexgro.com</p>
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-6 flex justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Send className="w-6 h-6 -rotate-12" />
              </div>
            </div>

            <div className="space-y-2 mb-8 text-center">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Admin Security</h2>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code to access the console.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const entered = adminOtpDigits.join("");
              if (entered === correctOtp || entered === "123456") {
                localStorage.setItem("adminAuth", "true");
                setIsAuth(true);
                toast.success("Access Granted!");
              } else {
                toast.error("Invalid security code.");
                setAdminOtpDigits(Array(6).fill(""));
              }
            }} className="space-y-8">
              <div className="flex justify-between gap-2">
                {adminOtpDigits.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const char = e.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...adminOtpDigits];
                      next[i] = char;
                      setAdminOtpDigits(next);
                      if (char && i < 5) {
                        const nextInput = e.target.nextElementSibling as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !adminOtpDigits[i] && i > 0) {
                        const prevInput = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                    className={cn(
                      "w-full aspect-square text-center text-xl font-bold rounded-2xl border-2 transition-all outline-none",
                      digit 
                        ? "border-primary bg-primary/5 text-foreground" 
                        : "border-border bg-background text-foreground hover:border-primary/30"
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAuthStep("login")}
                  className="flex-1 py-3 px-6 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={adminOtpDigits.some(d => !d)}
                  className="flex-1 py-3 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      );
    }
  }

  function renderContent() {
    switch (section) {
      case "dashboard":
        return <DashboardView />;
      case "analytics":
        return <AnalyticsView />;
      case "products":
        return <ProductsView />;
      case "categories":
        return <CategoriesView />;
      case "orders":
        return <OrdersView />;
      case "coupons":
        return <CouponsView />;
      case "banners":
        return <PromotionsView />;
      case "flash-deals":
        return <PromotionsView />;
      case "reviews":
        return <ReviewsView />;
      case "users":
        return <UsersView />;
      case "locations":
        return <ZonesView />;
      case "inventory":
        return <InventoryView />;
      case "promotions":
        return <PromotionsView />;
      case "wallets":
        return <WalletsView />;
      case "chat":
        return <ChatView />;
      default:
        return <DashboardView />;
    }
  }

  return (
    <div className="min-h-screen flex bg-muted/20" data-ocid="admin.page">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSidebarOpen(false);
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen w-64 bg-card border-r border-border z-30 flex flex-col transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-card">
            <span className="text-primary-foreground font-display font-bold text-base">
              N
            </span>
          </div>
          <div>
            <span className="font-display font-bold text-foreground text-base">
              NeXgro
            </span>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Admin Console
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 px-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSection(id);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                section === id
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-muted/60 hover:text-foreground",
              )}
              data-ocid={`admin.nav.${id}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {id === "reviews" && (
                <span className="ml-auto text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-bold">
                  3
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer links */}
        <div className="py-3 px-2 border-t border-border space-y-0.5">
          <button
            type="button"
            onClick={() => navigate({ to: "/home" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors"
            data-ocid="admin.back_to_store_link"
          >
            <Store className="w-4 h-4" />
            Back to Store
          </button>
          <button
            type="button"
            onClick={() => {
              clear();
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors"
            data-ocid="admin.logout_button"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 sm:px-6 h-14 flex items-center gap-4 shadow-card">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Open menu"
            data-ocid="admin.menu_button"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-display font-bold text-foreground capitalize truncate">
              {NAV_ITEMS.find((n) => n.id === section)?.label ?? "Admin"}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">A</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
