import ChatWidget from "@/components/ChatWidget";
import { ComparisonBar } from "@/components/ComparisonBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useCart,
  useInAppNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotificationCount,
  useUserProfile,
} from "@/hooks/useBackend";
import type { InAppNotification } from "@/hooks/useBackend";
import { cn } from "@/lib/utils";
import { getUserProfile } from "@/lib/auth";
import type { Language } from "@/types";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  Globe,
  Grid3X3,
  Heart,
  Home,
  LogOut,
  Moon,
  Package,
  Search,
  ShoppingCart,
  Star,
  Sun,
  User,
  ShieldCheck,
  Mic,
  MicOff,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

function NavLink({
  to,
  children,
  className,
}: { to: string; children: React.ReactNode; className?: string }) {
  const loc = useLocation();
  const isActive =
    loc.pathname === to || (to !== "/home" && loc.pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={cn(
        "transition-colors duration-200 font-medium text-sm",
        isActive
          ? "text-primary font-semibold"
          : "text-foreground/70 hover:text-foreground",
        className,
      )}
      data-ocid="nav.link"
    >
      {children}
    </Link>
  );
}

function CartBadge() {
  const { data: cartItems } = useCart();
  const count = cartItems?.length ?? 0;
  if (count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}


// ─── Language switcher ────────────────────────────────────────────────────────

const LANG_LABELS: Record<Language, string> = {
  en: "EN",
  hi: "हि",
  ta: "தமிழ்",
};

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: Language[] = ["en", "hi", "ta"];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors duration-200 text-sm font-medium text-foreground/70"
        aria-label="Change language"
        data-ocid="nav.language_switcher"
      >
        <Globe className="w-4 h-4" />
        <span>{LANG_LABELS[language]}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-28 bg-card border border-border rounded-xl shadow-elevated z-50 py-1 overflow-hidden"
          data-ocid="nav.language_dropdown"
        >
          {languages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                language === lang
                  ? "text-primary font-semibold bg-primary/5"
                  : "text-foreground/80",
              )}
              data-ocid={`nav.language_option.${lang}`}
            >
              <span className="text-base">
                {lang === "en" ? "🇺🇸" : lang === "hi" ? "🇮🇳" : "🇮🇳"}
              </span>
              <span>
                {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "தமிழ்"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notification bell ────────────────────────────────────────────────────────

function getNotifIcon(type: InAppNotification["type"]) {
  if (type === "order") return "📦";
  if (type === "promo") return "🎁";
  return "🔔";
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: count = 0 } = useUnreadNotificationCount();
  const { data: notifications = [] } = useInAppNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
    if (!open && count > 0) {
      markAll.mutate();
    }
  }

  const recent = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
        data-ocid="nav.notifications_button"
      >
        <Bell className="w-5 h-5 text-foreground/70" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-[-60px] sm:right-0 top-full mt-3 w-[280px] sm:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          data-ocid="nav.notifications_dropdown"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-display font-semibold text-sm text-foreground">
              Notifications
            </span>
            {notifications.some((n) => !n.isRead) && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="text-xs text-primary hover:underline"
                data-ocid="nav.notifications_mark_all_button"
              >
                Mark all read
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <div
              className="px-4 py-8 text-center text-sm text-muted-foreground"
              data-ocid="nav.notifications_empty_state"
            >
              No notifications yet
            </div>
          ) : (
            <ul>
              {recent.map((notif) => (
                <li key={notif.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 text-left cursor-pointer transition-colors hover:bg-muted/40",
                      !notif.isRead && "bg-primary/3",
                    )}
                    onClick={() => markRead.mutate(notif.id)}
                    data-ocid={`nav.notification_item.${notif.id}`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">
                      {getNotifIcon(notif.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          !notif.isRead
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground/80",
                        )}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notif.body}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="px-4 py-2.5 border-t border-border">
            <Link
              to="/orders"
              className="text-xs text-primary hover:underline font-medium"
              onClick={() => setOpen(false)}
              data-ocid="nav.notifications_view_all"
            >
              View all orders →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── User menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const { t, language, setLanguage } = useLanguage();
  const { data: profile } = useUserProfile();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const [userName, setUserName] = useState("Demo User");
  const [userRole, setUserRole] = useState("customer");
  useEffect(() => {
    const email = localStorage.getItem("currentUserEmail");
    if (email) {
      const p = getUserProfile(email);
      if (p) {
        setUserName(p.firstName);
        setUserRole(email.toLowerCase() === "admin@nexgro.com" ? "admin" : "customer");
      }
    }
  }, [profile]);

  const shortId = profile?.name || userName;
  const languages: Language[] = ["en", "hi", "ta"];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors duration-200"
        data-ocid="user.menu_button"
      >
        <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <span className="hidden md:block text-sm text-foreground/80 max-w-[80px] truncate">
          {shortId}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-elevated z-50 py-1 overflow-hidden">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
            data-ocid="user.profile_link"
            onClick={() => setOpen(false)}
          >
            <User className="w-4 h-4 text-muted-foreground" />
            {t("nav.profile")}
          </Link>
          {(profile?.role === "admin" || userRole === "admin") && (
            <Link
              to="/admin-nexgro-secret-2024"
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary/5 text-primary font-bold transition-colors"
              data-ocid="user.admin_link"
              onClick={() => setOpen(false)}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}
          <Link
            to="/orders"
            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
            data-ocid="user.orders_link"
            onClick={() => setOpen(false)}
          >
            <Package className="w-4 h-4 text-muted-foreground" />
            {t("nav.orders")}
          </Link>
          <Link
            to="/wishlist"
            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
            data-ocid="user.wishlist_link"
            onClick={() => setOpen(false)}
          >
            <Heart className="w-4 h-4 text-muted-foreground" />
            {t("nav.wishlist")}
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
            data-ocid="user.loyalty_link"
            onClick={() => setOpen(false)}
          >
            <Star className="w-4 h-4 text-muted-foreground" />
            {t("nav.loyalty")}
          </Link>

          <div className="border-t border-border my-1" />


          {/* Language switcher in profile dropdown */}
          <div className="px-4 py-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">
              Language
            </p>
            <div className="flex gap-1.5">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "flex-1 py-1 text-xs rounded-md font-medium transition-colors",
                    language === lang
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground/70",
                  )}
                  data-ocid={`user.language_option.${lang}`}
                >
                  {LANG_LABELS[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border my-1" />
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              setOpen(false);
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left text-destructive hover:bg-destructive/5 transition-colors"
            data-ocid="user.logout_button"
          >
            <LogOut className="w-4 h-4" />
            {t("nav.signout")}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      toast.success(`Searching for: ${transcript}`);
      // Auto submit after a delay
      setTimeout(() => {
        window.location.href = `/search?q=${encodeURIComponent(transcript)}`;
      }, 1000);
    };

    recognition.start();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center",
        mobile ? "w-full" : "flex-1 max-w-md",
      )}
    >
      <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        placeholder={t("search.placeholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "w-full pl-9 pr-12 py-2 text-sm rounded-full border bg-background text-foreground transition-all duration-200 outline-none",
          isFocused
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary/40",
        )}
        data-ocid="nav.search_input"
      />
      <button
        type="button"
        onClick={startListening}
        className={cn(
          "absolute right-3 p-1.5 rounded-full transition-colors",
          isListening ? "bg-primary text-primary-foreground animate-pulse" : "text-muted-foreground hover:bg-muted"
        )}
        title="Voice Search"
      >
        {isListening ? <Mic className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
      </button>
    </form>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────

function MobileBottomNav() {
  const loc = useLocation();
  const { t } = useLanguage();
  const { data: cartItems } = useCart();
  const cartCount = cartItems?.length ?? 0;

  const links = [
    { to: "/home", icon: Home, label: t("nav.home"), ocid: "mobile_nav.home" },
    {
      to: "/search",
      icon: Grid3X3,
      label: t("nav.browse"),
      ocid: "mobile_nav.browse",
    },
    {
      to: "/cart",
      icon: ShoppingCart,
      label: "Cart",
      ocid: "mobile_nav.cart",
      badge: cartCount,
    },
    {
      to: "/orders",
      icon: Package,
      label: t("nav.orders"),
      ocid: "mobile_nav.orders",
    },
    {
      to: "/profile",
      icon: User,
      label: t("nav.profile"),
      ocid: "mobile_nav.profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ to, icon: Icon, label, ocid, badge }) => {
          const isActive =
            loc.pathname === to || loc.pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative min-w-[52px]",
                isActive
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-ocid={ocid}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive && "scale-110 transition-transform",
                  )}
                />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive && "text-primary",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function Layout({ children }: LayoutProps) {
  const { t } = useLanguage();
  const loc = useLocation();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background pt-[env(safe-area-inset-top)]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-xs pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main nav row */}
          <div className="flex items-center gap-4 h-14">
            {/* Logo */}
            <Link
              to="/home"
              className="flex items-center gap-2 shrink-0"
              data-ocid="nav.logo_link"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold font-display">
                  N
                </span>
              </div>
              <span className="font-display font-bold text-lg text-foreground tracking-tight hidden sm:block">
                Ne<span className="text-primary">X</span>gro
              </span>
            </Link>

            {/* Search bar — desktop */}
            {!["/home", "/cart", "/orders", "/profile"].includes(loc.pathname) && (
              <div className="hidden md:flex flex-1 max-w-lg mx-4">
                <SearchBar />
              </div>
            )}

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-5 ml-2">
              <NavLink to="/home">{t("nav.home")}</NavLink>
              <NavLink to="/categories/fruits">{t("nav.browse")}</NavLink>
              <NavLink to="/wishlist">{t("nav.wishlist")}</NavLink>
            </nav>

            <div className="flex items-center gap-1.5 ml-auto">
              {/* Language switcher */}
              <LanguageSwitcher />


              {/* Notification bell */}
              <NotificationBell />

              {/* Cart icon */}
              <Link
                to="/cart"
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                data-ocid="nav.cart_link"
              >
                <ShoppingCart className="w-5 h-5 text-foreground/70" />
                <CartBadge />
              </Link>

              {/* User menu */}
              <UserMenu />
            </div>
          </div>

          {/* Mobile search row */}
          {!["/home", "/cart", "/orders", "/profile"].includes(loc.pathname) && (
            <div className="md:hidden pb-2">
              <SearchBar mobile />
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Footer — desktop only */}
      <footer className="hidden md:block bg-card border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold font-display">
                    N
                  </span>
                </div>
                <span className="font-display font-bold text-foreground">
                  NeXgro
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fresh groceries delivered to your door in minutes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">
                Shop
              </h4>
              <ul className="space-y-2">
                {[
                  "All Products",
                  "Flash Deals",
                  "New Arrivals",
                  "Best Sellers",
                ].map((l) => (
                  <li key={l}>
                    <Link
                      to="/home"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">
                Account
              </h4>
              <ul className="space-y-2">
                {[
                  [t("nav.orders"), "/orders"],
                  [t("nav.profile"), "/profile"],
                  [t("nav.wishlist"), "/wishlist"],
                  [t("nav.loyalty"), "/profile"],
                ].map(([l, to]) => (
                  <li key={l}>
                    <Link
                      to={to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">
                Help
              </h4>
              <ul className="space-y-2">
                {["Track Order", "Return Policy", "FAQ", "Contact Us"].map(
                  (l) => (
                    <li key={l}>
                      <span className="text-sm text-muted-foreground">{l}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              © {year}. Built with{" "}
              <a
                href="https://jovinportfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Jovin Nijo
              </a>
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />

      {/* Floating chat widget — always visible */}
      <ChatWidget />

      {/* Comparison bar — shows when products are in comparison */}
      <ComparisonBar />
    </div>
  );
}
