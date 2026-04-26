// NeXgro — Shared TypeScript types mirroring all backend data models

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";
export type UserRole = "customer" | "admin";
export type DiscountType = "percentage" | "fixed";
export type Language = "en" | "hi" | "ta";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  loyaltyBalance: number;
  walletBalance: number;
  referralCode: string;
  referredBy?: string;
  totalReferralEarnings: number;
  cancellationCount: number;
  isBanned: boolean;
  pendingFees: number;
  createdAt: bigint;
}

export interface SavedAddress {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
  label: string;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  pointsChange: number;
  reason: string;
  orderId?: string;
  createdAt: bigint;
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  iconEmoji: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  stockQty: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  createdAt: bigint;
  ageRestricted: boolean;
  ageCategory: string | null;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  text: string;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: bigint;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  link: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: bigint;
}

export interface FlashDeal {
  id: string;
  productId: string;
  product?: Product;
  discountPercent: number;
  startDateTime: bigint;
  endDateTime: bigint;
  isActive: boolean;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  searchQuery?: string;
  onlyActive?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: bigint;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  couponId?: string;
  loyaltyPointsRedeemed: number;
  deliveryAddress: SavedAddress;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  paymentMethod: "COD" | "Online";
  paymentStatus: "Paid" | "Pending" | "Refunded";
  createdAt: bigint;
  estimatedDelivery?: bigint;
}

export interface CartItem {
  userId: string;
  productId: string;
  product?: Product;
  quantity: number;
  addedAt: bigint;
  substituteProductId?: string;
}

export interface BundleProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  discountPercent: number;
  isActive: boolean;
  createdAt: bigint;
  products: BundleProduct[];
}

export interface StockSubscription {
  productId: string;
  userId: string;
  createdAt: bigint;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expirationDate: bigint;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
}

export interface WishlistItem {
  userId: string;
  productId: string;
  product?: Product;
  addedAt: bigint;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  lowStockAlerts: number;
  pendingOrders: number;
  pendingReviews: number;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export interface ApiResult {
  success: boolean;
  error?: string;
}

export interface SeasonalCollection {
  id: string;
  name: string;
  theme: string;
  badgeColor: string;
  productIds: string[];
  startDate: string;
  endDate: string;
}

export interface BuyXGetYRule {
  id: string;
  productId: string;
  buyQty: number;
  getQty: number;
  name: string;
}

// ─── New types for recipes, subscriptions, comparison, preferences ─────────────

export interface RecipeIngredient {
  productId: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  imageUrl: string;
  cookTimeMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
}

export interface SubscriptionPlanItem {
  productId: string;
  quantity: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  items: SubscriptionPlanItem[];
  pricePerCycle: number;
  frequency: "weekly" | "monthly";
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  nextDeliveryDate: string;
  isActive: boolean;
}

export interface UserPreferences {
  language: Language;
  darkMode: boolean;
}

export interface PriceDropAlert {
  productId: string;
  originalPrice: number;
  newPrice: number;
  createdAt: string;
}

export interface ComparisonProduct {
  productId: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  createdAt: bigint;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredEmail: string;
  status: "pending" | "completed";
  rewardAmount: number;
  createdAt: bigint;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: UserRole;
  text: string;
  createdAt: bigint;
}

export interface ChatThread {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  status: "open" | "resolved";
  lastMessageAt: bigint;
}

export interface DeliveryZone {
  id: string;
  name: string;
  radiusKm: number;
  perKmFee: number;
  centerLat: number;
  centerLng: number;
  isActive: boolean;
}

export interface ShopLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  isActive: boolean;
}

export interface MealPlan {
  id: string;
  userId: string;
  recipeId: string;
  plannedDate: string; // ISO date
  servings: number;
}

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
  type: "banner" | "flash-deal" | "bundle";
  title: string;
  imageUrl: string;
  isActive: boolean;
  startDate: bigint;
  endDate: bigint;
}

// Sample data constants used across pages
export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: "fruits",
    name: "Fruits & Vegetables",
    displayOrder: 1,
    isActive: true,
    iconEmoji: "🥦",
  },
  {
    id: "dairy",
    name: "Dairy & Eggs",
    displayOrder: 2,
    isActive: true,
    iconEmoji: "🥛",
  },
  {
    id: "bakery",
    name: "Bakery & Bread",
    displayOrder: 3,
    isActive: true,
    iconEmoji: "🍞",
  },
  {
    id: "snacks",
    name: "Snacks & Munchies",
    displayOrder: 4,
    isActive: true,
    iconEmoji: "🍿",
  },
  {
    id: "beverages",
    name: "Beverages",
    displayOrder: 5,
    isActive: true,
    iconEmoji: "🧃",
  },
  {
    id: "frozen",
    name: "Frozen Foods",
    displayOrder: 6,
    isActive: true,
    iconEmoji: "🧊",
  },
  {
    id: "pantry",
    name: "Pantry & Staples",
    displayOrder: 7,
    isActive: true,
    iconEmoji: "🫙",
  },
  {
    id: "meat",
    name: "Meat & Seafood",
    displayOrder: 8,
    isActive: true,
    iconEmoji: "🍖",
  },
  {
    id: "personal",
    name: "Personal Care",
    displayOrder: 9,
    isActive: true,
    iconEmoji: "🧴",
  },
  {
    id: "household",
    name: "Household",
    displayOrder: 10,
    isActive: true,
    iconEmoji: "🏠",
  },
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Fresh Organic Tomatoes",
    description: "Vine-ripened organic tomatoes, pack of 6",
    price: 3.99,
    categoryId: "fruits",
    imageUrl:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80",
    stockQty: 42,
    rating: 4.5,
    reviewCount: 128,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p2",
    name: "Avocado Hass",
    description: "Ready-to-eat Hass avocados, pack of 3",
    price: 5.49,
    categoryId: "fruits",
    imageUrl:
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&q=80",
    stockQty: 30,
    rating: 4.7,
    reviewCount: 95,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p3",
    name: "Broccoli Crown",
    description: "Crisp fresh broccoli crown, approx 400g",
    price: 2.29,
    categoryId: "fruits",
    imageUrl:
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80",
    stockQty: 55,
    rating: 4.3,
    reviewCount: 67,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p4",
    name: "Whole Milk 1L",
    description: "Full-cream farm-fresh whole milk",
    price: 2.99,
    categoryId: "dairy",
    imageUrl:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
    stockQty: 80,
    rating: 4.6,
    reviewCount: 210,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p5",
    name: "Greek Yogurt 500g",
    description: "Creamy full-fat Greek yogurt, plain",
    price: 4.49,
    categoryId: "dairy",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
    stockQty: 48,
    rating: 4.8,
    reviewCount: 156,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p6",
    name: "Sourdough Loaf",
    description: "Artisan sourdough, slow fermented",
    price: 5.99,
    categoryId: "bakery",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    stockQty: 20,
    rating: 4.9,
    reviewCount: 89,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p7",
    name: "Mixed Nuts 200g",
    description: "Roasted mixed nuts — almonds, cashews, walnuts",
    price: 7.99,
    categoryId: "snacks",
    imageUrl:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80",
    stockQty: 65,
    rating: 4.4,
    reviewCount: 74,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p8",
    name: "Orange Juice 1L",
    description: "Freshly squeezed pure orange juice",
    price: 4.29,
    categoryId: "beverages",
    imageUrl:
      "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&q=80",
    stockQty: 38,
    rating: 4.5,
    reviewCount: 103,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p9",
    name: "Free-Range Eggs 12pk",
    description: "Farm fresh free-range eggs, dozen",
    price: 6.49,
    categoryId: "dairy",
    imageUrl:
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80",
    stockQty: 55,
    rating: 4.7,
    reviewCount: 188,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p10",
    name: "Baby Spinach 150g",
    description: "Tender baby spinach leaves, pre-washed",
    price: 3.49,
    categoryId: "fruits",
    imageUrl:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
    stockQty: 29,
    rating: 4.3,
    reviewCount: 51,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p11",
    name: "Cheddar Cheese 250g",
    description: "Mature cheddar, aged 12 months",
    price: 5.29,
    categoryId: "dairy",
    imageUrl:
      "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=400&q=80",
    stockQty: 42,
    rating: 4.6,
    reviewCount: 92,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p12",
    name: "Sparkling Water 6pk",
    description: "Natural mineral sparkling water, 500ml each",
    price: 5.99,
    categoryId: "beverages",
    imageUrl:
      "https://images.unsplash.com/photo-1598343175494-a895a73c49db?w=400&q=80",
    stockQty: 72,
    rating: 4.2,
    reviewCount: 44,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
];
