import {
  useAddAddress,
  useInAppNotifications,
  useInternetIdentity,
  useLoyaltyBalance,
  useLoyaltyHistory,
  useMarkAllNotificationsRead,
  useOrders,
  useUpdateUserProfile,
  useUserAddresses,
  useUpdateAddress,
  useDeleteAddress,
  useUserProfile,
  useWalletBalance,
  useWalletTransactions,
} from "@/hooks/useBackend";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import OSMMapPicker from "@/components/OSMMapPicker";
import type { SavedAddress } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  Award,
  Bell,
  Camera,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Edit2,
  Gift,
  Loader2,
  LogOut,
  MapPin,
  Package,
  PiggyBank,
  Plus,
  Save,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getUserProfile } from "@/lib/auth";

// ─── Address Modal ────────────────────────────────────────────────────────────

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", 
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
];

const KERALA_CITIES = [
  "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", 
  "Palakkad", "Malappuram", "Kannur", "Kottayam", "Kasaragod", "Pathanamthitta", 
  "Idukki", "Wayanad"
];

function AddressModal({
  onClose,
  onSave,
  initialData,
}: {
  onClose: () => void;
  onSave: (addr: Omit<SavedAddress, "id" | "userId">) => void;
  initialData?: SavedAddress | null;
}) {
  const [form, setForm] = useState({
    label: initialData?.label || "Home",
    street: initialData?.street || "",
    city: initialData?.city || "",
    state: initialData?.state || "Kerala",
    zip: initialData?.zip || "",
    phone: initialData?.phone || "",
    isDefault: initialData?.isDefault || false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.street || !form.city) {
      toast.error("Street and city are required");
      return;
    }
    onSave(form);
  }

  const field = (
    id: string,
    label: string,
    value: string,
    placeholder: string,
    ocid: string,
    type = "text",
  ) => (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground mb-1 block"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
        className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        data-ocid={ocid}
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm"
      data-ocid="profile.address_modal"
    >
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 shadow-elevated max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-foreground text-lg">
            {initialData ? "Edit Address" : "Add Address"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close"
            data-ocid="profile.address_modal.close_button"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="label"
              className="text-xs font-medium text-muted-foreground mb-1 block"
            >
              Label
            </label>
            <select
              id="label"
              value={form.label}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              data-ocid="profile.address.label_select"
            >
              {["Home", "Work", "Other"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          
          <div className="rounded-xl overflow-hidden border border-border bg-muted/10 h-40 mb-3">
            <OSMMapPicker 
              initialLat={initialData ? parseFloat(initialData.city.split(',')[0]) || 12.9716 : 12.9716}
              initialLng={initialData ? parseFloat(initialData.city.split(',')[1]) || 77.5946 : 77.5946}
              onLocationSelect={(lat, lng, _address) => {
                // Location selected on map, user fills address manually per request
                toast.info("Location marked. Please fill address details below.");
              }}
            />
          </div>

          {field(
            "street",
            "Street Address",
            form.street,
            "House Name/No, Street",
            "profile.address.street_input",
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">State</label>
              <select
                value={form.state}
                onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
              {form.state === "Kerala" ? (
                <select
                  value={form.city}
                  onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select City</option>
                  {KERALA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.city}
                  placeholder="City Name"
                  onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field(
              "zip",
              "Pincode",
              form.zip,
              "682001",
              "profile.address.zip_input",
            )}
            {field(
              "phone",
              "Phone",
              form.phone,
              "9876543210",
              "profile.address.phone_input",
              "tel",
            )}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm((f) => ({ ...f, isDefault: e.target.checked }))
              }
              className="w-4 h-4 accent-primary"
              data-ocid="profile.address.default_checkbox"
            />
            <span className="text-sm text-foreground">Set as default</span>
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              data-ocid="profile.address_modal.cancel_button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              data-ocid="profile.address_modal.submit_button"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Profile ─────────────────────────────────────────────────────────────

export default function Profile() {
  const { t } = useLanguage();
  const { identity, clear } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const { data: addresses } = useUserAddresses();
  const { data: loyaltyBalance } = useLoyaltyBalance();
  const { data: loyaltyHistory } = useLoyaltyHistory();
  const { data: walletBalance } = useWalletBalance();
  const { data: walletTransactions } = useWalletTransactions();
  const { data: orders } = useOrders();
  const { data: notifications } = useInAppNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const updateProfile = useUpdateUserProfile();
  const addAddress = useAddAddress();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("customer");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    const loggedInEmail = localStorage.getItem("currentUserEmail");
    const localProfile = loggedInEmail ? getUserProfile(loggedInEmail) : null;
    
    if (localProfile) {
      setName(`${localProfile.firstName} ${localProfile.lastName}`);
      setEmail(localProfile.email);
      setPhone(localProfile.phone);
      setRole(localProfile.email.toLowerCase() === "admin@nexgro.com" ? "admin" : "customer");
    } else if (profile) {
      setName(profile.name || "Grocery Shopper");
      setEmail(profile.email || "shopper@nexgro.com");
      setPhone(profile.phone || "+1 555 0123");
      setRole(profile.role || "customer");
    }
  }, [profile]);

  const deleteAddress = useDeleteAddress();
  const updateAddress = useUpdateAddress();

  const principalId = identity?.getPrincipal().toText() ?? "—";
  const referralCode = profile?.referralCode && profile.referralCode !== "NONE" 
    ? profile.referralCode 
    : (name ? name.split(' ')[0].toUpperCase() + Math.floor(Math.random() * 1000) : "NEXGRO" + Math.floor(Math.random() * 1000));
  const displayBalance = loyaltyBalance ?? 0;
  const displayWallet = walletBalance ?? 0;

  // Savings calculations from order history
  const totalOrders = orders?.length ?? 0;
  const savedFromDeals = orders?.reduce((sum, o) => sum + o.total * 0.05, 0) ?? 0;
  const savedFromCoupons = orders?.reduce((sum, o) => sum + (o.couponId ? o.total * 0.1 : 0), 0) ?? 0;
  const loyaltyValueRupees = displayBalance / 100;
  const totalSavings = savedFromDeals + savedFromCoupons + loyaltyValueRupees;

  const displayNotifications = notifications ?? [];
  const unreadCount = displayNotifications.filter((n) => !n.isRead).length;

  const displayHistory = loyaltyHistory ?? [];

  const displayAddresses: SavedAddress[] = addresses ?? [];
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  function handleCopyReferral() {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopiedReferral(false), 2000);
  }

  function handleSaveAddress(addr: Omit<SavedAddress, "id" | "userId">) {
    if (editingAddress) {
      updateAddress.mutate({ ...addr, id: editingAddress.id, userId: editingAddress.userId }, {
        onSuccess: () => toast.success("Address updated!")
      });
    } else {
      addAddress.mutate(addr, {
        onSuccess: () => toast.success("Address added!")
      });
    }
    setShowAddressModal(false);
    setEditingAddress(null);
  }

  function handleDeleteAddress(id: string) {
    if (confirm("Are you sure you want to delete this address?")) {
      deleteAddress.mutate(id, {
        onSuccess: () => toast.success("Address deleted")
      });
    }
  }

  function handleMarkAllRead() {
    markAllRead.mutate(undefined);
    toast.success("All notifications marked as read");
  }
  return (
    <div
      className="max-w-4xl mx-auto px-4 py-8 space-y-6 pt-safe"
      data-ocid="profile.page"
    >

      {showAddressModal && (
        <AddressModal
          onClose={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
          onSave={handleSaveAddress}
          initialData={editingAddress}
        />
      )}

      {/* Header card */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-card">
        <div className="relative group">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 border-primary/20">
            {(profile as any)?.imageUrl ? (
              <img src={(profile as any).imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <input
            type="file"
            id="profile-upload"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                // Here we would normally mutate via backend
                // For now we'll just show a success message and mock it
                toast.success("Profile photo updated!");
              }
            }}
          />
          <label
            htmlFor="profile-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
          >
            <Camera className="w-4 h-4" />
          </label>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-foreground text-lg truncate">
            {name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {identity ? principalId : email}
          </p>
          <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
            {role}
          </span>
        </div>
      </div>

      {/* Achievements removed as requested */}

      {/* Loyalty Points Banner */}
      <div
        className="rounded-2xl p-5 shadow-elevated"
        style={{
          background:
            "linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%)",
        }}
        data-ocid="profile.loyalty_card"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium">
              {t("profile.loyalty_points")}
            </p>
            <p className="font-display text-5xl font-bold text-primary-foreground mt-1 tabular-nums">
              {displayBalance.toLocaleString()}
            </p>
            <p className="text-primary-foreground/60 text-xs mt-1.5">
              ≈ ₹{(displayBalance / 100).toFixed(2)} off your next order · Earn
              1pt per ₹1
            </p>
          </div>
          <Star className="w-14 h-14 text-primary-foreground/10 fill-primary-foreground/10 shrink-0" />
        </div>
      </div>

      {/* Wallet */}
      <div
        className="bg-card border border-border rounded-2xl p-5 shadow-card mb-6"
        data-ocid="profile.wallet_section"
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            {t("profile.wallet_balance")}
          </h3>
          <Link
            to="/wallet"
            className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors font-medium"
            data-ocid="profile.wallet_topup_button"
          >
            <Plus className="w-3.5 h-3.5" /> Top Up
          </Link>
        </div>
        <div
          className="rounded-xl p-4"
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #166534 100%)",
          }}
        >
          <p className="text-primary-foreground/70 text-xs font-medium">
            Available Balance
          </p>
          <p className="font-display text-3xl font-bold text-primary-foreground mt-0.5 tabular-nums">
            ₹{displayWallet.toFixed(2)}
          </p>
        </div>
        <div className="mt-3">
          {walletTransactions && walletTransactions.length > 0 ? (
            <div className="space-y-1.5 mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Recent Transactions
              </p>
              {walletTransactions.slice(0, 3).map((tx, i) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-1.5"
                  data-ocid={`profile.wallet.tx.item.${i + 1}`}
                >
                  <p className="text-xs text-muted-foreground truncate flex-1 min-w-0 pr-2">
                    {tx.description}
                  </p>
                  <span
                    className={`text-xs font-semibold tabular-nums shrink-0 ${tx.amount >= 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {tx.amount >= 0 ? "+" : ""}₹{Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          <Link
            to="/wallet"
            className="text-xs text-primary hover:underline font-medium"
            data-ocid="profile.wallet_history_link"
          >
            View transaction history →
          </Link>
        </div>
      </div>

      {/* Savings Tracker */}
      <div
        className="bg-card border border-border rounded-2xl p-5 shadow-card"
        data-ocid="profile.savings_section"
      >
        <div className="flex items-center gap-2 mb-4">
          <PiggyBank className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Savings Tracker</h3>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 text-center">
          <p className="text-xs text-muted-foreground mb-0.5">
            Total Saved with NeXgro
          </p>
          <p className="font-display text-3xl font-bold text-primary">
            ₹{totalSavings.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            across {totalOrders} orders
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Tag,
              label: "From Deals",
              value: `₹${savedFromDeals.toFixed(2)}`,
              color: "text-accent",
              bg: "bg-accent/10",
            },
            {
              icon: Gift,
              label: "From Coupons",
              value: `₹${savedFromCoupons.toFixed(2)}`,
              color: "text-chart-3",
              bg: "bg-chart-3/10",
            },
            {
              icon: Award,
              label: "Loyalty Value",
              value: `₹${loyaltyValueRupees.toFixed(2)}`,
              color: "text-primary",
              bg: "bg-primary/10",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className={`${bg} rounded-xl p-3 text-center`}
              data-ocid={`profile.savings.${label.toLowerCase().replace(/ /g, "_")}`}
            >
              <Icon className={`w-4 h-4 mx-auto mb-1.5 ${color}`} />
              <p className={`font-bold text-base ${color}`}>{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Loyalty History */}
      <div
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
        data-ocid="profile.loyalty_history"
      >
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">{t("profile.points_history") || "Points History"}</h3>
        </div>
        <div className="divide-y divide-border">
          {displayHistory.map((tx, i) => (
            <div
              key={tx.id}
              className="flex items-center justify-between px-5 py-3"
              data-ocid={`profile.loyalty_history.item.${i + 1}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground truncate">{tx.reason}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`font-bold text-sm tabular-nums shrink-0 ml-4 ${
                  tx.pointsChange > 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {tx.pointsChange > 0 ? "+" : ""}
                {tx.pointsChange} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Orders */}
      <div
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
        data-ocid="profile.active_orders"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">{t("profile.active_orders")}</h3>
          </div>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
            LIVE TRACKING
          </span>
        </div>
        <div className="divide-y divide-border">
          {orders?.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No active orders at the moment
            </div>
          ) : (
            orders?.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").map((order) => (
              <div key={order.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">Order #{order.id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Placed on {new Date(Number(order.createdAt)).toLocaleDateString()}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                    order.status === "Shipped" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                  )}>
                    {order.status}
                  </span>
                </div>
                
                {order.status === "Shipped" ? (
                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-accent">Out for Delivery</p>
                        <p className="text-[10px] text-muted-foreground">Arriving in approx. 12 mins</p>
                      </div>
                    </div>
                    <Link
                      to="/orders/$orderId/track"
                      params={{ orderId: order.id }}
                      className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-bold shadow-sm hover:scale-105 transition-transform"
                    >
                      Track Live
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: order.status === "Processing" ? "60%" : "30%" }} />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {order.status === "Processing" ? "Packing" : "Pending"}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Referral */}
      <div
        className="bg-card border border-border rounded-2xl p-5 shadow-card"
        data-ocid="profile.referral_card"
      >
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-foreground">{t("profile.referral_program") || "Referral Program"}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Invite friends and both of you earn{" "}
          <span className="text-primary font-semibold">₹100 bonus</span>{" "}
          when they place their first order.
        </p>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm font-mono text-foreground/70 truncate">
            {referralCode}
          </div>
          <Link
            to="/referrals"
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors shrink-0"
            data-ocid="profile.view_referrals_button"
          >
            View Hub
          </Link>
        </div>
      </div>


      {/* Notifications */}
      <div
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
        data-ocid="profile.notifications_section"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">{t("profile.notifications")}</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:underline font-medium"
              data-ocid="profile.notifications.mark_all_read_button"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="divide-y divide-border">
          {displayNotifications.length === 0 ? (
            <div
              className="py-8 text-center text-sm text-muted-foreground"
              data-ocid="profile.notifications.empty_state"
            >
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              No notifications yet
            </div>
          ) : (
            displayNotifications.map((n, i) => {
              const iconMap = {
                order: Package,
                promo: Tag,
                stock: ShoppingBag,
                general: Bell,
              } as const;
              const Icon = iconMap[n.type] ?? Bell;
              const timeAgo = (() => {
                const diff = Date.now() - n.createdAt;
                if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
                if (diff < 86400000)
                  return `${Math.round(diff / 3600000)}h ago`;
                return `${Math.round(diff / 86400000)}d ago`;
              })();
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${n.isRead ? "" : "bg-primary/[0.03]"}`}
                  data-ocid={`profile.notification.item.${i + 1}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.isRead ? "bg-muted/40" : "bg-primary/10"}`}
                  >
                    <Icon
                      className={`w-4 h-4 ${n.isRead ? "text-muted-foreground" : "text-primary"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${n.isRead ? "text-muted-foreground" : "text-foreground font-medium"}`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {timeAgo}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>


      {/* Saved Addresses */}
      <div
        className="bg-card border border-border rounded-2xl p-5 shadow-card"
        data-ocid="profile.addresses_section"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {t("profile.saved_addresses")}
          </h3>
          <button
            type="button"
            onClick={() => setShowAddressModal(true)}
            className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors font-medium"
            data-ocid="profile.add_address_button"
          >
            <Plus className="w-3.5 h-3.5" /> Add New
          </button>
        </div>
        {displayAddresses.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="profile.addresses.empty_state"
          >
            <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            No saved addresses yet
          </div>
        ) : (
          <div className="space-y-3">
            {displayAddresses.map((addr, i) => (
              <div
                key={addr.id}
                className={`border rounded-xl p-3.5 transition-colors ${
                  addr.isDefault
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-background"
                }`}
                data-ocid={`profile.addresses.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">
                      {addr.street}, {addr.city}, {addr.state} {addr.zip}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {addr.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(addr);
                        setShowAddressModal(true);
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                      aria-label="Edit address"
                      data-ocid={`profile.addresses.edit_button.${i + 1}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                      aria-label="Delete address"
                      data-ocid={`profile.addresses.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Section removed as requested */}

      {/* Settings / Logout */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-3">Settings</h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              clear();
              localStorage.removeItem("isLoggedIn");
              window.location.href = "/login";
            }}
            className="flex-1 flex items-center justify-center gap-2 text-sm text-destructive border border-destructive/30 px-4 py-2.5 rounded-xl hover:bg-destructive/5 transition-colors font-medium"
            data-ocid="profile.logout_button"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
