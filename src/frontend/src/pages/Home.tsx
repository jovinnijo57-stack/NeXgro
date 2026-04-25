import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBanners,
  useBestSellers,
  useBuyXGetYRules,
  useCategories,
  useFeaturedProducts,
  useFlashDeals,
  useNewArrivals,
  useSeasonalCollections,
} from "@/hooks/useBackend";
import { type Product, SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from "@/types";
import type { SeasonalCollection } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  RefreshCw,
  Mic,
  MicOff,
  Search,
  ShoppingCart,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Truck,
  User,
  Utensils,
  Zap,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  emoji: string;
  badge: string;
  gradient: string;
  hasTimer?: boolean;
  endTime?: number;
}

const HERO_BANNERS: HeroBanner[] = [
  {
    id: "b1",
    title: "Fresh Arrivals This Week",
    subtitle:
      "Up to 30% off on seasonal produce. Farm-fresh quality guaranteed.",
    cta: "Shop Produce",
    emoji: "🥗",
    badge: "FRESH DEALS",
    gradient:
      "linear-gradient(135deg, oklch(0.44 0.17 142) 0%, oklch(0.36 0.14 145) 100%)",
  },
  {
    id: "b2",
    title: "Flash Deals — Ends Tonight",
    subtitle:
      "Limited-time offers on dairy, snacks and beverages. Don't miss out.",
    cta: "Grab Deals",
    emoji: "⚡",
    badge: "LIMITED TIME",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.20 33) 0%, oklch(0.45 0.18 35) 100%)",
  },
  {
    id: "b3",
    title: "Buy 2 Get 1 Free",
    subtitle: "On all bakery products this weekend. Stock up and save big.",
    cta: "Shop Bakery",
    emoji: "🍞",
    gradient: "linear-gradient(135deg, oklch(0.60 0.16 142) 0%, oklch(0.50 0.14 145) 100%)",
    hasTimer: false
  },
  {
    id: "b3",
    badge: "Loyalty Boost",
    title: "2x Points on All Fruits",
    subtitle: "Earn double rewards when you buy organic fruits.",
    cta: "View Rewards",
    emoji: "⭐",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    hasTimer: false
  },
];

const SALE_BANNERS = [
  {
    id: "s1",
    label: "Fruits 30% OFF",
    emoji: "🍎",
    gradient:
      "linear-gradient(135deg, oklch(0.65 0.18 22), oklch(0.55 0.20 15))",
  },
  {
    id: "s2",
    label: "Dairy Flash Sale",
    emoji: "🥛",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.15 220), oklch(0.45 0.18 230))",
  },
  {
    id: "s3",
    label: "Snacks Bundle",
    emoji: "🍿",
    gradient:
      "linear-gradient(135deg, oklch(0.60 0.18 40), oklch(0.50 0.20 35))",
  },
  {
    id: "s4",
    label: "Bakery Week",
    emoji: "🍞",
    gradient:
      "linear-gradient(135deg, oklch(0.55 0.15 60), oklch(0.48 0.17 55))",
  },
  {
    id: "s5",
    label: "Frozen Deals",
    emoji: "❄️",
    gradient:
      "linear-gradient(135deg, oklch(0.50 0.17 200), oklch(0.42 0.18 210))",
  },
  {
    id: "s6",
    label: "Organic Picks",
    emoji: "🌿",
    gradient:
      "linear-gradient(135deg, oklch(0.46 0.17 145), oklch(0.38 0.15 148))",
  },
];

const CAT_GRADIENTS: Record<string, string> = {
  fruits: "linear-gradient(135deg, oklch(0.65 0.20 145), oklch(0.55 0.22 140))",
  dairy: "linear-gradient(135deg, oklch(0.55 0.18 220), oklch(0.45 0.20 225))",
  bakery: "linear-gradient(135deg, oklch(0.60 0.16 55), oklch(0.50 0.18 50))",
  snacks: "linear-gradient(135deg, oklch(0.60 0.20 35), oklch(0.52 0.22 30))",
  beverages:
    "linear-gradient(135deg, oklch(0.50 0.18 280), oklch(0.42 0.20 285))",
  frozen: "linear-gradient(135deg, oklch(0.50 0.17 195), oklch(0.42 0.19 200))",
  pantry: "linear-gradient(135deg, oklch(0.55 0.14 65), oklch(0.48 0.16 60))",
  meat: "linear-gradient(135deg, oklch(0.55 0.18 15), oklch(0.48 0.20 10))",
  personal:
    "linear-gradient(135deg, oklch(0.55 0.15 310), oklch(0.48 0.17 315))",
  household:
    "linear-gradient(135deg, oklch(0.50 0.14 240), oklch(0.43 0.16 245))",
};

const FALLBACK_FEATURED: any[] = [];
const FALLBACK_BEST_SELLERS: any[] = [];
const FALLBACK_NEW_ARRIVALS: any[] = [];
const FLASH_DEAL_PRODUCTS: any[] = [];

function useCountdown(endsInMs: number) {
  const [remaining, setRemaining] = useState(endsInMs - Date.now());
  useEffect(() => {
    const iv = setInterval(
      () => setRemaining((r) => Math.max(0, r - 1000)),
      1000,
    );
    return () => clearInterval(iv);
  }, [endsInMs]);
  const h = String(Math.floor(remaining / 3600000)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
  return { h, m, s };
}

function CountdownDisplay({ h, m, s }: { h: string; m: string; s: string }) {
  const segments = [h, m, s];
  const labels = ["HRS", "MIN", "SEC"];
  return (
    <div className="flex items-center gap-1.5">
      {segments.map((val, i) => (
        <div key={labels[i]} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <div className="font-display font-bold text-lg min-w-[38px] text-center px-2 py-1 rounded-lg bg-black/25 text-white">
              {val}
            </div>
            <span className="text-[9px] font-bold mt-0.5 text-white/60">
              {labels[i]}
            </span>
          </div>
          {i < 2 && (
            <span className="text-xl font-bold mb-3 text-white/70">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setIsTransitioning(false);
      }, 200);
    },
    [isTransitioning],
  );

  const next = useCallback(
    () => goTo((current + 1) % HERO_BANNERS.length),
    [current, goTo],
  );
  const prev = useCallback(
    () => goTo((current - 1 + HERO_BANNERS.length) % HERO_BANNERS.length),
    [current, goTo],
  );

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  const banner = HERO_BANNERS[current];

  return (
    <section data-ocid="home.banner_section" className="relative">
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{ minHeight: 220 }}
      >
        <div
          className="relative p-7 sm:p-10 md:p-12 transition-opacity duration-300 flex flex-col justify-between min-h-[220px]"
          style={{
            background: banner.gradient,
            opacity: isTransitioning ? 0 : 1,
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10">
            <span className="inline-block text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase bg-white/[0.18] text-white/90">
              {banner.badge}
            </span>
          </div>
          <div className="relative z-10 flex items-end justify-between mt-4">
            <div className="flex-1 min-w-0">
              <h2
                className="font-display font-bold text-white leading-tight mb-2"
                style={{ fontSize: "clamp(1.4rem, 3.5vw, 2rem)" }}
              >
                {banner.title}
              </h2>
              <p className="text-sm text-white/75 mb-4 max-w-xs">
                {banner.subtitle}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/search"
                  className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-white/90 active:scale-95 transition-all"
                  data-ocid={`banner.cta.${banner.id}`}
                >
                  {banner.cta}
                </Link>
                {banner.hasTimer && <CountdownDisplay {...(useCountdown(banner.endTime || 0))} />}
              </div>
            </div>
            <div
              className="text-[5rem] shrink-0 ml-4 select-none hidden sm:block"
              style={{ opacity: 0.2, lineHeight: 1 }}
            >
              {banner.emoji}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-black/25 text-white"
          aria-label="Previous banner"
          data-ocid="banner.prev_button"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 bg-black/25 text-white"
          aria-label="Next banner"
          data-ocid="banner.next_button"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        {HERO_BANNERS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              background:
                i === current ? "oklch(0.48 0.16 142)" : "oklch(0.80 0.02 142)",
            }}
            aria-label={`Go to slide ${i + 1}`}
            data-ocid={`banner.dot.${i + 1}`}
          />
        ))}
      </div>

      {/* Sale banners strip */}
      <div
        className="mt-4 flex gap-3 overflow-x-auto pb-1 snap-x scrollbar-thin"
        data-ocid="home.sale_banners_strip"
      >
        {SALE_BANNERS.map((s) => (
          <Link
            key={s.id}
            to="/search"
            className="shrink-0 snap-start flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: s.gradient, minWidth: 160 }}
            data-ocid={`sale_banner.${s.id}`}
          >
            <span className="text-xl">{s.emoji}</span>
            <span>{s.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CategoryGrid() {
  const { data: backendCats, isLoading } = useCategories();
  const cats = (backendCats ?? []).slice(0, 10);

  return (
    <section data-ocid="home.categories_section">
      <SectionHeader
        icon={<Grid3X3 className="w-5 h-5 text-primary" />}
        title="Shop by Category"
        linkTo="/categories/fruits"
        linkOcid="home.all_categories_link"
        linkLabel="View all →"
      />
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {isLoading
          ? ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"].map(
              (k) => (
                <Skeleton key={`cat-sk-${k}`} className="h-20 rounded-xl" />
              ),
            )
          : cats.map((cat, i) => {
              const grad =
                CAT_GRADIENTS[cat.id] ??
                "linear-gradient(135deg, oklch(0.50 0.12 180), oklch(0.42 0.14 185))";
              return (
                <Link
                  key={cat.id}
                  to="/categories/$categoryId"
                  params={{ categoryId: cat.id }}
                  className="group flex flex-col items-center gap-2 p-2.5 rounded-2xl border border-border hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                  style={{ background: grad, opacity: 0.92 }}
                  data-ocid={`category.item.${i + 1}`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-200 bg-primary/20">
                    {cat.iconEmoji}
                  </div>
                  <span className="text-[10px] font-semibold text-foreground/70 text-center leading-tight line-clamp-2">
                    {cat.name.split(" ")[0]}
                  </span>
                </Link>
              );
            })}
      </div>

      {/* Promotional banners grid */}
      <div
        className="grid grid-cols-2 gap-3 mt-4"
        data-ocid="home.promo_banners_grid"
      >
        {[
          {
            id: "p1",
            title: "Flash Deals",
            sub: "Save up to 40%",
            emoji: "⚡",
            gradient:
              "linear-gradient(135deg, oklch(0.55 0.20 33), oklch(0.45 0.22 28))",
          },
          {
            id: "p2",
            title: "Seasonal Collections",
            sub: "New themed bundles",
            emoji: "🌸",
            gradient:
              "linear-gradient(135deg, oklch(0.52 0.18 300), oklch(0.44 0.20 310))",
          },
        ].map((promo) => (
          <Link
            key={promo.id}
            to="/search"
            className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-end hover:opacity-95 transition-opacity"
            style={{ background: promo.gradient, minHeight: 110 }}
            data-ocid={`home.promo_banner.${promo.id}`}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <span
              className="absolute top-3 right-3 text-3xl select-none"
              style={{ opacity: 0.3 }}
            >
              {promo.emoji}
            </span>
            <p className="font-display font-bold text-white text-base relative z-10">
              {promo.title}
            </p>
            <p className="text-white/70 text-xs mt-0.5 relative z-10">
              {promo.sub}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FlashDealsSection() {
  const { data: backendDeals, isLoading } = useFlashDeals();
  const { h, m, s } = useCountdown(4 * 3600000 + 37 * 60000 + 14000);

  const products: Product[] =
    backendDeals && backendDeals.length > 0
      ? backendDeals
          .filter((d) => d.product)
          .map((d) => d.product!)
          .slice(0, 6)
      : FLASH_DEAL_PRODUCTS;

  return (
    <section
      className="rounded-3xl overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.52 0.20 33) 0%, oklch(0.45 0.19 32) 100%)",
      }}
      data-ocid="home.flash_deals_section"
    >
      <div className="p-5 sm:p-6 pb-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-white/[0.18]">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Flash Deals
            </h2>
            <p className="text-[11px] font-medium text-white/65">
              Hurry — limited stock!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/70">Ends in</span>
            <CountdownDisplay h={h} m={m} s={s} />
          </div>
          <Link
            to="/search"
            className="text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:opacity-90 shrink-0 bg-white/[0.18] text-white"
            data-ocid="home.flash_deals_link"
          >
            See all
          </Link>
        </div>
      </div>
      <div className="px-5 sm:px-6 pb-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {["a", "b", "c", "d", "e", "f"].map((k) => (
              <Skeleton
                key={`fd-sk-${k}`}
                className="h-52 rounded-2xl opacity-40"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {products.map((p, i) => (
              <div
                key={p.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <ProductCard
                  product={p}
                  index={i + 1}
                  flashDiscountPercent={20 + (i % 3) * 5}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SectionHeader({
  icon,
  title,
  linkTo,
  linkOcid,
  linkLabel,
}: {
  icon: React.ReactNode;
  title: string;
  linkTo: string;
  linkOcid: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <Link
        to={linkTo}
        className="text-sm font-medium text-primary hover:text-primary/70 transition-colors"
        data-ocid={linkOcid}
      >
        {linkLabel}
      </Link>
    </div>
  );
}

function FeaturedSection() {
  const { data: backendFeatured, isLoading } = useFeaturedProducts();
  const { data: bxgyRules } = useBuyXGetYRules();
  const products =
    backendFeatured && backendFeatured.length > 0
      ? backendFeatured.slice(0, 6)
      : FALLBACK_FEATURED;

  return (
    <section data-ocid="home.featured_section">
      <SectionHeader
        icon={<Star className="w-5 h-5 text-primary fill-primary" />}
        title="Featured Products"
        linkTo="/search"
        linkOcid="home.featured_link"
        linkLabel="View all →"
      />
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {["a", "b", "c", "d", "e", "f"].map((k) => (
            <Skeleton key={`feat-sk-${k}`} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i + 1}
              buyXGetYRules={bxgyRules}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function BestSellersSection() {
  const { data: backendBest, isLoading } = useBestSellers();
  const products =
    backendBest && backendBest.length > 0
      ? backendBest.slice(0, 6)
      : FALLBACK_BEST_SELLERS;

  return (
    <section data-ocid="home.best_sellers_section">
      <SectionHeader
        icon={<ShoppingBag className="w-5 h-5 text-primary" />}
        title="Best Sellers"
        linkTo="/search"
        linkOcid="home.best_sellers_link"
        linkLabel="See all →"
      />
      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={`bs-sk-${k}`} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i + 1}
              variant="compact"
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NewArrivalsSection() {
  const { data: backendNew, isLoading } = useNewArrivals();
  const products =
    backendNew && backendNew.length > 0
      ? backendNew.slice(0, 4)
      : FALLBACK_NEW_ARRIVALS;

  return (
    <section data-ocid="home.new_arrivals_section">
      <SectionHeader
        icon={<Truck className="w-5 h-5 text-primary" />}
        title="New Arrivals"
        linkTo="/search"
        linkOcid="home.new_arrivals_link"
        linkLabel="See all →"
      />
      {isLoading ? (
        <div className="space-y-2">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={`na-sk-${k}`} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i + 1}
              variant="compact"
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SeasonalCollectionCard({
  collection,
  index,
}: { collection: SeasonalCollection; index: number }) {
  const collectionProducts = SAMPLE_PRODUCTS.filter((p) =>
    collection.productIds.includes(p.id),
  ).slice(0, 6);
  const endDate = new Date(collection.endDate);
  const daysLeft = Math.ceil(
    (endDate.getTime() - Date.now()) / (1000 * 3600 * 24),
  );

  return (
    <div
      className="rounded-2xl overflow-hidden border border-border bg-card dark:bg-card"
      data-ocid={`seasonal.collection.${index}`}
    >
      <div
        className="relative px-5 py-4 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${collection.badgeColor}22, ${collection.badgeColor}08)`,
          borderBottom: `2px solid ${collection.badgeColor}40`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{
              background: `${collection.badgeColor}20`,
              border: `1.5px solid ${collection.badgeColor}40`,
            }}
          >
            <CalendarRange
              className="w-5 h-5"
              style={{ color: collection.badgeColor }}
            />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground leading-tight">
              {collection.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-[260px] truncate">
              {collection.theme}
            </p>
          </div>
        </div>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-3"
          style={{
            background: `${collection.badgeColor}20`,
            color: collection.badgeColor,
            border: `1px solid ${collection.badgeColor}40`,
          }}
        >
          {daysLeft > 0 ? `${daysLeft}d left` : "Ending soon"}
        </span>
      </div>
      <div className="px-4 py-4">
        {collectionProducts.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x scrollbar-thin">
            {collectionProducts.map((p, i) => (
              <div
                key={p.id}
                className="w-36 shrink-0 snap-start"
                data-ocid={`seasonal.product.${index}.${i + 1}`}
              >
                <ProductCard product={p} index={i + 1} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Products coming soon
          </p>
        )}
      </div>
    </div>
  );
}

function SeasonalCollectionsSection() {
  const { data: collections, isLoading } = useSeasonalCollections();

  return (
    <section data-ocid="home.seasonal_collections_section">
      <div
        className="relative rounded-3xl overflow-hidden mb-5 p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.42 0.18 300) 0%, oklch(0.55 0.16 30) 50%, oklch(0.48 0.20 142) 100%)",
        }}
        data-ocid="seasonal.banner"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="inline-block text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase mb-3 bg-white/[0.18] text-white/90">
              SEASONAL PICKS
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
              Seasonal Collections
            </h2>
            <p className="text-sm mt-1.5 text-white/70">
              Curated for the season — fresh deals, themed bundles &amp; more
            </p>
          </div>
          <div
            className="text-[4rem] shrink-0 ml-4 select-none hidden sm:block"
            style={{ opacity: 0.2, lineHeight: 1 }}
          >
            🌸
          </div>
        </div>
        <Link
          to="/search"
          className="relative z-10 inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.97] bg-white/[0.18] text-white border border-white/30"
          data-ocid="seasonal.view_all_link"
        >
          View All Collections →
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {["a", "b"].map((k) => (
            <Skeleton key={`sc-sk-${k}`} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(collections ?? []).map((col, i) => (
            <SeasonalCollectionCard
              key={col.id}
              collection={col}
              index={i + 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

const PROMO_ITEMS = [
  { icon: Truck, label: "Free delivery over ₹30", sub: "No hidden fees" },
  { icon: Zap, label: "30-min express delivery", sub: "Select areas" },
  { icon: Sparkles, label: "Earn loyalty points", sub: "1 pt per ₹1 spent" },
  { icon: ShoppingBag, label: "Easy returns", sub: "No questions asked" },
];

function SearchBar() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const addToCart = useAddToCart();

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setIsListening(false);
      toast.success(`Heard: "${text}"`);
      if (text.includes("add") || text.includes("buy")) {
        const p = SAMPLE_PRODUCTS.find(p => text.includes(p.name.toLowerCase()));
        if (p) {
          await addToCart.mutateAsync({ productId: p.id, qty: 1 });
          toast.success(`Added ${p.name} to cart!`);
        } else {
          toast.error("Product not found.");
        }
      } else {
        navigate({ to: "/search", search: { q: text } });
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="relative group max-w-2xl mx-auto mb-6">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        placeholder='Say "Add milk" or search products...'
        onFocus={() => navigate({ to: "/search" })}
        className="w-full bg-card border-2 border-border rounded-2xl pl-12 pr-12 py-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
      />
      <button
        onClick={(e) => { e.stopPropagation(); startListening(); }}
        className={cn("absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all", isListening ? "bg-destructive text-white animate-pulse" : "bg-primary/10 text-primary hover:bg-primary/20")}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
    </div>
  );
}

function PromoStrip() {
  return (
    <section
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
      data-ocid="home.promo_strip"
    >
      {PROMO_ITEMS.map(({ icon: Icon, label, sub }) => (
        <div
          key={label}
          className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 dark:bg-card"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight truncate">
              {label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function FeatureQuickAccess() {
  const navigate = useNavigate();
  const features = [
    { id: "ai", title: "AI Shopper", icon: Sparkles, color: "bg-purple-500", path: "/ai-shopper" },
    { id: "recipes", title: "Recipes", icon: Utensils, color: "bg-orange-500", path: "/recipes" },
    { id: "pantry", title: "Smart Pantry", icon: Bell, color: "bg-amber-500", path: "/smart-pantry" },
    { id: "subs", title: "Subscriptions", icon: RefreshCw, color: "bg-blue-500", path: "/subscriptions" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 my-8" data-ocid="home.features_grid">
      {features.map((f) => (
        <button
          key={f.id}
          onClick={() => navigate({ to: f.path as any })}
          className="flex flex-col items-center gap-2 group"
        >
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform", f.color)}>
            <f.icon className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{f.title}</span>
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const [showFloatingVideo, setShowFloatingVideo] = useState(true);
  useBanners();
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8"
      data-ocid="home.page"
    >
      {showFloatingVideo && (
        <div 
          className="fixed bottom-24 right-4 z-50 w-[140px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/30 group animate-in fade-in slide-in-from-bottom-10 duration-500"
          data-ocid="home.floating_video"
        >
          <button
            type="button"
            onClick={() => setShowFloatingVideo(false)}
            className="absolute top-2 right-2 z-20 p-1 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Close video"
          >
            <X className="w-3 h-3" />
          </button>
          <video
            src="/video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <SearchBar />
      <HeroCarousel />
      <FeatureQuickAccess />
      <PromoStrip />
      <CategoryGrid />
      <FlashDealsSection />
      <SeasonalCollectionsSection />
      <FeaturedSection />
      <div className="grid md:grid-cols-2 gap-8">
        <BestSellersSection />
        <NewArrivalsSection />
      </div>
    </div>
  );
}
