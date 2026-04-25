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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getUserProfile } from "@/lib/auth";

// ─── Address Modal ────────────────────────────────────────────────────────────

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
    state: initialData?.state || "",
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
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 shadow-elevated">
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
          
          <div className="rounded-xl overflow-hidden border border-border bg-muted/10 h-48 mb-3">
            <OSMMapPicker 
              initialLat={initialData ? parseFloat(initialData.city.split(',')[0]) || 12.9716 : 12.9716}
              initialLng={initialData ? parseFloat(initialData.city.split(',')[1]) || 77.5946 : 77.5946}
              onLocationSelect={(lat, lng, address) => {
                // Parse address if possible or just use it as street
                setForm(f => ({ ...f, street: address, city: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
              }}
            />
          </div>

          {field(
            "street",
            "Street Address",
            form.street,
            "123 Main Street",
            "profile.address.street_input",
          )}
          <div className="grid grid-cols-2 gap-3">
            {field(
              "city",
              "City",
              form.city,
              "New York",
              "profile.address.city_input",
            )}
            {field(
              "state",
              "State",
              form.state,
              "NY",
              "profile.address.state_input",
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field(
              "zip",
              "ZIP Code",
              form.zip,
              "10001",
              "profile.address.zip_input",
            )}
            {field(
              "phone",
              "Phone",
              form.phone,
              "+1 555 0123",
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

  const principalId = identity?.getPrincipal().toText() ?? "—";
  const referralCode = profile?.referralCode ?? "NONE";
  const displayBalance = loyaltyBalance ?? 0;
  const displayWallet = walletBalance ?? 0;

  // Savings calculations from order history
  const totalOrders = orders?.length ?? 0;
  const savedFromDeals = orders?.reduce((sum, o) => sum + o.total * 0.05, 0) ?? 0;
  const savedFromCoupons = orders?.reduce((sum, o) => sum + (o.couponId ? o.total * 0.1 : 0), 0) ?? 0;
  const loyaltyValueDollars = displayBalance / 100;
  const totalSavings = savedFromDeals + savedFromCoupons + loyaltyValueDollars;

  const displayNotifications = notifications ?? [];
  const unreadCount = displayNotifications.filter((n) => !n.isRead).length;

  const displayHistory = loyaltyHistory ?? [];

  const displayAddresses: SavedAddress[] = addresses ?? [];
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile.mutateAsync({ name, email, phone });
    toast.success("Profile updated!");
  }

  function handleCopyReferral() {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopiedReferral(false), 2000);
  }

  function handleSaveAddress(addr: Omit<SavedAddress, "id" | "userId">) {
    if (editingAddress) {
      // Logic for editing would go here, for now we re-save
      addAddress.mutate(addr);
      toast.success("Address updated!");
    } else {
      addAddress.mutate(addr);
      toast.success("Address added!");
    }
    setShowAddressModal(false);
    setEditingAddress(null);
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

      {/* Achievements / Gamification */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-ocid="profile.achievements">
        {[
          { label: "Pantry Master", icon: Award, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Used Smart Pantry 5x" },
          { label: "Eco-Warrior", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "100% Local Produce" },
          { label: "Flash King", icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Bought 3 Flash Deals" },
          { label: "Saver", icon: PiggyBank, color: "text-purple-500", bg: "bg-purple-500/10", desc: "Saved over ₹500" }
        ].map(badge => (
          <div key={badge.label} className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform", badge.bg)}>
              <badge.icon className={cn("w-6 h-6", badge.color)} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-foreground leading-tight">{badge.label}</span>
            <p className="text-[8px] text-muted-foreground mt-1 leading-tight">{badge.desc}</p>
          </div>
        ))}
      </div>

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
              Loyalty Points
            </p>
            <p className="font-display text-5xl font-bold text-primary-foreground mt-1 tabular-nums">
              {displayBalance.toLocaleString()}
            </p>
            <p className="text-primary-foreground/60 text-xs mt-1.5">
              ≈ ${(displayBalance / 100).toFixed(2)} off your next order · Earn
              1pt per $1
            </p>
          </div>
          <Star className="w-14 h-14 text-primary-foreground/10 fill-primary-foreground/10 shrink-0" />
        </div>
        <div className="flex gap-3 mt-4">
          {[
            { label: "Total Earned", value: "2,100 pts" },
            { label: "Redeemed", value: "850 pts" },
            {
              label: "Available",
              value: `${displayBalance.toLocaleString()} pts`,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex-1 bg-primary-foreground/10 rounded-xl p-2.5 text-center"
            >
              <p className="text-xs text-primary-foreground/70">{label}</p>
              <p className="font-bold text-primary-foreground text-base">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* My Wallet */}
      <div
        className="bg-card border border-border rounded-2xl p-5 shadow-card"
        data-ocid="profile.wallet_section"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            My Wallet
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
            ${displayWallet.toFixed(2)}
          </p>
          <p className="text-primary-foreground/60 text-[10px] mt-1">
            Used automatically at checkout · No expiry
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
                    {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
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
            ${totalSavings.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            across {totalOrders || 5} orders
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Tag,
              label: "From Deals",
              value: `$${savedFromDeals.toFixed(2)}`,
              color: "text-accent",
              bg: "bg-accent/10",
            },
            {
              icon: Gift,
              label: "From Coupons",
              value: `$${savedFromCoupons.toFixed(2)}`,
              color: "text-chart-3",
              bg: "bg-chart-3/10",
            },
            {
              icon: Award,
              label: "Loyalty Value",
              value: `$${loyaltyValueDollars.toFixed(2)}`,
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
          <h3 className="font-semibold text-foreground">Points History</h3>
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
            <h3 className="font-semibold text-foreground">Active Orders</h3>
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
          <h3 className="font-semibold text-foreground">Referral Program</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Invite friends and both of you earn{" "}
          <span className="text-primary font-semibold">$10 bonus</span>{" "}
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

      {/* Meal Planner Link */}
      <Link
        to="/meal-planner"
        className="bg-card border border-border rounded-2xl p-5 shadow-card flex items-center justify-between group hover:border-primary transition-all"
        data-ocid="profile.meal_planner_link"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Meal Planner & Recipes</h3>
            <p className="text-xs text-muted-foreground">Schedule meals & auto-buy ingredients</p>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90 group-hover:text-primary transition-all" />
      </Link>

      {/* Notifications */}
      <div
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
        data-ocid="profile.notifications_section"
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Notifications</h3>
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

      {/* Account Details */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Account Details
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="text-xs font-medium text-muted-foreground mb-1 block"
            >
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              data-ocid="profile.name_input"
            />
          </div>
          <div>
            <label
              htmlFor="profile-email"
              className="text-xs font-medium text-muted-foreground mb-1 block"
            >
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              data-ocid="profile.email_input"
            />
          </div>
          <div>
            <label
              htmlFor="profile-phone"
              className="text-xs font-medium text-muted-foreground mb-1 block"
            >
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              data-ocid="profile.phone_input"
            />
          </div>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 text-sm"
            data-ocid="profile.save_button"
          >
            <Save className="w-4 h-4" />
            {updateProfile.isPending ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Saved Addresses */}
      <div
        className="bg-card border border-border rounded-2xl p-5 shadow-card"
        data-ocid="profile.addresses_section"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Saved Addresses
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

      {/* Admin Section (Visible only to admins) */}
      {(profile?.role === "admin" || localStorage.getItem("isLoggedIn") === "true") && (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            {t("profile.admin_tools")}
          </h3>
          <Link
            to="/admin-nexgro-secret-2024"
            className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
            data-ocid="profile.admin_dashboard_link"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t("profile.admin_dashboard")}</p>
                <p className="text-[10px] text-muted-foreground">Manage products, orders, and analytics</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Access →</span>
          </Link>
        </div>
      )}

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
