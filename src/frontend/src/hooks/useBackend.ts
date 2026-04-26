import { createActor } from "@/backend";
import type {
  AdminStats as BackendAdminStats,
  ProductFilters as BackendFilters,
  LoyaltyTransaction as BackendLoyaltyTx,
  BannerPublic,
  CartItemPublic,
  CategoryPublic,
  CouponPublic,
  FlashDealPublic,
  OrderPublic,
  ProductPublic,
  ReviewPublic,
  SavedAddressPublic,
  UserPublic,
} from "@/backend.d";
import {
  type OrderStatus as BackendOrderStatus,
  Variant_fixed_percent,
} from "@/backend.d";
import {
  type AdminStats,
  type Banner,
  type Bundle,
  type CartItem,
  type Category,
  type Coupon,
  type FlashDeal,
  type LoyaltyTransaction,
  type Order,
  type OrderStatus,
  type PlaceOrderResult,
  type Product,
  type ProductFilters,
  type Review,
  type SavedAddress,
  type StockSubscription,
  type User,
  type WishlistItem,
  type DeliveryZone,
  SAMPLE_CATEGORIES,
  SAMPLE_PRODUCTS,
} from "@/types";
import type { BuyXGetYRule, SeasonalCollection, MealPlan, Referral } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Re-export for convenience
export { useInternetIdentity } from "@caffeineai/core-infrastructure";

function useBackendActor() {
  return useActor(createActor);
}

// ─── Adapters ────────────────────────────────────────────────────────────────

function adaptProduct(p: ProductPublic): Product {
  return {
    id: p.id.toString(),
    name: p.name,
    description: p.description,
    price: Number(p.price) / 100,
    categoryId: p.categoryId.toString(),
    imageUrl: p.imageBlob.getDirectURL(),
    stockQty: Number(p.stockQty),
    rating: Number(p.rating) / 10,
    reviewCount: Number(p.reviewCount),
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
    createdAt: p.createdAt,
    ageRestricted: p.ageRestricted,
    ageCategory: p.ageCategory ?? null,
  };
}

function adaptCategory(c: CategoryPublic): Category {
  return {
    id: c.id.toString(),
    name: c.name,
    displayOrder: Number(c.displayOrder),
    isActive: c.isActive,
    iconEmoji: c.iconEmoji,
  };
}

function adaptOrder(o: OrderPublic): Order {
  return {
    id: o.id.toString(),
    userId: o.userId.toString(),
    items: o.items.map((item) => {
      const productId = item.productId.toString();
      const p = SAMPLE_PRODUCTS.find(sp => sp.id === productId);
      return {
        productId,
        productName: p?.name || "Product",
        price: Number(item.priceAtOrder) / 100,
        quantity: Number(item.quantity),
        imageUrl: p?.imageUrl || "",
      };
    }),
    subtotal: Number(o.subtotal) / 100,
    deliveryFee: Number(o.deliveryFee) / 100,
    tax: Number(o.tax) / 100,
    total: Number(o.total) / 100,
    couponId: o.couponId?.toString(),
    loyaltyPointsRedeemed: Number(o.loyaltyPointsRedeemed),
    deliveryAddress: {
      id: "",
      userId: o.userId.toString(),
      street: o.deliveryAddress.street,
      city: o.deliveryAddress.city,
      state: o.deliveryAddress.state,
      zip: o.deliveryAddress.zip,
      phone: o.deliveryAddress.phone,
      label: o.deliveryAddress.tag,
      isDefault: false,
    },
    status: o.status as OrderStatus,
    statusHistory: o.statusHistory.map((h) => ({
      status: h.status as OrderStatus,
      timestamp: h.timestamp,
    })),
    createdAt: o.createdAt,
    estimatedDelivery: o.estimatedDelivery,
  };
}

function adaptCartItem(c: CartItemPublic): CartItem {
  return {
    userId: c.userId.toString(),
    productId: c.productId.toString(),
    quantity: Number(c.quantity),
    addedAt: c.addedAt,
  };
}

function adaptReview(r: ReviewPublic): Review {
  return {
    id: r.id.toString(),
    productId: r.productId.toString(),
    userId: r.userId.toString(),
    userName: `${r.userId.toString().slice(0, 8)}…`,
    rating: Number(r.rating),
    title: r.title,
    text: r.text,
    isApproved: r.isApproved,
    helpfulCount: Number(r.helpfulCount),
    createdAt: r.createdAt,
  };
}

function adaptCoupon(c: CouponPublic): Coupon {
  return {
    id: c.id.toString(),
    code: c.code,
    discountType:
      c.discountType === Variant_fixed_percent.percent ? "percentage" : "fixed",
    discountValue: Number(c.discountValue),
    expirationDate: c.expirationDate,
    isActive: c.isActive,
    usageLimit: Number(c.usageLimit),
    usageCount: Number(c.usageCount),
  };
}

function adaptBanner(b: BannerPublic): Banner {
  return {
    id: b.id.toString(),
    imageUrl: b.imageBlob.getDirectURL(),
    title: b.title,
    link: b.link,
    displayOrder: Number(b.displayOrder),
    isActive: b.isActive,
    createdAt: b.createdAt,
  };
}

function adaptFlashDeal(f: FlashDealPublic): FlashDeal {
  return {
    id: f.id.toString(),
    productId: f.productId.toString(),
    discountPercent: Number(f.discountPercent),
    startDateTime: f.startDateTime,
    endDateTime: f.endDateTime,
    isActive: f.isActive,
  };
}

function adaptUser(u: UserPublic): User {
  return {
    id: u.id.toString(),
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role === "admin" ? "admin" : "customer",
    loyaltyBalance: Number(u.loyaltyBalance),
    walletBalance: 0, // Will be fetched via useWalletBalance
    referralCode: u.referralCode,
    referredBy: u.referredBy?.toString(),
    totalReferralEarnings: 0,
    createdAt: u.createdAt,
  };
}

function adaptAddress(a: SavedAddressPublic): SavedAddress {
  return {
    id: a.id.toString(),
    userId: a.userId.toString(),
    street: a.street,
    city: a.city,
    state: a.state,
    zip: a.zip,
    phone: a.phone,
    label: a.tag,
    isDefault: a.isDefault,
  };
}

function adaptLoyaltyTx(t: BackendLoyaltyTx): LoyaltyTransaction {
  return {
    id: t.id.toString(),
    userId: t.userId.toString(),
    pointsChange: Number(t.pointsChange),
    reason: t.reason,
    orderId: t.orderId?.toString(),
    createdAt: t.createdAt,
  };
}

function adaptAdminStats(s: BackendAdminStats): AdminStats {
  return {
    totalOrders: Number(s.totalOrders),
    totalRevenue: Number(s.totalRevenue) / 100,
    activeUsers: Number(s.totalUsers),
    lowStockAlerts: Number(s.lowStockCount),
    pendingOrders: 12, // Mocked
    pendingReviews: Number(s.pendingReviews),
  };
}

function buildBackendFilters(filters?: ProductFilters): BackendFilters {
  return {
    categoryId:
      filters?.categoryId !== undefined
        ? BigInt(filters.categoryId)
        : undefined,
    minPrice:
      filters?.minPrice !== undefined
        ? BigInt(Math.round(filters.minPrice * 100))
        : undefined,
    maxPrice:
      filters?.maxPrice !== undefined
        ? BigInt(Math.round(filters.maxPrice * 100))
        : undefined,
    minRating:
      filters?.minRating !== undefined
        ? BigInt(Math.round(filters.minRating * 10))
        : undefined,
    searchQuery: filters?.searchQuery,
    onlyActive: filters?.onlyActive ?? true,
  };
}

// ─── Static Seasonal Collections fallback ────────────────────────────────────

const STATIC_SEASONAL_COLLECTIONS: SeasonalCollection[] = [
  {
    id: "sc1",
    name: "🪔 Diwali Dhamaka",
    theme: "Festival of Lights — Stock up on sweets, snacks & gifts",
    badgeColor: "#f59e0b",
    productIds: ["p7", "p6", "p5", "p4", "p8", "p11"],
    startDate: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
  },
  {
    id: "sc2",
    name: "☀️ Summer Fresh",
    theme: "Beat the heat — fruits, juices & chilled goods",
    badgeColor: "#10b981",
    productIds: ["p1", "p2", "p3", "p8", "p10", "p12"],
    startDate: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 3600000).toISOString(),
  },
  {
    id: "sc3",
    name: "❄️ Winter Warmers",
    theme: "Cosy up with hearty pantry staples & hot beverages",
    badgeColor: "#6366f1",
    productIds: ["p4", "p9", "p6", "p11", "p7", "p5"],
    startDate: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 3600000).toISOString(),
  },
];

// ─── Static BuyXGetY fallback ─────────────────────────────────────────────────

export const STATIC_BXGY_RULES: BuyXGetYRule[] = [
  {
    id: "bxgy1",
    productId: "p6",
    buyQty: 2,
    getQty: 1,
    name: "Buy 2 Get 1 Free on Sourdough",
  },
  {
    id: "bxgy2",
    productId: "p7",
    buyQty: 2,
    getQty: 1,
    name: "Buy 2 Get 1 Free on Mixed Nuts",
  },
  {
    id: "bxgy3",
    productId: "p4",
    buyQty: 3,
    getQty: 1,
    name: "Buy 3 Get 1 Free on Whole Milk",
  },
  {
    id: "bxgy4",
    productId: "p8",
    buyQty: 2,
    getQty: 1,
    name: "Buy 2 Get 1 Free on Orange Juice",
  },
];

// ─── Catalog ──────────────────────────────────────────────────────────────────

export function useProducts(filters?: ProductFilters) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getProducts(buildBackendFilters(filters));
      return result.map(adaptProduct);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useProductById(id: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product | null>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getProductById(BigInt(id));
      return result ? adaptProduct(result) : null;
    },
    enabled: !!actor && !isFetching && !!id,
    initialData: null,
  });
}

export function useCategories() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getCategories();
      return result.map(adaptCategory);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useFeaturedProducts() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product[]>({
    queryKey: ["featured-products"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getFeaturedProducts();
      return result.map(adaptProduct);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useBestSellers() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product[]>({
    queryKey: ["best-sellers"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getBestSellers();
      return result.map(adaptProduct);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useNewArrivals() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product[]>({
    queryKey: ["new-arrivals"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getNewArrivals();
      return result.map(adaptProduct);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useFlashDeals() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<FlashDeal[]>({
    queryKey: ["flash-deals"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getFlashDeals();
      return result.map(adaptFlashDeal);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useBanners() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getBanners();
      return result.map(adaptBanner);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useSearchProducts(query: string, filters?: ProductFilters) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product[]>({
    queryKey: ["search-products", query, filters],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.searchProducts(
        query,
        buildBackendFilters(filters),
      );
      return result.map(adaptProduct);
    },
    enabled: !!actor && !isFetching && query.length > 1,
    initialData: [],
  });
}

export function useProductReviews(productId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Review[]>({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getProductReviews(BigInt(productId));
      return result.map(adaptReview);
    },
    enabled: !!actor && !isFetching && !!productId,
    initialData: [],
  });
}

// ─── Seasonal Collections ─────────────────────────────────────────────────────

export function useSeasonalCollections() {
  return useQuery<SeasonalCollection[]>({
    queryKey: ["seasonal-collections"],
    queryFn: async () => {
      // Backend method not yet available — use static fallback
      return STATIC_SEASONAL_COLLECTIONS;
    },
    initialData: STATIC_SEASONAL_COLLECTIONS,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Buy X Get Y Rules ────────────────────────────────────────────────────────

export function useBuyXGetYRules() {
  return useQuery<BuyXGetYRule[]>({
    queryKey: ["bxgy-rules"],
    queryFn: async () => {
      // Backend method not yet available — use static fallback
      return STATIC_BXGY_RULES;
    },
    initialData: STATIC_BXGY_RULES,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Substitute Product ───────────────────────────────────────────────────────

export function useSetSubstituteProduct() {
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async ({
      productId,
      substituteId,
    }: {
      productId: string;
      substituteId: string | null;
    }) => {
      if (!actor) return; // graceful no-op if backend not ready
      // Backend method not yet available — store in local state only
      void productId;
      void substituteId;
    },
  });
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export function useCart() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getUserCart();
      return result.map(adaptCartItem);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async ({
      productId,
      qty,
    }: { productId: string; qty: number }) => {
      if (!actor) return { productId, qty }; // Mock success
      await actor.addToCart(BigInt(productId), BigInt(qty));
    },
    onSuccess: (mockData) => {
      if (!actor && mockData) {
        qc.setQueryData<CartItem[]>(["cart"], (old = []) => {
          const existing = old.find(i => i.productId === mockData.productId);
          if (existing) {
            return old.map(i => i.productId === mockData.productId ? { ...i, quantity: i.quantity + mockData.qty } : i);
          }
          return [...old, { userId: "mock", productId: mockData.productId, quantity: mockData.qty, addedAt: BigInt(Date.now()) }];
        });
      }
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) return productId;
      await actor.removeFromCart(BigInt(productId));
    },
    onSuccess: (mockProductId) => {
      if (!actor && mockProductId) {
        qc.setQueryData<CartItem[]>(["cart"], (old = []) => old.filter(i => i.productId !== mockProductId));
      }
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartQty() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async ({
      productId,
      qty,
    }: { productId: string; qty: number }) => {
      if (!actor) return { productId, qty };
      await actor.updateCartQty(BigInt(productId), BigInt(qty));
    },
    onSuccess: (mockData) => {
      if (!actor && mockData) {
        qc.setQueryData<CartItem[]>(["cart"], (old = []) => 
          old.map(i => i.productId === mockData.productId ? { ...i, quantity: mockData.qty } : i)
        );
      }
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.clearCart();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export function useWishlist() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<WishlistItem[]>({
    queryKey: ["wishlist"],
    queryFn: async () => {
      if (!actor) return [];
      const ids = await actor.getUserWishlist();
      return ids.map((id) => ({
        userId: "",
        productId: id.toString(),
        addedAt: BigInt(0),
      }));
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.addToWishlist(BigInt(productId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.removeFromWishlist(BigInt(productId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useOrders() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getUserOrders();
      return result.map(adaptOrder);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useOrderById(id: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Order | null>({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getOrderById(BigInt(id));
      return result ? adaptOrder(result) : null;
    },
    enabled: !!actor && !isFetching && !!id,
    initialData: null,
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (params: {
      addressId: string;
      couponCode?: string;
      loyaltyPointsToRedeem?: number;
      deliverySlot?: string;
      isExpressDelivery?: boolean;
      walletAmountToUse?: number;
      tipAmount?: number;
    }): Promise<PlaceOrderResult> => {
      if (!actor) {
        // Demo fallback
        console.warn("Backend not connected. Using demo order placement.");
        const orderId = `DEMO-${Date.now()}`;
        addNotification("Order Confirmed! 🎉", `Your order #${orderId} has been placed. We're getting it ready!`, "order");
        return { success: true, orderId };
      }
      const result = await actor.placeOrder(
        BigInt(params.addressId),
        params.couponCode ?? null,
        BigInt(params.loyaltyPointsToRedeem ?? 0),
        params.deliverySlot ?? null,
        params.isExpressDelivery ?? false,
        BigInt(params.walletAmountToUse ?? 0),
      );
      if (result.__kind__ === "ok") {
        const orderId = result.ok.toString();
        addNotification("Order Confirmed! 🎉", `Your order #${orderId} has been placed. We're getting it ready!`, "order");
        return { success: true, orderId };
      }
      return { success: false, error: result.err };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["loyalty"] });
      qc.invalidateQueries({ queryKey: ["wallet-balance"] });
    },
  });
}

// ─── Wallet ───────────────────────────────────────────────────────────────────

export function useWalletBalance() {
  const { actor, isFetching } = useBackendActor();
  const userEmail = localStorage.getItem("currentUserEmail") || "Guest";
  return useQuery<number>({
    queryKey: ["wallet-balance"],
    queryFn: async () => {
      if (!actor) {
        return Number(localStorage.getItem(`wallet_balance_${userEmail.toLowerCase()}`) || 0) * 100;
      }
      try {
        const result = await (
          actor as unknown as { getWalletBalance: () => Promise<bigint> }
        ).getWalletBalance();
        return Number(result);
      } catch {
        return Number(localStorage.getItem(`wallet_balance_${userEmail.toLowerCase()}`) || 0) * 100;
      }
    },
    enabled: !!actor && !isFetching,
    initialData: 0,
  });
}

// ─── User profile ─────────────────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<User | null>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getUserProfile();
      return result ? adaptUser(result) : null;
    },
    enabled: !!actor && !isFetching,
    initialData: null,
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
    }) => {
      // Sync local storage profile
      const email = localStorage.getItem("currentUserEmail");
      if (email) {
        const profiles = JSON.parse(localStorage.getItem("user_profiles") || "{}");
        if (profiles[email.toLowerCase()]) {
          const names = data.name.split(" ");
          profiles[email.toLowerCase()] = {
            ...profiles[email.toLowerCase()],
            firstName: names[0] || "",
            lastName: names.slice(1).join(" ") || "",
            phone: data.phone,
            email: data.email,
          };
          localStorage.setItem("user_profiles", JSON.stringify(profiles));
          // If email changed, we might need to update currentUserEmail too, 
          // but that's complex for session management. Let's stick to profile info.
        }
      }

      if (!actor) return; // Allow local update only if actor missing
      await actor.updateUserProfile(data.name, data.email, data.phone);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-profile"] }),
  });
}

export function useUserAddresses() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<SavedAddress[]>({
    queryKey: ["addresses"],
    queryFn: async () => {
      let backendAddresses: SavedAddress[] = [];
      if (actor) {
        try {
          const result = await actor.getUserAddresses();
          backendAddresses = result.map(adaptAddress);
        } catch (err) {
          console.error("Failed to fetch addresses from backend", err);
        }
      }
      
      const local = JSON.parse(localStorage.getItem("nexgro_saved_addresses") || "[]");
      // Merge local and backend, removing duplicates by street/city if necessary
      const merged = [...backendAddresses];
      local.forEach((l: SavedAddress) => {
        if (!merged.find(b => b.street === l.street && b.city === l.city)) {
          merged.push(l);
        }
      });
      return merged;
    },
    enabled: true,
    initialData: [],
  });
}

export function useAddAddress() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: Omit<SavedAddress, "id" | "userId">) => {
      if (actor) {
        try {
          await actor.addAddress(
            data.street,
            data.city,
            data.state,
            data.zip,
            data.phone,
            data.label,
          );
        } catch (err) {
          console.error("Backend addAddress failed", err);
        }
      }
      
      // Fallback/Shadow in localStorage
      const local = JSON.parse(localStorage.getItem("nexgro_saved_addresses") || "[]");
      const newAddr = { ...data, id: `addr-${Date.now()}`, userId: "me" };
      localStorage.setItem("nexgro_saved_addresses", JSON.stringify([...local, newAddr]));
      return newAddr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: SavedAddress) => {
      if (actor) {
        try {
          await actor.updateAddress(
            BigInt(data.id),
            data.street,
            data.city,
            data.state,
            data.zip,
            data.phone,
            data.label,
          );
        } catch (err) {
          console.error("Backend updateAddress failed", err);
        }
      }
      const local: SavedAddress[] = JSON.parse(localStorage.getItem("nexgro_saved_addresses") || "[]");
      const updated = local.map((a) => (a.id === data.id ? { ...data } : a));
      localStorage.setItem("nexgro_saved_addresses", JSON.stringify(updated));
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (addressId: string) => {
      if (actor) {
        try {
          await actor.deleteAddress(BigInt(addressId));
        } catch (err) {
          console.error("Backend deleteAddress failed", err);
        }
      }
      const local: SavedAddress[] = JSON.parse(localStorage.getItem("nexgro_saved_addresses") || "[]");
      const filtered = local.filter((a) => a.id !== addressId);
      localStorage.setItem("nexgro_saved_addresses", JSON.stringify(filtered));
      return addressId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (addressId: string) => {
      if (actor) {
        try {
          await actor.setDefaultAddress(BigInt(addressId));
        } catch (err) {
          console.error("Backend setDefaultAddress failed", err);
        }
      }
      const local: SavedAddress[] = JSON.parse(localStorage.getItem("nexgro_saved_addresses") || "[]");
      const updated = local.map((a) => ({ ...a, isDefault: a.id === addressId }));
      localStorage.setItem("nexgro_saved_addresses", JSON.stringify(updated));
      return addressId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

// ─── Loyalty ──────────────────────────────────────────────────────────────────

export function useLoyaltyBalance() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<number>({
    queryKey: ["loyalty"],
    queryFn: async () => {
      if (!actor) return 0;
      const result = await actor.getLoyaltyBalance();
      return Number(result);
    },
    enabled: !!actor && !isFetching,
    initialData: 0,
  });
}

export function useLoyaltyHistory() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<LoyaltyTransaction[]>({
    queryKey: ["loyalty-history"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getLoyaltyHistory();
      return result.map(adaptLoyaltyTx);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function useSubmitReview() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: {
      productId: string;
      rating: number;
      title: string;
      text: string;
    }) => {
      if (!actor) return data;
      await actor.submitReview(
        BigInt(data.productId),
        BigInt(data.rating),
        data.title,
        data.text,
      );
    },
    onSuccess: (mockData, vars) => {
      if (!actor && mockData) {
        qc.setQueryData<Review[]>(["admin-reviews", "pending"], (old = []) => {
          const newReview: Review = {
            id: `r${Date.now()}`,
            productId: mockData.productId,
            userId: "u1",
            userName: "Current User",
            rating: mockData.rating,
            title: mockData.title,
            text: mockData.text,
            isApproved: false,
            helpfulCount: 0,
            createdAt: BigInt(Date.now()),
          };
          return [newReview, ...old];
        });
      }
      qc.invalidateQueries({ queryKey: ["product-reviews", vars.productId] });
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalOrders: 0,
          totalRevenue: 0,
          activeUsers: 0,
          lowStockAlerts: 0,
          pendingOrders: 0,
          pendingReviews: 0,
        };
      const result = await actor.getAdminStats();
      return adaptAdminStats(result);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminOrders() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getOrders();
      return result.map(adaptOrder);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useAdminUsers() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<User[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      if (!actor) {
        // Fallback to local profiles
        const profilesStr = localStorage.getItem("user_profiles");
        if (!profilesStr) return [];
        try {
          const profiles = JSON.parse(profilesStr);
          return Object.entries(profiles).map(([email, profile]: [string, any]) => ({
            id: email,
            name: `${profile.firstName} ${profile.lastName}`,
            email: email,
            phone: profile.phone || "",
            role: "customer",
            loyaltyBalance: 0,
            walletBalance: Number(localStorage.getItem(`wallet_balance_${email.toLowerCase()}`) || 0),
            referralCode: profile.referral || "",
            totalReferralEarnings: 0,
            createdAt: BigInt(Date.now()),
          }));
        } catch {
          return [];
        }
      }
      const result = await actor.getUsers();
      return result.map(adaptUser);
    },
    enabled: true, // Always enable to show local users if actor is missing
    initialData: [],
  });
}

export function useAdminCoupons() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Coupon[]>({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getCoupons();
      return result.map(adaptCoupon);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useAdminReviews(status: "pending" | "approved") {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Review[]>({
    queryKey: ["admin-reviews", status],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getReviews(status === "approved");
      return result.map(adaptReview);
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: { orderId: string; status: string }) => {
      if (!actor) {
        if (data.status === "Delivered") {
           addNotification("Package Delivered! 📦", `Your order #${data.orderId} has been delivered. Enjoy!`, "order");
        } else if (data.status === "Shipped") {
           addNotification("Order Shipped! 🚚", `Your order #${data.orderId} is on its way.`, "order");
        }
        return;
      }
      await actor.updateOrderStatus(
        BigInt(data.orderId),
        data.status as BackendOrderStatus,
      );
      
      if (data.status === "Delivered") {
        addNotification("Package Delivered! 📦", `Your order #${data.orderId} has been delivered. Enjoy!`, "order");
      } else if (data.status === "Shipped") {
        addNotification("Order Shipped! 🚚", `Your order #${data.orderId} is on its way.`, "order");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      return data as Product;
    },
    onSuccess: (newProduct) => {
      qc.setQueryData<Product[]>(["products", undefined], (old = []) => {
        const id = `p${Date.now()}`;
        const p: Product = {
          id,
          name: newProduct.name || "New Product",
          description: newProduct.description || "",
          price: newProduct.price || 0,
          categoryId: newProduct.categoryId || "fruits",
          imageUrl: newProduct.imageUrl || "",
          stockQty: newProduct.stockQty || 0,
          rating: 0,
          reviewCount: 0,
          isActive: true,
          isFeatured: !!newProduct.isFeatured,
          isBestSeller: !!newProduct.isBestSeller,
          isNewArrival: !!newProduct.isNewArrival,
          createdAt: BigInt(Date.now()),
          ageRestricted: false,
          ageCategory: null,
        };
        return [p, ...old];
      });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string } & Partial<Product>) => {
      return data;
    },
    onSuccess: (updatedProduct) => {
      qc.setQueryData<Product[]>(["products", undefined], (old = []) => {
        return old.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p);
      });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteProduct(BigInt(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: Partial<Category>) => {
      if (!actor) throw new Error("Not connected");
      await actor.createCategory(
        data.name ?? "",
        BigInt(data.displayOrder ?? 0),
        data.iconEmoji ?? "🛒",
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: Partial<Coupon>) => {
      if (!actor) throw new Error("Not connected");
      await actor.createCoupon(
        data.code ?? "",
        data.discountType === "percentage"
          ? Variant_fixed_percent.percent
          : Variant_fixed_percent.fixed,
        BigInt(data.discountValue ?? 0),
        data.expirationDate ?? BigInt(0),
        BigInt(data.usageLimit ?? 100),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}

export function useApproveReview() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) return id;
      await actor.approveReview(BigInt(id));
    },
    onSuccess: (id) => {
      if (!actor) {
        qc.setQueryData<Review[]>(["admin-reviews", "pending"], (old = []) => old.filter(r => r.id !== id));
      }
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });
}

export function useRejectReview() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) return id;
      await actor.rejectReview(BigInt(id));
    },
    onSuccess: (id) => {
      if (!actor) {
        qc.setQueryData<Review[]>(["admin-reviews", "pending"], (old = []) => old.filter(r => r.id !== id));
      }
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });
}

// ─── Location / Delivery radius ──────────────────────────────────────────────

export type LocationCheckResult =
  | { tag: "InRange"; shopId: number; distanceKm: number; deliveryFee?: number }
  | { tag: "OutOfRange"; nearestDistanceKm: number };

// Default shop locations managed by admin — approximates Bangalore city centre
const SHOP_LOCATIONS = [
  { shopId: 1, lat: 12.9716, lng: 77.5946 }, // MG Road, Bangalore
];

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useSetUserLocation() {
  return useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      // Persisted locally; backend integration ready when setUserLocation is deployed
      localStorage.setItem("nexgro_user_lat", String(lat));
      localStorage.setItem("nexgro_user_lng", String(lng));
    },
  });
}

export function useCheckDeliveryRadius() {
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async ({
      lat,
      lng,
    }: { lat: number; lng: number }): Promise<LocationCheckResult> => {
      // 1. Get zones (either from actor or fallback)
      let activeZones: DeliveryZone[] = [];
      
      if (actor) {
        try {
          const fn = (actor as unknown as Record<string, unknown>).getDeliveryZones as (() => Promise<unknown>) | undefined;
          const result = await fn?.();
          if (Array.isArray(result)) {
            activeZones = (result as Array<Record<string, unknown>>).map(z => ({
              id: String(z.id ?? ""),
              name: String(z.name ?? ""),
              radiusKm: Number(z.radiusKm ?? 0),
              perKmFee: Number(z.perKmFee ?? z.baseFee ?? 0), // Handle both names during transition
              centerLat: Number(z.centerLat ?? 0),
              centerLng: Number(z.centerLng ?? 0),
              isActive: Boolean(z.isActive ?? true),
            })).filter(z => z.isActive);
          }
        } catch (err) {
          console.error("Failed to fetch zones for radius check", err);
        }
      }

      // Fallback to local storage if no active zones found in backend
      if (activeZones.length === 0) {
        activeZones = getZonesFromStorage().filter(z => z.isActive);
      }

      let nearestDistanceKm = Number.POSITIVE_INFINITY;
      let matchingZone: DeliveryZone | null = null;

      for (const zone of activeZones) {
        const dist = haversineKm(lat, lng, zone.centerLat, zone.centerLng);
        if (dist <= zone.radiusKm) {
          if (dist < nearestDistanceKm) {
            nearestDistanceKm = dist;
            matchingZone = zone;
          }
        } else {
          if (dist < nearestDistanceKm) {
            nearestDistanceKm = dist;
          }
        }
      }

      if (matchingZone) {
        // Calculate fee based on distance: distance * perKmFee
        const calculatedFee = nearestDistanceKm * matchingZone.perKmFee;
        
        return {
          tag: "InRange",
          shopId: 1, // Legacy compatibility
          distanceKm: nearestDistanceKm,
          deliveryFee: Math.max(calculatedFee, 1.00), // Minimum $1.00 delivery fee
        };
      }
      
      return { tag: "OutOfRange", nearestDistanceKm };
    },
  });
}

export function useUserLocation(): { lat: number | null; lng: number | null } {
  const lat = localStorage.getItem("nexgro_user_lat");
  const lng = localStorage.getItem("nexgro_user_lng");
  return {
    lat: lat ? Number.parseFloat(lat) : null,
    lng: lng ? Number.parseFloat(lng) : null,
  };
}

// ─── Wallet Transactions & Top-Up ─────────────────────────────────────────────

export interface WalletTransaction {
  id: string;
  type: "TopUp" | "Bonus" | "Redemption" | "Refund" | "AdminAdjust";
  amount: number;
  description: string;
  createdAt: bigint;
}

export function useWalletTransactions() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<WalletTransaction[]>({
    queryKey: ["wallet-transactions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .getWalletTransactions as (() => Promise<unknown>) | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return (result as Array<Record<string, unknown>>).map((t) => ({
          id: String(t.id ?? ""),
          type: String(
            t.txType ?? t.type ?? "TopUp",
          ) as WalletTransaction["type"],
          amount: Number(t.amount ?? 0) / 100,
          description: String(t.description ?? ""),
          createdAt: BigInt((t.createdAt as bigint) ?? 0),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useTopUpWallet() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (amountDollars: number) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>).topUpWallet as
          | ((a: bigint) => Promise<unknown>)
          | undefined;
        await fn?.(BigInt(Math.round(amountDollars * 100)));
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet-balance"] });
      qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}

// ─── Admin: Shop Locations ────────────────────────────────────────────────────

export interface ShopLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  deliveryFeeMultiplier: number;
}

export function useAdminShopLocations() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<ShopLocation[]>({
    queryKey: ["admin-shop-locations"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .getShopLocations as (() => Promise<unknown>) | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return (result as Array<Record<string, unknown>>).map((l) => ({
          id: String(l.id ?? ""),
          name: String(l.name ?? ""),
          latitude: Number(l.latitude ?? 0),
          longitude: Number(l.longitude ?? 0),
          radiusKm: Number(l.radiusKm ?? 10),
          deliveryFeeMultiplier: Number(l.deliveryFeeMultiplier ?? 1),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useAddShopLocation() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: Omit<ShopLocation, "id">) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .addShopLocation as
          | ((...a: unknown[]) => Promise<unknown>)
          | undefined;
        await fn?.(
          data.name,
          data.latitude,
          data.longitude,
          data.radiusKm,
          data.deliveryFeeMultiplier,
        );
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-shop-locations"] }),
  });
}

export function useUpdateShopLocation() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: ShopLocation) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .updateShopLocation as
          | ((...a: unknown[]) => Promise<unknown>)
          | undefined;
        await fn?.(
          data.id,
          data.name,
          data.latitude,
          data.longitude,
          data.radiusKm,
          data.deliveryFeeMultiplier,
        );
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-shop-locations"] }),
  });
}

export function useDeleteShopLocation() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .deleteShopLocation as ((id: string) => Promise<unknown>) | undefined;
        await fn?.(id);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-shop-locations"] }),
  });
}

// ─── Admin: Buy X Get Y ───────────────────────────────────────────────────────

export function useAdminBuyXGetYRules() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<BuyXGetYRule[]>({
    queryKey: ["admin-bxgy"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .getBuyXGetYRules as (() => Promise<unknown>) | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return (result as Array<Record<string, unknown>>).map((r) => ({
          id: String(r.id ?? ""),
          name: String(r.name ?? ""),
          productId: String(r.buyProductId ?? r.productId ?? ""),
          buyQty: Number(r.buyQty ?? 1),
          getQty: Number(r.getQty ?? 1),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useCreateBuyXGetYRule() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: Omit<BuyXGetYRule, "id">) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .createBuyXGetYRule as ((d: unknown) => Promise<unknown>) | undefined;
        await fn?.(data);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bxgy"] }),
  });
}

export function useUpdateBuyXGetYRule() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: BuyXGetYRule) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .updateBuyXGetYRule as ((d: unknown) => Promise<unknown>) | undefined;
        await fn?.(data);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bxgy"] }),
  });
}

export function useDeleteBuyXGetYRule() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .deleteBuyXGetYRule as ((id: string) => Promise<unknown>) | undefined;
        await fn?.(id);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bxgy"] }),
  });
}

// ─── Admin: Admin Bundles CRUD ────────────────────────────────────────────────

export interface AdminBundle {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  discountPercent: number;
  isActive: boolean;
}

export function useAdminBundles() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<AdminBundle[]>({
    queryKey: ["admin-bundles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>).getBundles as
          | (() => Promise<unknown>)
          | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return (result as Array<Record<string, unknown>>).map((b) => ({
          id: String(b.id ?? ""),
          name: String(b.name ?? ""),
          description: String(b.description ?? ""),
          productIds: Array.isArray(b.productIds)
            ? b.productIds.map(String)
            : [],
          discountPercent: Number(b.discountPercent ?? 0),
          isActive: Boolean(b.isActive ?? true),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useCreateBundle() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: Omit<AdminBundle, "id">) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>).createBundle as
          | ((d: unknown) => Promise<unknown>)
          | undefined;
        await fn?.(data);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bundles"] }),
  });
}

export function useUpdateBundle() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: AdminBundle) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>).updateBundle as
          | ((d: unknown) => Promise<unknown>)
          | undefined;
        await fn?.(data);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bundles"] }),
  });
}

export function useDeleteBundle() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>).deleteBundle as
          | ((id: string) => Promise<unknown>)
          | undefined;
        await fn?.(id);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bundles"] }),
  });
}

// ─── Admin: Seasonal Collections ─────────────────────────────────────────────

export function useAdminSeasonalCollections() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<SeasonalCollection[]>({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .getSeasonalCollections as (() => Promise<unknown>) | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return (result as Array<Record<string, unknown>>).map((c) => ({
          id: String(c.id ?? ""),
          name: String(c.name ?? ""),
          theme: String(c.theme ?? ""),
          productIds: Array.isArray(c.productIds)
            ? c.productIds.map(String)
            : [],
          startDate: String(c.startDate ?? ""),
          endDate: String(c.endDate ?? ""),
          badgeColor: String(c.badgeColor ?? "#16a34a"),
          isActive: Boolean(c.isActive ?? true),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useCreateSeasonalCollection() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: Omit<SeasonalCollection, "id">) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .createSeasonalCollection as
          | ((d: unknown) => Promise<unknown>)
          | undefined;
        await fn?.(data);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-collections"] }),
  });
}

export function useUpdateSeasonalCollection() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: SeasonalCollection) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .updateSeasonalCollection as
          | ((d: unknown) => Promise<unknown>)
          | undefined;
        await fn?.(data);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-collections"] }),
  });
}

export function useDeleteSeasonalCollection() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .deleteSeasonalCollection as
          | ((id: string) => Promise<unknown>)
          | undefined;
        await fn?.(id);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-collections"] }),
  });
}

// ─── Admin: Wallets ───────────────────────────────────────────────────────────

export interface AdminWallet {
  userId: string;
  userName: string;
  balance: number;
  totalTopUps: number;
}

export function useAdminWallets() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<AdminWallet[]>({
    queryKey: ["admin-wallets"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .adminGetAllWallets as (() => Promise<unknown>) | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return (result as Array<Record<string, unknown>>).map((w) => ({
          userId: String(w.userId ?? ""),
          userName: String(w.userName ?? ""),
          balance: Number(w.balance ?? 0) / 100,
          totalTopUps: Number(w.totalTopUps ?? 0) / 100,
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useAdminAdjustWallet() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: {
      userId: string;
      amount: number;
      reason: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .adminAdjustWallet as
          | ((...a: unknown[]) => Promise<unknown>)
          | undefined;
        await fn?.(
          data.userId,
          BigInt(Math.round(data.amount * 100)),
          data.reason,
        );
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-wallets"] }),
  });
}

export function useWalletBonusConfig() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<number>({
    queryKey: ["admin-wallet-bonus-config"],
    queryFn: async () => {
      if (!actor) return 10;
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .getWalletBonusConfig as (() => Promise<unknown>) | undefined;
        const result = await fn?.();
        return Number(result ?? 10);
      } catch {
        return 10;
      }
    },
    enabled: !!actor && !isFetching,
    initialData: 10,
  });
}

export function useUpdateWalletBonusConfig() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (bonusPercent: number) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .updateWalletBonusConfig as
          | ((p: number) => Promise<unknown>)
          | undefined;
        await fn?.(bonusPercent);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-wallets"] }),
  });
}

// ─── Admin: Chat Support ──────────────────────────────────────────────────────

export interface ChatThread {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  lastMessage: string;
  isResolved: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  text: string;
  createdAt: bigint;
}

export function useAdminChatThreads() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<ChatThread[]>({
    queryKey: ["admin-chat-threads"],
    queryFn: async () => {
      if (actor) {
        try {
          const fn = (actor as unknown as Record<string, unknown>)
            .getChatThreads as (() => Promise<unknown>) | undefined;
          const result = await fn?.();
          if (Array.isArray(result)) {
            return (result as Array<Record<string, unknown>>).map((t) => ({
              id: String(t.id ?? ""),
              userId: String(t.userId ?? ""),
              userName: String(t.userName ?? "User"),
              subject: String(t.subject ?? "Support"),
              lastMessage: String(t.lastMessage ?? ""),
              isResolved: Boolean(t.isResolved ?? false),
              createdAt: BigInt((t.createdAt as bigint) ?? 0),
              updatedAt: BigInt((t.updatedAt as bigint) ?? 0),
            }));
          }
        } catch {
          /* fallback */
        }
      }

      // Local storage fallback - Scan all keys for chat patterns
      const threads: ChatThread[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("nexgro_regular_chat_") || key.startsWith("nexgro_chat_"))) {
          try {
            const email = key.replace("nexgro_regular_chat_", "").replace("nexgro_chat_", "");
            const msgs = JSON.parse(localStorage.getItem(key) || "[]");
            
            if (Array.isArray(msgs) && msgs.length > 0) {
              const isAppeal = key.startsWith("nexgro_chat_");
              threads.push({
                id: key,
                userId: email,
                userName: isAppeal ? `${email.split('@')[0]} (Appeal)` : email.split('@')[0],
                subject: isAppeal ? "Banned Account Appeal" : "Support Request",
                lastMessage: msgs[msgs.length - 1].text,
                isResolved: false,
                createdAt: BigInt(msgs[0].timestamp || Date.now()),
                updatedAt: BigInt(msgs[msgs.length - 1].timestamp || Date.now()),
              });
            }
          } catch (e) {
            console.error("Error parsing chat key", key, e);
          }
        }
      }
      
      return threads.sort((a, b) => Number(b.updatedAt - a.updatedAt));
    },
    enabled: true,
    initialData: [],
    refetchInterval: 2000, 
  });
}

// ─── Admin: Banners ──────────────────────────────────────────────────────────

export function useAdminBanners() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Banner[]>({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>).getBanners as
          | (() => Promise<unknown>)
          | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return (result as Array<Record<string, unknown>>).map((b) => ({
          id: String(b.id ?? ""),
          title: String(b.title ?? ""),
          imageUrl: String(b.imageUrl ?? ""),
          link: String(b.link ?? ""),
          displayOrder: Number(b.displayOrder ?? 0),
          isActive: Boolean(b.isActive ?? true),
          createdAt: BigInt((b.createdAt as bigint) ?? 0),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: Omit<Banner, "id" | "createdAt">) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>).createBanner as
          | ((d: unknown) => Promise<unknown>)
          | undefined;
        await fn?.(data);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-banners"] }),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>).deleteBanner as
          | ((id: string) => Promise<unknown>)
          | undefined;
        await fn?.(id);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-banners"] }),
  });
}

// ─── Admin: Flash Deals ──────────────────────────────────────────────────────

export function useAdminFlashDeals() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<FlashDeal[]>({
    queryKey: ["admin-flash-deals"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .getFlashDeals as (() => Promise<unknown>) | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return (result as Array<Record<string, unknown>>).map((d) => ({
          id: String(d.id ?? ""),
          productId: String(d.productId ?? ""),
          discountPercent: Number(d.discountPercent ?? 0),
          startDateTime: BigInt((d.startDateTime as bigint) ?? 0),
          endDateTime: BigInt((d.endDateTime as bigint) ?? 0),
          isActive: Boolean(d.isActive ?? true),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useCreateFlashDeal() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: Omit<FlashDeal, "id">) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .createFlashDeal as ((d: unknown) => Promise<unknown>) | undefined;
        await fn?.(data);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-flash-deals"] }),
  });
}

export function useDeleteFlashDeal() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .deleteFlashDeal as ((id: string) => Promise<unknown>) | undefined;
        await fn?.(id);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-flash-deals"] }),
  });
}

// ─── Admin: Reviews Management ───────────────────────────────────────────────

export function useAdminReviews() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Review[]>({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>).getAllReviews as
          | (() => Promise<unknown>)
          | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return (result as Array<Record<string, unknown>>).map((r) => ({
          id: String(r.id ?? ""),
          productId: String(r.productId ?? ""),
          userId: String(r.userId ?? ""),
          userName: String(r.userName ?? "Anonymous"),
          rating: Number(r.rating ?? 0),
          title: String(r.title ?? ""),
          text: String(r.text ?? ""),
          isApproved: Boolean(r.isApproved ?? false),
          helpfulCount: Number(r.helpfulCount ?? 0),
          createdAt: BigInt((r.createdAt as bigint) ?? 0),
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useApproveReview() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>).approveReview as
          | ((id: string) => Promise<unknown>)
          | undefined;
        await fn?.(reviewId);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });
}

export function useRejectReview() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>).rejectReview as
          | ((id: string) => Promise<unknown>)
          | undefined;
        await fn?.(reviewId);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });
}

export function useGetThreadMessages(threadId: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", threadId],
    queryFn: async () => {
      if (actor && !threadId.startsWith("nexgro_")) {
        try {
          const fn = (actor as unknown as Record<string, unknown>)
            .getThreadMessages as ((id: string) => Promise<unknown>) | undefined;
          const result = await fn?.(threadId);
          if (Array.isArray(result)) {
            return (result as Array<Record<string, unknown>>).map((m: any) => ({
              id: String(m.id ?? ""),
              threadId: String(m.threadId ?? ""),
              senderId: String(m.senderId ?? ""),
              senderName: String(m.senderName ?? ""),
              isAdmin: Boolean(m.isAdmin ?? false),
              text: String(m.text ?? ""),
              createdAt: BigInt((m.createdAt as bigint) ?? 0),
            }));
          }
        } catch {
          /* fallback */
        }
      }
      if (threadId.startsWith("nexgro_")) {
        const msgs = JSON.parse(localStorage.getItem(threadId) || "[]");
        return msgs.map((m: any) => ({
          id: m.id,
          threadId: threadId,
          senderId: m.sender,
          senderName: m.sender === "user" ? "User" : "Admin",
          isAdmin: m.sender === "admin",
          text: m.text,
          createdAt: BigInt(m.timestamp),
        }));
      }

      return [];
    },
    enabled: !!threadId,
    initialData: [],
    refetchInterval: 2000,
  });
}

export function useAdminReplyToThread() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: { threadId: string; text: string }) => {
      if (actor && !data.threadId.startsWith("nexgro_")) {
        try {
          const fn = (actor as unknown as Record<string, unknown>)
            .adminReplyToThread as
            | ((...a: unknown[]) => Promise<unknown>)
            | undefined;
          await fn?.(data.threadId, data.text);
          return;
        } catch {
          /* fallback */
        }
      }

      if (data.threadId.startsWith("nexgro_")) {
        const msgs = JSON.parse(localStorage.getItem(data.threadId) || "[]");
        const reply = {
          id: Date.now().toString(),
          sender: "admin",
          text: data.text,
          timestamp: Date.now(),
        };
        localStorage.setItem(data.threadId, JSON.stringify([...msgs, reply]));
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["chat-messages", vars.threadId] });
      qc.invalidateQueries({ queryKey: ["admin-chat-threads"] });
    },
  });
}

export function useResolveThread() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (threadId: string) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .resolveThread as ((id: string) => Promise<unknown>) | undefined;
        await fn?.(threadId);
      } catch {
        /* graceful fallback */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-chat-threads"] }),
  });
}

// ─── Bundles ──────────────────────────────────────────────────────────────────

export function useBundles() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Bundle[]>({
    queryKey: ["bundles"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>).getBundles as
          | (() => Promise<unknown>)
          | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return result as Bundle[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useBundleById(id: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Bundle | null>({
    queryKey: ["bundle", id],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .getBundleById as ((id: bigint) => Promise<unknown>) | undefined;
        const result = await fn?.(BigInt(id));
        return (result as Bundle) ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
    initialData: null,
  });
}

// ─── Stock notifications ───────────────────────────────────────────────────────

export function useSubscribeStockNotification() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("Not connected");
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .subscribeToStockNotification as
          | ((id: bigint) => Promise<void>)
          | undefined;
        await fn?.(BigInt(productId));
      } catch {
        // silently succeed for demo — method may not yet be in backend
      }
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["stock-subscriptions"] }),
  });
}

export function useUserStockSubscriptions() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<StockSubscription[]>({
    queryKey: ["stock-subscriptions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const fn = (actor as unknown as Record<string, unknown>)
          .getUserStockSubscriptions as (() => Promise<unknown>) | undefined;
        const result = await fn?.();
        if (!Array.isArray(result)) return [];
        return result as StockSubscription[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

// ─── In-App Notifications ──────────────────────────────────────────────────────

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: "order" | "promo" | "stock" | "general";
  isRead: boolean;
  createdAt: number;
}

const LOCAL_NOTIF_KEY_V2 = "nexgro_in_app_notifs_v2";

export function addNotification(title: string, body: string, type: InAppNotification["type"] = "general") {
  try {
    const current = getNotificationsFromStorage();
    const newNotif: InAppNotification = {
      id: `n-${Date.now()}`,
      title,
      body,
      type,
      isRead: false,
      createdAt: Date.now(),
    };
    localStorage.setItem(LOCAL_NOTIF_KEY_V2, JSON.stringify([newNotif, ...current]));
    // Force a small delay then invalidate if possible, but this is a static helper
  } catch {
    /* noop */
  }
}

function getNotificationsFromStorage(): InAppNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIF_KEY_V2);
    if (raw) return JSON.parse(raw) as InAppNotification[];
  } catch {
    /* noop */
  }
  const seed: InAppNotification[] = [
    {
      id: "n1",
      title: "🎉 Welcome to NeXgro!",
      body: "Explore fresh deals and earn loyalty points on every order.",
      isRead: false,
      createdAt: Date.now() - 3600000,
      type: "general",
    },
    {
      id: "n2",
      title: "⚡ Flash Deal Alert",
      body: "Up to 40% off on Dairy & Eggs — today only!",
      isRead: false,
      createdAt: Date.now() - 1800000,
      type: "promo",
    },
    {
      id: "n3",
      title: "📦 Order Update",
      body: "Your order ORD-20240421-002 is out for delivery.",
      isRead: true,
      createdAt: Date.now() - 7200000,
      type: "order",
    },
  ];
  try {
    localStorage.setItem(LOCAL_NOTIF_KEY_V2, JSON.stringify(seed));
  } catch {
    /* noop */
  }
  return seed;
}

export function useInAppNotifications() {
  return useQuery<InAppNotification[]>({
    queryKey: ["in-app-notifications"],
    queryFn: () => getNotificationsFromStorage(),
    staleTime: 10000,
    initialData: [],
  });
}

export function useUnreadNotificationCount() {
  return useQuery<number>({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      getNotificationsFromStorage().filter((n) => !n.isRead).length,
    staleTime: 5000,
    initialData: 0,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const updated = getNotificationsFromStorage().map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );
      try {
        localStorage.setItem(LOCAL_NOTIF_KEY_V2, JSON.stringify(updated));
      } catch {
        /* noop */
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["in-app-notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-notification-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const updated = getNotificationsFromStorage().map((n) => ({
        ...n,
        isRead: true,
      }));
      try {
        localStorage.setItem(LOCAL_NOTIF_KEY_V2, JSON.stringify(updated));
      } catch {
        /* noop */
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["in-app-notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-notification-count"] });
    },
  });
}

// ─── Chat widget (customer-facing, local store) ───────────────────────────────

export interface SupportChatMessage {
  id: string;
  text: string;
  sender: "user" | "admin";
  timestamp: number;
}

const LOCAL_SUPPORT_CHAT_KEY = "nexgro_support_chat_v2";

function getSupportChat(email: string): SupportChatMessage[] {
  try {
    const key = `nexgro_regular_chat_${email.toLowerCase()}`;
    const raw = localStorage.getItem(key);
    return raw
      ? (JSON.parse(raw) as SupportChatMessage[])
      : [
          {
            id: "init-1",
            text: "👋 Hi there! Welcome to NeXgro Support. How can we help you today?",
            sender: "admin",
            timestamp: Date.now() - 60000,
          },
        ];
  } catch {
    return [];
  }
}

function saveSupportChat(email: string, msgs: SupportChatMessage[]) {
  try {
    const key = `nexgro_regular_chat_${email.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(msgs));
    
    // Register in active chats
    const active = JSON.parse(localStorage.getItem("nexgro_active_chats") || "[]");
    if (!active.includes(email)) {
      localStorage.setItem("nexgro_active_chats", JSON.stringify([...active, email]));
    }
  } catch {
    /* noop */
  }
}

export function useGetChatMessages() {
  const { actor } = useBackendActor();
  const userEmail = localStorage.getItem("currentUserEmail") || "Guest";
  
  return useQuery<SupportChatMessage[]>({
    queryKey: ["support-chat-messages", userEmail],
    queryFn: async () => {
      if (actor) {
        try {
          const result = await actor.getChatMessages();
          if (result && result.length > 0) {
            return result.map((m: any) => ({
              id: String(m.id),
              text: m.text,
              sender: "user" in m.sender ? "user" : "admin",
              timestamp: Number(m.createdAt) / 1000000,
            }));
          }
        } catch (err) {
           /* fallback */
        }
      }
      return getSupportChat(userEmail);
    },
    staleTime: 0,
    initialData: [],
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  const userEmail = localStorage.getItem("currentUserEmail") || "Guest";

  return useMutation({
    mutationFn: async (text: string) => {
      if (actor) {
        try {
          await actor.sendChatMessage(text);
          return text;
        } catch(e) {
          /* fallback */
        }
      }
      
      const msgs = getSupportChat(userEmail);
      const userMsg: SupportChatMessage = {
        id: `msg-${Date.now()}`,
        text,
        sender: "user",
        timestamp: Date.now(),
      };
      saveSupportChat(userEmail, [...msgs, userMsg]);
      
      // Fake Admin Reply for Demo
      const REPLIES = [
        "Thanks for reaching out! Our team will get back to you shortly. 😊",
        "We've received your message and will respond within 24 hours.",
        "Got it! If this is urgent, please email us at nexgrostore@gmail.com.",
      ];
      setTimeout(() => {
        const reply: SupportChatMessage = {
          id: `msg-${Date.now() + 1}`,
          text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
          sender: "admin",
          timestamp: Date.now() + 1200,
        };
        const currentMsgs = getSupportChat(userEmail);
        saveSupportChat(userEmail, [...currentMsgs, reply]);
        qc.invalidateQueries({ queryKey: ["support-chat-messages", userEmail] });
        qc.invalidateQueries({ queryKey: ["admin-chat-threads"] });
      }, 2000);
      
      return text;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-chat-messages", userEmail] });
      qc.invalidateQueries({ queryKey: ["admin-chat-threads"] });
    },
  });
}

// ─── Recipes (static fallback — backend not yet deployed) ─────────────────────

import type {
  PriceDropAlert,
  Recipe,
  SubscriptionPlan,
  UserPreferences,
  UserSubscription,
} from "@/types";

const STATIC_RECIPES: Recipe[] = [
  {
    id: "r1",
    name: "Avocado & Tomato Toast",
    imageUrl:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&q=80",
    cookTimeMinutes: 10,
    servings: 2,
    ingredients: [
      { productId: "p2", quantity: 2, unit: "avocados" },
      { productId: "p6", quantity: 2, unit: "slices" },
      { productId: "p1", quantity: 1, unit: "tomato" },
    ],
  },
  {
    id: "r2",
    name: "Greek Yogurt Parfait",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
    cookTimeMinutes: 5,
    servings: 1,
    ingredients: [
      { productId: "p5", quantity: 1, unit: "cup" },
      { productId: "p7", quantity: 2, unit: "tbsp" },
    ],
  },
  {
    id: "r3",
    name: "Masala Omelette",
    imageUrl: "https://images.unsplash.com/photo-1510629954389-c1e0da47d415?w=400&q=80",
    cookTimeMinutes: 15,
    servings: 1,
    ingredients: [
      { productId: "p11", quantity: 2, unit: "eggs" },
      { productId: "p1", quantity: 1, unit: "onion" },
      { productId: "p13", quantity: 1, unit: "chilli" },
    ],
  },
  {
    id: "r4",
    name: "Paneer Tikka Salad",
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80",
    cookTimeMinutes: 20,
    servings: 2,
    ingredients: [
      { productId: "p14", quantity: 200, unit: "grams" },
      { productId: "p1", quantity: 1, unit: "capsicum" },
      { productId: "p5", quantity: 0.5, unit: "cup" },
    ],
  },
  {
    id: "r5",
    name: "Classic Pancakes",
    imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=400&q=80",
    cookTimeMinutes: 25,
    servings: 3,
    ingredients: [
      { productId: "p4", quantity: 1, unit: "litre" },
      { productId: "p11", quantity: 2, unit: "eggs" },
      { productId: "p15", quantity: 2, unit: "cups" },
    ],
  },
  {
    id: "r6",
    name: "Berry Smoothie Bowl",
    imageUrl: "https://images.unsplash.com/photo-1490474418175-01997206c111?w=400&q=80",
    cookTimeMinutes: 10,
    servings: 1,
    ingredients: [
      { productId: "p16", quantity: 1, unit: "cup" },
      { productId: "p5", quantity: 1, unit: "cup" },
      { productId: "p7", quantity: 1, unit: "tbsp" },
    ],
  },
];

export function useRecipes() {
  return useQuery<Recipe[]>({
    queryKey: ["recipes"],
    queryFn: async () => STATIC_RECIPES,
    initialData: STATIC_RECIPES,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecipeById(id: string) {
  return useQuery<Recipe | null>({
    queryKey: ["recipe", id],
    queryFn: async () => STATIC_RECIPES.find((r) => r.id === id) ?? null,
    enabled: !!id,
    initialData: null,
  });
}

// ─── Subscription Plans (static fallback) ────────────────────────────────────

const STATIC_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "sp1",
    name: "Weekly Essentials",
    description: "Fresh staples every week",
    frequency: "weekly",
    pricePerCycle: 24.99,
    isActive: true,
    items: [
      { productId: "p4", quantity: 2 },
      { productId: "p9", quantity: 1 },
    ],
  },
  {
    id: "sp2",
    name: "Monthly Family Pack",
    description: "A full month of groceries for the whole family",
    frequency: "monthly",
    pricePerCycle: 89.99,
    isActive: true,
    items: [
      { productId: "p4", quantity: 8 },
      { productId: "p9", quantity: 4 },
    ],
  },
];

export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: async () => STATIC_SUBSCRIPTION_PLANS,
    initialData: STATIC_SUBSCRIPTION_PLANS,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserSubscriptions() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<UserSubscription[]>({
    queryKey: ["user-subscriptions"],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
    initialData: [],
  });
}

export function useSubscribeToPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_planId: string) => {
      // Subscription management handled locally for now
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-subscriptions"] }),
  });
}

export function useUnsubscribeFromPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_planId: string) => {
      // Subscription cancellation handled locally for now
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-subscriptions"] }),
  });
}

// ─── User Preferences ─────────────────────────────────────────────────────────

const PREFS_KEY = "nexgro-user-prefs";

function getPrefsFromStorage(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw) as UserPreferences;
  } catch {
    /* noop */
  }
  return { language: "en", darkMode: false };
}

export function useUserPreferences() {
  return useQuery<UserPreferences>({
    queryKey: ["user-preferences"],
    queryFn: () => getPrefsFromStorage(),
    staleTime: 0,
    initialData: { language: "en", darkMode: false },
  });
}

export function useUpdateUserPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Partial<UserPreferences>) => {
      const current = getPrefsFromStorage();
      const updated = { ...current, ...prefs };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
      } catch {
        /* noop */
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-preferences"] }),
  });
}

// ─── Price Drop Alerts (static fallback) ──────────────────────────────────────

export function usePriceDropAlerts() {
  return useQuery<PriceDropAlert[]>({
    queryKey: ["price-drop-alerts"],
    queryFn: async () => [
      {
        productId: "p5",
        originalPrice: 5.49,
        newPrice: 4.49,
        createdAt: new Date().toISOString(),
      },
      {
        productId: "p7",
        originalPrice: 8.99,
        newPrice: 7.99,
        createdAt: new Date().toISOString(),
      },
    ],
    staleTime: 5 * 60 * 1000,
    initialData: [],
  });
}

// ─── Get Products by IDs ──────────────────────────────────────────────────────

export function useGetProductsByIds(ids: string[]) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Product[]>({
    queryKey: ["products-by-ids", ids],
    queryFn: async () => {
      if (!actor || ids.length === 0) return [];
      const results = await Promise.all(
        ids.map((id) => actor.getProductById(BigInt(id))),
      );
      return results
        .filter(
          (p): p is NonNullable<typeof p> => p !== null && p !== undefined,
        )
        .map(adaptProduct);
    },
    enabled: !!actor && !isFetching && ids.length > 0,
    initialData: [],
  });
}
// ─── Referrals ──────────────────────────────────────────────────────────────

export function useReferrals() {
  return useQuery<Referral[]>({
    queryKey: ["referrals"],
    queryFn: async () => [],
    initialData: [],
  });
}

// ─── Chat ───────────────────────────────────────────────────────────────────

export function useChatThreads() {
  return useQuery<ChatThread[]>({
    queryKey: ["chat-threads"],
    queryFn: async () => [
      {
        id: "t1",
        userId: "u1",
        userName: "Arjun Sharma",
        subject: "Order #123 missing item",
        lastMessage: "Which item was it?",
        isResolved: false,
        createdAt: BigInt(Date.now() - 7200000),
        updatedAt: BigInt(Date.now() - 3600000),
      },
    ],
    initialData: [],
  });
}

export function useChatMessages(threadId: string) {
  return useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", threadId],
    queryFn: async () => [
      {
        id: "m1",
        threadId,
        senderId: "u1",
        senderName: "Demo User",
        isAdmin: false,
        text: "Hi, I missed one item in my order.",
        createdAt: BigInt(Date.now() - 3700000),
      },
      {
        id: "m2",
        threadId,
        senderId: "admin",
        senderName: "Support",
        isAdmin: true,
        text: "Sorry to hear that! Which item was it?",
        createdAt: BigInt(Date.now() - 3600000),
      },
    ],
    enabled: !!threadId,
    initialData: [],
  });
}

// ─── Delivery ───────────────────────────────────────────────────────────────

export function useShopLocations() {
  return useQuery<ShopLocation[]>({
    queryKey: ["shop-locations"],
    queryFn: async () => [
      {
        id: "l1",
        name: "Main Warehouse",
        latitude: 28.6139,
        longitude: 77.209,
        radiusKm: 10,
        deliveryFeeMultiplier: 1.0,
      },
    ],
    initialData: [],
  });
}

// ─── Delivery Zones Storage ──────────────────────────────────────────────────
const ZONES_KEY = "nexgro-delivery-zones";

function getZonesFromStorage(): DeliveryZone[] {
  try {
    const raw = localStorage.getItem(ZONES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: "z1",
      name: "Downtown Bangalore",
      radiusKm: 10,
      perKmFee: 0.50, // $0.50 per KM
      centerLat: 12.9716,
      centerLng: 77.5946,
      isActive: true,
    },
  ];
}

export function useDeliveryZones() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<DeliveryZone[]>({
    queryKey: ["delivery-zones"],
    queryFn: async () => {
      if (!actor) return getZonesFromStorage();
      try {
        const fn = (actor as unknown as Record<string, unknown>).getDeliveryZones as (() => Promise<unknown>) | undefined;
        const result = await fn?.();
        if (!Array.isArray(result) || result.length === 0) return getZonesFromStorage();
        return (result as Array<Record<string, unknown>>).map(z => ({
          id: String(z.id ?? ""),
          name: String(z.name ?? ""),
          radiusKm: Number(z.radiusKm ?? 0),
          perKmFee: Number(z.perKmFee ?? z.baseFee ?? 0),
          centerLat: Number(z.centerLat ?? 0),
          centerLng: Number(z.centerLng ?? 0),
          isActive: Boolean(z.isActive ?? true),
        }));
      } catch {
        return getZonesFromStorage();
      }
    },
    enabled: true,
    initialData: [],
  });
}

export function useCreateDeliveryZone() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: Omit<DeliveryZone, "id">) => {
      if (actor) {
        try {
          const fn = (actor as unknown as Record<string, unknown>).createDeliveryZone as ((...a: unknown[]) => Promise<unknown>) | undefined;
          await fn?.(data.name, data.radiusKm, data.perKmFee, data.centerLat, data.centerLng);
        } catch {}
      }
      
      // Always save to local storage as fallback/shadow
      const current = getZonesFromStorage();
      const newZone = { ...data, id: `z-${Date.now()}` };
      localStorage.setItem(ZONES_KEY, JSON.stringify([...current, newZone]));
      return newZone;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery-zones"] }),
  });
}

export function useUpdateDeliveryZone() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (data: DeliveryZone) => {
      if (actor) {
        try {
          const fn = (actor as unknown as Record<string, unknown>).updateDeliveryZone as ((...a: unknown[]) => Promise<unknown>) | undefined;
          await fn?.(data.id, data.name, data.radiusKm, data.perKmFee, data.centerLat, data.centerLng, data.isActive);
        } catch {}
      }
      
      const current = getZonesFromStorage();
      const updated = current.map(z => z.id === data.id ? data : z);
      localStorage.setItem(ZONES_KEY, JSON.stringify(updated));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery-zones"] }),
  });
}

export function useDeleteDeliveryZone() {
  const qc = useQueryClient();
  const { actor } = useBackendActor();
  return useMutation({
    mutationFn: async (id: string) => {
      if (actor) {
        try {
          const fn = (actor as unknown as Record<string, unknown>).deleteDeliveryZone as ((id: string) => Promise<unknown>) | undefined;
          await fn?.(id);
        } catch {}
      }
      
      const current = getZonesFromStorage();
      const updated = current.filter(z => z.id !== id);
      localStorage.setItem(ZONES_KEY, JSON.stringify(updated));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery-zones"] }),
  });
}

// ─── Meal Planner ────────────────────────────────────────────────────────────

export function useMealPlans() {
  return useQuery<MealPlan[]>({
    queryKey: ["meal-plans"],
    queryFn: async () => [
      {
        id: "mp1",
        userId: "u1",
        recipeId: "r1",
        plannedDate: new Date().toISOString().split("T")[0],
        servings: 2,
      },
      {
        id: "mp2",
        userId: "u1",
        recipeId: "r3",
        plannedDate: new Date().toISOString().split("T")[0],
        servings: 1,
      },
      {
        id: "mp3",
        userId: "u1",
        recipeId: "r4",
        plannedDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        servings: 2,
      },
    ],
    initialData: [],
  });
}

// ─── Admin Tools ──────────────────────────────────────────────────────────────

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  createdAt: bigint;
}

export interface PromoContent {
  id: string;
  type: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  startDate: bigint;
  endDate: bigint;
}

// ─── Admin Tools ──────────────────────────────────────────────────────────────

export function useInventoryAlerts() {
  return useQuery<InventoryAlert[]>({
    queryKey: ["inventory-alerts"],
    queryFn: async () => [
      {
        id: "ia1",
        productId: "p6",
        productName: "Sourdough Loaf",
        currentStock: 5,
        threshold: 10,
        createdAt: BigInt(Date.now() - 86400000),
      },
    ],
    initialData: [],
  });
}

export function usePromoContent() {
  return useQuery<PromoContent[]>({
    queryKey: ["promo-content"],
    queryFn: async () => [
      {
        id: "pc1",
        type: "banner",
        title: "Summer Sale",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e",
        isActive: true,
        startDate: BigInt(Date.now() - 86400000),
        endDate: BigInt(Date.now() + 86400000 * 7),
      },
    ],
    initialData: [],
  });
}


