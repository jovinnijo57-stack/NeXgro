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
  // --- NEW VEGETABLES ---
  {
    id: "p13",
    name: "Potato",
    description: "Fresh farm potatoes, great for mashing or frying",
    price: 1.49,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
    stockQty: 100,
    rating: 4.6,
    reviewCount: 150,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p14",
    name: "Onion",
    description: "Red onions, essential for every kitchen",
    price: 0.99,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80",
    stockQty: 120,
    rating: 4.4,
    reviewCount: 85,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p15",
    name: "Carrot",
    description: "Sweet and crunchy organic carrots",
    price: 1.99,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1582515073490-dc8f2a2b9b7c?w=400&q=80",
    stockQty: 80,
    rating: 4.7,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p16",
    name: "Broccoli",
    description: "Fresh green broccoli heads",
    price: 2.49,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1584270354949-1c7c3b3f1c43?w=400&q=80",
    stockQty: 60,
    rating: 4.5,
    reviewCount: 30,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p17",
    name: "Cauliflower",
    description: "Large white cauliflower head",
    price: 2.99,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1604908176997-431a1d73c3c9?w=400&q=80",
    stockQty: 45,
    rating: 4.3,
    reviewCount: 22,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p18",
    name: "Capsicum",
    description: "Fresh green bell peppers",
    price: 1.29,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=80",
    stockQty: 70,
    rating: 4.6,
    reviewCount: 45,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p19",
    name: "Brinjal (Eggplant)",
    description: "Rich purple eggplants",
    price: 2.19,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1598514983318-2f64f8f2f2b6?w=400&q=80",
    stockQty: 50,
    rating: 4.2,
    reviewCount: 33,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p20",
    name: "Beetroot",
    description: "Deep red earthy beetroots",
    price: 1.79,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1604908554027-1d5e7c0b4c1a?w=400&q=80",
    stockQty: 40,
    rating: 4.5,
    reviewCount: 28,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p21",
    name: "Radish",
    description: "Crispy white radishes",
    price: 1.19,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1615486364073-8b5b0a9d1c4d?w=400&q=80",
    stockQty: 90,
    rating: 4.1,
    reviewCount: 15,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p22",
    name: "Pumpkin",
    description: "Sweet orange pumpkin, approx 2kg",
    price: 4.99,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=400&q=80",
    stockQty: 25,
    rating: 4.7,
    reviewCount: 12,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p23",
    name: "Bitter Gourd",
    description: "Healthy bitter gourds, medicinal properties",
    price: 2.39,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&q=80",
    stockQty: 35,
    rating: 4.0,
    reviewCount: 10,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p24",
    name: "Okra (Lady Finger)",
    description: "Fresh green okras",
    price: 2.59,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1592928308029-7c4f2b9b3e4d?w=400&q=80",
    stockQty: 65,
    rating: 4.4,
    reviewCount: 20,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p25",
    name: "Sweet Corn",
    description: "Golden sweet corn cobs",
    price: 1.29,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80",
    stockQty: 100,
    rating: 4.8,
    reviewCount: 50,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p26",
    name: "Zucchini",
    description: "Fresh green zucchinis",
    price: 2.29,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1598511728123-6e4c0b4c3f9a?w=400&q=80",
    stockQty: 40,
    rating: 4.3,
    reviewCount: 15,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p27",
    name: "Mushroom",
    description: "Button mushrooms, pack of 200g",
    price: 3.49,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=400&q=80",
    stockQty: 55,
    rating: 4.5,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p28",
    name: "Green Beans",
    description: "Tender green beans",
    price: 2.79,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&q=80",
    stockQty: 75,
    rating: 4.4,
    reviewCount: 25,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },

  // --- DAIRY & EGGS ---
  {
    id: "p29",
    name: "Butter",
    description: "Creamy salted butter, 500g",
    price: 5.99,
    categoryId: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80",
    stockQty: 40,
    rating: 4.8,
    reviewCount: 120,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p30",
    name: "Paneer",
    description: "Fresh cottage cheese, 200g",
    price: 4.29,
    categoryId: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1604908177522-472cb1c9c2a1?w=400&q=80",
    stockQty: 50,
    rating: 4.7,
    reviewCount: 85,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },

  // --- BAKERY & BREAD ---
  {
    id: "p31",
    name: "Brown Bread",
    description: "Healthy whole wheat brown bread",
    price: 3.49,
    categoryId: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80",
    stockQty: 35,
    rating: 4.5,
    reviewCount: 42,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p32",
    name: "Croissant",
    description: "Buttery flaky French croissant",
    price: 2.99,
    categoryId: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    stockQty: 25,
    rating: 4.9,
    reviewCount: 60,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },

  // --- SNACKS & MUNCHIES ---
  {
    id: "p33",
    name: "Chips",
    description: "Crispy potato chips, classic salted",
    price: 1.99,
    categoryId: "snacks",
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80",
    stockQty: 150,
    rating: 4.4,
    reviewCount: 200,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },

  // --- BEVERAGES ---
  {
    id: "p34",
    name: "Coffee",
    description: "Roasted coffee beans, premium blend",
    price: 12.99,
    categoryId: "beverages",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80",
    stockQty: 40,
    rating: 4.8,
    reviewCount: 95,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },

  // --- FROZEN FOODS ---
  {
    id: "p35",
    name: "Frozen Pizza",
    description: "Authentic wood-fired frozen pizza",
    price: 8.99,
    categoryId: "frozen",
    imageUrl: "https://images.unsplash.com/photo-1548365328-9f547fb0953c?w=400&q=80",
    stockQty: 30,
    rating: 4.3,
    reviewCount: 50,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },

  // --- PANTRY & STAPLES ---
  {
    id: "p36",
    name: "Rice",
    description: "Premium Basmati rice, 5kg",
    price: 14.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
    stockQty: 100,
    rating: 4.7,
    reviewCount: 180,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },

  // --- MEAT & SEAFOOD ---
  {
    id: "p37",
    name: "Chicken",
    description: "Fresh farm chicken, whole",
    price: 9.99,
    categoryId: "meat",
    imageUrl: "https://images.unsplash.com/photo-1604908177153-fb5b2c9b0a7f?w=400&q=80",
    stockQty: 40,
    rating: 4.6,
    reviewCount: 110,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },

  // --- PERSONAL CARE ---
  {
    id: "p38",
    name: "Shampoo",
    description: "Nourishing herbal shampoo, 400ml",
    price: 7.49,
    categoryId: "personal",
    imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80",
    stockQty: 60,
    rating: 4.5,
    reviewCount: 88,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },

  // --- HOUSEHOLD ---
  {
    id: "p39",
    name: "Detergent",
    description: "High-efficiency liquid detergent, 2L",
    price: 11.99,
    categoryId: "household",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    stockQty: 50,
    rating: 4.4,
    reviewCount: 65,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p40",
    name: "Cream",
    description: "Fresh heavy cream, 250ml",
    price: 3.29,
    categoryId: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1604908177225-3a4d7a8a7981?w=400&q=80",
    stockQty: 40,
    rating: 4.6,
    reviewCount: 30,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p41",
    name: "Buns",
    description: "Soft burger buns, pack of 4",
    price: 2.49,
    categoryId: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80",
    stockQty: 50,
    rating: 4.4,
    reviewCount: 25,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p42",
    name: "Donut",
    description: "Glazed chocolate donut",
    price: 1.99,
    categoryId: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
    stockQty: 30,
    rating: 4.8,
    reviewCount: 55,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p43",
    name: "Cookies",
    description: "Chocolate chip cookies, freshly baked",
    price: 4.99,
    categoryId: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80",
    stockQty: 45,
    rating: 4.7,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p44",
    name: "Popcorn",
    description: "Buttery movie-style popcorn, large bag",
    price: 3.99,
    categoryId: "snacks",
    imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&q=80",
    stockQty: 80,
    rating: 4.5,
    reviewCount: 60,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p45",
    name: "Nachos",
    description: "Tortilla chips with cheese dip",
    price: 5.49,
    categoryId: "snacks",
    imageUrl: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&q=80",
    stockQty: 40,
    rating: 4.6,
    reviewCount: 35,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p46",
    name: "Chocolate",
    description: "Premium dark chocolate bar",
    price: 2.99,
    categoryId: "snacks",
    imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&q=80",
    stockQty: 100,
    rating: 4.9,
    reviewCount: 120,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p47",
    name: "Biscuits",
    description: "Crispy digestives, pack of 2",
    price: 1.49,
    categoryId: "snacks",
    imageUrl: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400&q=80",
    stockQty: 200,
    rating: 4.3,
    reviewCount: 150,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p48",
    name: "Instant Noodles",
    description: "Spicy ramen noodles, pack of 5",
    price: 4.49,
    categoryId: "snacks",
    imageUrl: "https://images.unsplash.com/photo-1604908177423-7e0d37afb0db?w=400&q=80",
    stockQty: 120,
    rating: 4.7,
    reviewCount: 90,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p49",
    name: "Soft Drink",
    description: "Refreshing cola, 500ml",
    price: 1.99,
    categoryId: "beverages",
    imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&q=80",
    stockQty: 300,
    rating: 4.2,
    reviewCount: 500,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p50",
    name: "Juice",
    description: "100% pure apple juice",
    price: 3.99,
    categoryId: "beverages",
    imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80",
    stockQty: 80,
    rating: 4.5,
    reviewCount: 70,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p51",
    name: "Tea",
    description: "Assam black tea, 100 bags",
    price: 6.99,
    categoryId: "beverages",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80",
    stockQty: 60,
    rating: 4.7,
    reviewCount: 45,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p52",
    name: "Energy Drink",
    description: "Vitalizing energy boost, 250ml",
    price: 2.49,
    categoryId: "beverages",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-06c3c7b1b5f6?w=400&q=80",
    stockQty: 100,
    rating: 4.1,
    reviewCount: 30,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p53",
    name: "Frozen Peas",
    description: "Sweet garden peas, 500g",
    price: 2.29,
    categoryId: "frozen",
    imageUrl: "https://images.unsplash.com/photo-1582515073490-dc8f2a2b9b7c?w=400&q=80",
    stockQty: 70,
    rating: 4.6,
    reviewCount: 25,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p54",
    name: "Frozen Fries",
    description: "Crispy oven-ready fries, 1kg",
    price: 4.99,
    categoryId: "frozen",
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80",
    stockQty: 50,
    rating: 4.4,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p55",
    name: "Frozen Nuggets",
    description: "Chicken nuggets, pack of 20",
    price: 6.99,
    categoryId: "frozen",
    imageUrl: "https://images.unsplash.com/photo-1604908177331-5c0a5f87c1a1?w=400&q=80",
    stockQty: 40,
    rating: 4.5,
    reviewCount: 33,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p56",
    name: "Wheat Flour",
    description: "Whole wheat atta, 10kg",
    price: 12.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1604908177284-4d5d295df1c7?w=400&q=80",
    stockQty: 60,
    rating: 4.8,
    reviewCount: 150,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p57",
    name: "Sugar",
    description: "Refined white sugar, 2kg",
    price: 2.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
    stockQty: 100,
    rating: 4.4,
    reviewCount: 75,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p58",
    name: "Salt",
    description: "Iodized table salt, 1kg",
    price: 0.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1604908177227-42fbaa2af9c3?w=400&q=80",
    stockQty: 200,
    rating: 4.6,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p59",
    name: "Cooking Oil",
    description: "Sunflower oil, 1L",
    price: 3.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1604908177211-1c6d6f6a8b1c?w=400&q=80",
    stockQty: 80,
    rating: 4.5,
    reviewCount: 65,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p60",
    name: "Spices",
    description: "Assorted Indian spices mix",
    price: 5.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&q=80",
    stockQty: 40,
    rating: 4.9,
    reviewCount: 120,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p61",
    name: "Ketchup",
    description: "Tangy tomato ketchup, 500g",
    price: 2.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1604908177200-3bb7a64ec16a?w=400&q=80",
    stockQty: 75,
    rating: 4.3,
    reviewCount: 50,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p62",
    name: "Fish",
    description: "Fresh sea bass, 500g",
    price: 12.49,
    categoryId: "meat",
    imageUrl: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&q=80",
    stockQty: 20,
    rating: 4.8,
    reviewCount: 45,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p63",
    name: "Mutton",
    description: "Tender goat meat, 1kg",
    price: 18.99,
    categoryId: "meat",
    imageUrl: "https://images.unsplash.com/photo-1604908177343-4c5c8e0f3996?w=400&q=80",
    stockQty: 15,
    rating: 4.7,
    reviewCount: 60,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p64",
    name: "Prawns",
    description: "Jumbo tiger prawns, 500g",
    price: 15.99,
    categoryId: "meat",
    imageUrl: "https://images.unsplash.com/photo-1565680018434-b513d8e5fd47?w=400&q=80",
    stockQty: 25,
    rating: 4.9,
    reviewCount: 30,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p65",
    name: "Sausage",
    description: "Smoked chicken sausages, pack of 6",
    price: 6.49,
    categoryId: "meat",
    imageUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80",
    stockQty: 35,
    rating: 4.4,
    reviewCount: 20,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p66",
    name: "Soap",
    description: "Gentle moisturizing soap, pack of 3",
    price: 4.99,
    categoryId: "personal",
    imageUrl: "https://images.unsplash.com/photo-1588776814546-ec7e7d5f1b0a?w=400&q=80",
    stockQty: 80,
    rating: 4.5,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p67",
    name: "Toothpaste",
    description: "Whitening fluoride toothpaste",
    price: 3.49,
    categoryId: "personal",
    imageUrl: "https://images.unsplash.com/photo-1588776814546-ec7e7d5f1b0a?w=400&q=80",
    stockQty: 100,
    rating: 4.6,
    reviewCount: 55,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p68",
    name: "Perfume",
    description: "Floral eau de parfum, 50ml",
    price: 24.99,
    categoryId: "personal",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80",
    stockQty: 20,
    rating: 4.8,
    reviewCount: 15,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p69",
    name: "Deodorant",
    description: "24h protection spray",
    price: 5.49,
    categoryId: "personal",
    imageUrl: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba3?w=400&q=80",
    stockQty: 60,
    rating: 4.4,
    reviewCount: 30,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p70",
    name: "Dishwash",
    description: "Tough on grease liquid dishwash",
    price: 2.99,
    categoryId: "household",
    imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80",
    stockQty: 100,
    rating: 4.5,
    reviewCount: 70,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p71",
    name: "Floor Cleaner",
    description: "Disinfectant floral floor cleaner",
    price: 4.49,
    categoryId: "household",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    stockQty: 50,
    rating: 4.6,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p72",
    name: "Tissue Paper",
    description: "Soft 2-ply tissues, pack of 4",
    price: 3.99,
    categoryId: "household",
    imageUrl: "https://images.unsplash.com/photo-1588776814546-ec7e7d5f1b0a?w=400&q=80",
    stockQty: 120,
    rating: 4.7,
    reviewCount: 80,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p73",
    name: "Garbage Bags",
    description: "Eco-friendly biodegradable bags",
    price: 5.99,
    categoryId: "household",
    imageUrl: "https://images.unsplash.com/photo-1604908177244-1b2b5c8a5c2b?w=400&q=80",
    stockQty: 100,
    rating: 4.5,
    reviewCount: 35,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  // --- ADDITIONAL VEGETABLES ---
  {
    id: "p74",
    name: "Cabbage",
    description: "Fresh green cabbage, approx 1kg",
    price: 1.29,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1594282486512-ad58f49a14d4?w=400&q=80",
    stockQty: 90,
    rating: 4.4,
    reviewCount: 45,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p75",
    name: "Green Peas",
    description: "Freshly shelled green peas, 500g",
    price: 2.99,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1592394533824-9440e5d68530?w=400&q=80",
    stockQty: 60,
    rating: 4.7,
    reviewCount: 30,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  // --- ADDITIONAL FRUITS ---
  {
    id: "p76",
    name: "Royal Gala Apples",
    description: "Sweet and crunchy Gala apples, 1kg",
    price: 4.99,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?w=400&q=80",
    stockQty: 100,
    rating: 4.8,
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
    id: "p77",
    name: "Cavendish Bananas",
    description: "Ripe bananas, bunch of 6",
    price: 2.49,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ad9b5886479b?w=400&q=80",
    stockQty: 150,
    rating: 4.6,
    reviewCount: 340,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p78",
    name: "Alphonso Mango",
    description: "Premium Alphonso mangoes, pack of 2",
    price: 8.99,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80",
    stockQty: 40,
    rating: 4.9,
    reviewCount: 156,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p79",
    name: "Seedless Grapes",
    description: "Sweet green seedless grapes, 500g",
    price: 5.49,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1537084642907-629340c7e59c?w=400&q=80",
    stockQty: 75,
    rating: 4.5,
    reviewCount: 88,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p80",
    name: "Fresh Pineapple",
    description: "Whole crown pineapple, sweet and juicy",
    price: 4.29,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1550258114-189f39308311?w=400&q=80",
    stockQty: 30,
    rating: 4.3,
    reviewCount: 52,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p81",
    name: "Watermelon",
    description: "Large seedless watermelon, approx 5kg",
    price: 6.99,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80",
    stockQty: 25,
    rating: 4.7,
    reviewCount: 120,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p82",
    name: "Kiwi Fruit",
    description: "Zesty kiwi fruits, pack of 4",
    price: 3.99,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1585059895524-72359e061381?w=400&q=80",
    stockQty: 50,
    rating: 4.4,
    reviewCount: 42,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p83",
    name: "Fresh Strawberries",
    description: "Sweet garden strawberries, 250g punnet",
    price: 4.49,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80",
    stockQty: 40,
    rating: 4.8,
    reviewCount: 95,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  // --- ADDITIONAL DAIRY ---
  {
    id: "p84",
    name: "Pure Ghee 500ml",
    description: "Traditional cow ghee, rich aroma",
    price: 14.99,
    categoryId: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&q=80",
    stockQty: 45,
    rating: 4.9,
    reviewCount: 320,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p85",
    name: "Salted Butter 200g",
    description: "Creamy table butter",
    price: 3.49,
    categoryId: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1589927946927-142fbaa2af9c?w=400&q=80",
    stockQty: 80,
    rating: 4.7,
    reviewCount: 150,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  // --- ADDITIONAL BAKERY ---
  {
    id: "p86",
    name: "Whole Wheat Bun 4pk",
    description: "Freshly baked healthy wheat buns",
    price: 2.29,
    categoryId: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    stockQty: 40,
    rating: 4.5,
    reviewCount: 65,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p87",
    name: "Chocolate Fudge Cake",
    description: "Decadent chocolate cake, 500g",
    price: 12.99,
    categoryId: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
    stockQty: 15,
    rating: 4.9,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p88",
    name: "Urad Dal",
    description: "Premium split black gram, 1kg",
    price: 4.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1585914966076-7649e3e78a2e?w=400&q=80",
    stockQty: 50,
    rating: 4.7,
    reviewCount: 30,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p89",
    name: "Moong Dal",
    description: "Split yellow moong dal, 1kg",
    price: 4.29,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1585914966076-7649e3e78a2e?w=400&q=80",
    stockQty: 50,
    rating: 4.6,
    reviewCount: 25,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p90",
    name: "Rava (Semolina)",
    description: "Fine quality semolina, 1kg",
    price: 2.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=400&q=80",
    stockQty: 40,
    rating: 4.5,
    reviewCount: 20,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p91",
    name: "Poha",
    description: "Flattened rice, thick, 500g",
    price: 1.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=400&q=80",
    stockQty: 60,
    rating: 4.4,
    reviewCount: 15,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p92",
    name: "Rice Flour",
    description: "Fine roasted rice flour, 1kg",
    price: 2.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=400&q=80",
    stockQty: 40,
    rating: 4.6,
    reviewCount: 10,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p93",
    name: "Grated Coconut",
    description: "Freshly grated coconut, 200g",
    price: 3.29,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1548510318-9c50ef74c6ca?w=400&q=80",
    stockQty: 30,
    rating: 4.8,
    reviewCount: 20,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p94",
    name: "Yeast",
    description: "Instant dry yeast, 50g",
    price: 1.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1604908177244-1b2b5c8a5c2b?w=400&q=80",
    stockQty: 100,
    rating: 4.5,
    reviewCount: 5,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p95",
    name: "Maple Syrup",
    description: "Pure Canadian maple syrup, 250ml",
    price: 8.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
    stockQty: 20,
    rating: 4.9,
    reviewCount: 50,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p96",
    name: "Honey",
    description: "Natural organic honey, 500g",
    price: 6.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
    stockQty: 40,
    rating: 4.7,
    reviewCount: 80,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p97",
    name: "Granola",
    description: "Crunchy nut and fruit granola, 400g",
    price: 5.99,
    categoryId: "snacks",
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80",
    stockQty: 30,
    rating: 4.6,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p98",
    name: "Chia Seeds",
    description: "Organic black chia seeds, 200g",
    price: 4.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&q=80",
    stockQty: 50,
    rating: 4.8,
    reviewCount: 30,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p99",
    name: "Almond Milk",
    description: "Unsweetened almond milk, 1L",
    price: 3.99,
    categoryId: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&q=80",
    stockQty: 40,
    rating: 4.5,
    reviewCount: 50,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p100",
    name: "Rolled Oats",
    description: "Whole grain rolled oats, 1kg",
    price: 5.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&q=80",
    stockQty: 60,
    rating: 4.7,
    reviewCount: 90,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p101",
    name: "Toor Dal",
    description: "Premium pigeon peas, 1kg",
    price: 3.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1585914966076-7649e3e78a2e?w=400&q=80",
    stockQty: 50,
    rating: 4.6,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p102",
    name: "Sambar Powder",
    description: "Authentic south Indian sambar masala, 100g",
    price: 1.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&q=80",
    stockQty: 80,
    rating: 4.8,
    reviewCount: 65,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p103",
    name: "Tamarind",
    description: "Seedless tamarind pulp, 200g",
    price: 2.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&q=80",
    stockQty: 40,
    rating: 4.5,
    reviewCount: 30,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p104",
    name: "Whole Spices Mix",
    description: "Cardamom, Cinnamon, Cloves, Star Anise",
    price: 4.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&q=80",
    stockQty: 30,
    rating: 4.9,
    reviewCount: 20,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p105",
    name: "Plain Yogurt (Curd)",
    description: "Fresh creamy curd, 500g",
    price: 1.49,
    categoryId: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1571212247484-29005df5015e?w=400&q=80",
    stockQty: 60,
    rating: 4.7,
    reviewCount: 150,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p106",
    name: "Pomegranate",
    description: "Fresh ruby pomegranate, 2 units",
    price: 3.49,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80",
    stockQty: 40,
    rating: 4.8,
    reviewCount: 55,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p107",
    name: "Soy Sauce",
    description: "Dark soy sauce, 250ml",
    price: 2.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1604908177200-3bb7a64ec16a?w=400&q=80",
    stockQty: 50,
    rating: 4.4,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p108",
    name: "Vinegar",
    description: "Synthetic white vinegar, 500ml",
    price: 1.29,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1604908177200-3bb7a64ec16a?w=400&q=80",
    stockQty: 100,
    rating: 4.2,
    reviewCount: 25,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p109",
    name: "Croutons",
    description: "Crispy garlic herb croutons, 100g",
    price: 2.49,
    categoryId: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    stockQty: 40,
    rating: 4.6,
    reviewCount: 15,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p110",
    name: "Broccoli",
    description: "Fresh green broccoli, 500g",
    price: 3.99,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1453306458620-5bbef13a5bca?w=400&q=80",
    stockQty: 30,
    rating: 4.8,
    reviewCount: 90,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p111",
    name: "Dried Oregano",
    description: "Fragrant dried oregano, 25g",
    price: 1.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&q=80",
    stockQty: 100,
    rating: 4.7,
    reviewCount: 30,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p112",
    name: "Cashews",
    description: "Premium raw cashews, 200g",
    price: 6.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80",
    stockQty: 40,
    rating: 4.8,
    reviewCount: 50,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p113",
    name: "Ginger",
    description: "Fresh organic ginger, 200g",
    price: 1.49,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=400&q=80",
    stockQty: 60,
    rating: 4.5,
    reviewCount: 35,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p114",
    name: "Flour (Maida)",
    description: "Refined wheat flour, 1kg",
    price: 1.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1604908177284-4d5d295df1c7?w=400&q=80",
    stockQty: 80,
    rating: 4.5,
    reviewCount: 30,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p115",
    name: "Ripe Bananas (Nendran)",
    description: "Traditional Kerala bananas, bunch of 4",
    price: 3.49,
    categoryId: "fruits",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ad9b5886479b?w=400&q=80",
    stockQty: 40,
    rating: 4.8,
    reviewCount: 25,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p116",
    name: "Black Peppercorns",
    description: "Whole black pepper, 50g",
    price: 2.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&q=80",
    stockQty: 100,
    rating: 4.7,
    reviewCount: 40,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p117",
    name: "Pita Bread / Wrap",
    description: "Soft wraps for shawarma, pack of 5",
    price: 3.99,
    categoryId: "bakery",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    stockQty: 30,
    rating: 4.6,
    reviewCount: 20,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p118",
    name: "Mayonnaise",
    description: "Creamy eggless mayo, 250g",
    price: 2.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1604908177200-3bb7a64ec16a?w=400&q=80",
    stockQty: 50,
    rating: 4.4,
    reviewCount: 35,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p119",
    name: "Vermicelli",
    description: "Roasted semiya for payasam, 200g",
    price: 1.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?w=400&q=80",
    stockQty: 60,
    rating: 4.7,
    reviewCount: 45,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p120",
    name: "Milk Powder",
    description: "Instant dairy whitener, 500g",
    price: 5.99,
    categoryId: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&q=80",
    stockQty: 40,
    rating: 4.5,
    reviewCount: 30,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p121",
    name: "Rose Water",
    description: "Pure edible rose essence, 100ml",
    price: 3.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
    stockQty: 20,
    rating: 4.9,
    reviewCount: 15,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p122",
    name: "Vanilla Extract",
    description: "Pure bourbon vanilla extract, 30ml",
    price: 7.99,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
    stockQty: 25,
    rating: 4.8,
    reviewCount: 40,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p123",
    name: "Cocoa Powder",
    description: "Unsweetened dutch-processed cocoa, 100g",
    price: 4.49,
    categoryId: "pantry",
    imageUrl: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&q=80",
    stockQty: 30,
    rating: 4.7,
    reviewCount: 22,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
  {
    id: "p124",
    name: "Condensed Milk",
    description: "Sweetened condensed milk, 400g",
    price: 2.99,
    categoryId: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400&q=80",
    stockQty: 50,
    rating: 4.6,
    reviewCount: 60,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    createdAt: BigInt(0),
    ageRestricted: false,
    ageCategory: null,
  },
];
