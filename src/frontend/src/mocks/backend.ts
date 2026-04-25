import type { backendInterface, ProductPublic, CategoryPublic, BannerPublic, FlashDealPublic, OrderPublic, UserPublic, AdminStats, CouponPublic, ReviewPublic, CartItemPublic, SavedAddressPublic, LoyaltyTransaction, ProductId, _ImmutableObjectStorageCreateCertificateResult, _ImmutableObjectStorageRefillResult, ShopLocationPublic, BundlePublic, BuyXGetYRulePublic, SeasonalCollectionPublic, ChatMessage, ChatThreadPublic, InAppNotificationPublic, StockSubscription, WalletTransaction } from "../backend";
import { ExternalBlob, OrderStatus, UserRole, LoyaltyReason, Variant_fixed_percent, ChatMessageSender, ChatThreadStatus, InAppNotifType, WalletTxType } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);
const futureTs = now + BigInt(7 * 24 * 60 * 60) * BigInt(1_000_000_000);

const sampleImage = ExternalBlob.fromURL("https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80");

const makeProduct = (id: bigint, name: string, price: bigint, categoryId: bigint, flags: Partial<Pick<ProductPublic, "isFeatured" | "isBestSeller" | "isNewArrival">> = {}): ProductPublic => ({
  id,
  categoryId,
  imageBlob: sampleImage,
  stockQty: BigInt(50),
  name,
  createdAt: now,
  isNewArrival: flags.isNewArrival ?? false,
  description: `Fresh ${name} sourced from local farms. Premium quality guaranteed.`,
  isActive: true,
  isFeatured: flags.isFeatured ?? false,
  rating: BigInt(4),
  price,
  reviewCount: BigInt(12),
  isBestSeller: flags.isBestSeller ?? false,
  ageRestricted: false,
});

const sampleProducts: ProductPublic[] = [
  makeProduct(BigInt(1), "Organic Tomatoes 500g", BigInt(299), BigInt(1), { isFeatured: true, isBestSeller: true }),
  makeProduct(BigInt(2), "Fresh Avocado 200g", BigInt(399), BigInt(1), { isFeatured: true }),
  makeProduct(BigInt(3), "Broccoli Crown 300g", BigInt(199), BigInt(1), { isNewArrival: true }),
  makeProduct(BigInt(4), "Whole Milk 1L", BigInt(149), BigInt(2), { isBestSeller: true }),
  makeProduct(BigInt(5), "Greek Yogurt 400g", BigInt(249), BigInt(2), { isFeatured: true }),
  makeProduct(BigInt(6), "Mixed Berries 250g", BigInt(499), BigInt(3), { isBestSeller: true }),
  makeProduct(BigInt(7), "Mango Alphonso 2pc", BigInt(349), BigInt(3), { isNewArrival: true }),
  makeProduct(BigInt(8), "Potato Chips 150g", BigInt(129), BigInt(4), { isBestSeller: true }),
  makeProduct(BigInt(9), "Almond Nuts 200g", BigInt(599), BigInt(4), { isFeatured: true }),
  makeProduct(BigInt(10), "Orange Juice 1L", BigInt(199), BigInt(5), { isBestSeller: true }),
  makeProduct(BigInt(11), "Mineral Water 6pk", BigInt(299), BigInt(5), { isNewArrival: true }),
  makeProduct(BigInt(12), "Sourdough Bread", BigInt(349), BigInt(6), { isFeatured: true }),
];

const sampleCategories: CategoryPublic[] = [
  { id: BigInt(1), name: "Vegetables", iconEmoji: "🥦", displayOrder: BigInt(1), isActive: true },
  { id: BigInt(2), name: "Dairy", iconEmoji: "🥛", displayOrder: BigInt(2), isActive: true },
  { id: BigInt(3), name: "Fruits", iconEmoji: "🍎", displayOrder: BigInt(3), isActive: true },
  { id: BigInt(4), name: "Snacks", iconEmoji: "🍿", displayOrder: BigInt(4), isActive: true },
  { id: BigInt(5), name: "Beverages", iconEmoji: "🥤", displayOrder: BigInt(5), isActive: true },
  { id: BigInt(6), name: "Bakery", iconEmoji: "🍞", displayOrder: BigInt(6), isActive: true },
  { id: BigInt(7), name: "Frozen", iconEmoji: "🧊", displayOrder: BigInt(7), isActive: true },
  { id: BigInt(8), name: "Pantry", iconEmoji: "🫙", displayOrder: BigInt(8), isActive: true },
  { id: BigInt(9), name: "Personal Care", iconEmoji: "🧴", displayOrder: BigInt(9), isActive: true },
  { id: BigInt(10), name: "Home & Garden", iconEmoji: "🌿", displayOrder: BigInt(10), isActive: true },
];

const sampleBanners: BannerPublic[] = [
  { id: BigInt(1), title: "Fresh Deals Every Day — Up to 40% Off!", imageBlob: ExternalBlob.fromURL("https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=1200&q=80"), displayOrder: BigInt(1), link: "/categories/1", createdAt: now, isActive: true },
  { id: BigInt(2), title: "New Arrivals — Organic Produce", imageBlob: ExternalBlob.fromURL("https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&q=80"), displayOrder: BigInt(2), link: "/categories/3", createdAt: now, isActive: true },
];

const sampleFlashDeals: FlashDealPublic[] = [
  { id: BigInt(1), productId: BigInt(1), discountPercent: BigInt(30), isActive: true, startDateTime: now - BigInt(3600) * BigInt(1_000_000_000), endDateTime: now + BigInt(3600 * 2) * BigInt(1_000_000_000) },
  { id: BigInt(2), productId: BigInt(4), discountPercent: BigInt(20), isActive: true, startDateTime: now - BigInt(3600) * BigInt(1_000_000_000), endDateTime: now + BigInt(3600 * 5) * BigInt(1_000_000_000) },
];

const sampleOrder: OrderPublic = {
  id: BigInt(1),
  tax: BigInt(50),
  status: OrderStatus.Delivered,
  deliveryAddress: { tag: "Home", zip: "10001", street: "123 Main St", city: "New York", state: "NY", phone: "555-1234" },
  loyaltyPointsRedeemed: BigInt(0),
  total: BigInt(999),
  deliveryFee: BigInt(49),
  userId: { _isPrincipal: true, toString: () => "aaaaa-aa" } as any,
  createdAt: now - BigInt(86400) * BigInt(1_000_000_000),
  estimatedDelivery: now + BigInt(86400) * BigInt(1_000_000_000),
  statusHistory: [
    { status: OrderStatus.Pending, timestamp: now - BigInt(86400) * BigInt(1_000_000_000) },
    { status: OrderStatus.Processing, timestamp: now - BigInt(43200) * BigInt(1_000_000_000) },
    { status: OrderStatus.Delivered, timestamp: now },
  ],
  couponId: undefined,
  items: [{ productId: BigInt(1), quantity: BigInt(2), priceAtOrder: BigInt(299) }],
  subtotal: BigInt(900),
  buyXGetYSavings: BigInt(0),
  totalSavings: BigInt(0),
  walletAmountUsed: BigInt(0),
  expressDeliveryFee: BigInt(0),
  isExpressDelivery: false,
};

const sampleUser: UserPublic = {
  id: { _isPrincipal: true, toString: () => "aaaaa-aa" } as any,
  referralCode: "NEXG-XK42",
  name: "Alex Johnson",
  createdAt: now,
  role: UserRole.admin,
  email: "alex@nexgro.store",
  phone: "555-0100",
  loyaltyBalance: BigInt(250),
};

const sampleAdminStats: AdminStats = {
  totalOrders: BigInt(1247),
  lowStockCount: BigInt(8),
  totalUsers: BigInt(3892),
  pendingReviews: BigInt(15),
  totalRevenue: BigInt(892450),
  activeProducts: BigInt(58),
  ordersByDay: [["2026-04-15", BigInt(42)], ["2026-04-16", BigInt(55)], ["2026-04-17", BigInt(38)], ["2026-04-18", BigInt(61)], ["2026-04-19", BigInt(47)], ["2026-04-20", BigInt(53)], ["2026-04-21", BigInt(68)]],
  userGrowthByDay: [["2026-04-15", BigInt(12)], ["2026-04-16", BigInt(18)], ["2026-04-17", BigInt(9)], ["2026-04-18", BigInt(22)], ["2026-04-19", BigInt(15)], ["2026-04-20", BigInt(19)], ["2026-04-21", BigInt(27)]],
  topProducts: [[BigInt(1), "Organic Tomatoes 500g", BigInt(342)], [BigInt(4), "Whole Milk 1L", BigInt(289)], [BigInt(9), "Almond Nuts 200g", BigInt(211)]],
  totalRevenue30Days: BigInt(298150),
  totalSavingsDistributed: BigInt(45230),
};

const sampleCoupons: CouponPublic[] = [
  { id: BigInt(0), code: "WELCOME10", discountValue: BigInt(10), discountType: Variant_fixed_percent.percent, usageCount: BigInt(45), isActive: true, usageLimit: BigInt(0), expirationDate: futureTs },
  { id: BigInt(1), code: "SAVE20", discountValue: BigInt(2000), discountType: Variant_fixed_percent.fixed, usageCount: BigInt(12), isActive: true, usageLimit: BigInt(100), expirationDate: futureTs },
];

const sampleReviews: ReviewPublic[] = [
  { id: BigInt(1), isApproved: true, title: "Great quality!", userId: { _isPrincipal: true, toString: () => "aaaaa-aa" } as any, createdAt: now, text: "Really fresh produce, delivered on time.", productId: BigInt(1), rating: BigInt(5), helpfulCount: BigInt(8) },
  { id: BigInt(2), isApproved: true, title: "Worth the price", userId: { _isPrincipal: true, toString: () => "bbbbb-bb" } as any, createdAt: now, text: "Good packaging and taste.", productId: BigInt(1), rating: BigInt(4), helpfulCount: BigInt(3) },
];

const sampleCart: CartItemPublic[] = [
  { userId: sampleUser.id, productId: BigInt(1), addedAt: now, quantity: BigInt(2) },
  { userId: sampleUser.id, productId: BigInt(4), addedAt: now, quantity: BigInt(1) },
];

const sampleAddress: SavedAddressPublic[] = [
  { id: BigInt(1), tag: "Home", zip: "10001", street: "123 Main St", city: "New York", userId: sampleUser.id, state: "NY", isDefault: true, phone: "555-1234" },
];

const sampleLoyaltyHistory: LoyaltyTransaction[] = [
  { id: BigInt(1), userId: sampleUser.id, createdAt: now - BigInt(86400) * BigInt(1_000_000_000), orderId: BigInt(1), pointsChange: BigInt(100), reason: LoyaltyReason.purchase },
  { id: BigInt(2), userId: sampleUser.id, createdAt: now - BigInt(3600) * BigInt(1_000_000_000), orderId: undefined, pointsChange: BigInt(50), reason: LoyaltyReason.referral },
];

const sampleShopLocations: ShopLocationPublic[] = [
  { id: BigInt(1), name: "NeXgro Main Store", lat: 40.7128, long: -74.006, radiusKm: 10, isActive: true, createdAt: now, deliveryFeeMultiplier: BigInt(100) },
];

const sampleBundles: BundlePublic[] = [
  { id: BigInt(1), name: "Fresh Start Bundle", description: "Tomatoes, avocado and broccoli for a healthy week.", imageBlob: sampleImage, productIds: [BigInt(1), BigInt(2), BigInt(3)], bundlePrice: BigInt(749), isActive: true, createdAt: now },
];

const sampleBuyXGetYRules: BuyXGetYRulePublic[] = [
  { id: BigInt(1), name: "Buy 2 Milk Get 1 Free", buyProductId: BigInt(4), buyQty: BigInt(2), getProductId: BigInt(4), getQty: BigInt(1), isActive: true, createdAt: now },
];

const sampleSeasonalCollections: SeasonalCollectionPublic[] = [
  { id: BigInt(1), name: "Summer Fresh", description: "Beat the heat with our coolest picks!", imageBlob: sampleImage, productIds: [BigInt(6), BigInt(7), BigInt(10)], startDate: now - BigInt(86400) * BigInt(1_000_000_000), endDate: futureTs, isActive: true, createdAt: now },
];

const sampleChatMessages: ChatMessage[] = [
  { id: BigInt(1), userId: sampleUser.id, createdAt: now - BigInt(3600) * BigInt(1_000_000_000), text: "Hi, I have a question about my order.", sender: ChatMessageSender.user },
  { id: BigInt(2), userId: sampleUser.id, createdAt: now - BigInt(1800) * BigInt(1_000_000_000), text: "Sure! Could you share your order ID?", sender: ChatMessageSender.admin },
];

const sampleChatThread: ChatThreadPublic = {
  status: ChatThreadStatus.open,
  lastMessageAt: now - BigInt(1800) * BigInt(1_000_000_000),
  userId: sampleUser.id,
  createdAt: now - BigInt(3600) * BigInt(1_000_000_000),
};

const sampleNotifications: InAppNotificationPublic[] = [
  { id: BigInt(1), title: "Order Delivered!", body: "Your order #1 has been delivered.", userId: sampleUser.id, createdAt: now - BigInt(3600) * BigInt(1_000_000_000), notifType: InAppNotifType.orderStatus, isRead: false, orderId: BigInt(1) },
];

const sampleStockSubscriptions: StockSubscription[] = [];

const sampleWalletTransactions: WalletTransaction[] = [
  { id: BigInt(1), userId: sampleUser.id, createdAt: now - BigInt(86400) * BigInt(1_000_000_000), description: "Wallet top-up", amount: BigInt(500), txType: WalletTxType.topUp },
];

export const mockBackend: backendInterface = {
  addAddress: async () => BigInt(2),
  addShopLocation: async () => BigInt(2),
  addToCart: async () => undefined,
  addToWishlist: async () => undefined,
  adminAdjustWallet: async () => undefined,
  adminGetAllWallets: async () => [[sampleUser.id, BigInt(500)]],
  adminReplyToThread: async () => BigInt(3),
  approveReview: async () => undefined,
  assignCallerUserRole: async () => undefined,
  checkDeliveryRadius: async () => ({ __kind__: "withinRadius", withinRadius: { shopLocationId: BigInt(1), distanceKm: 2.5 } }),
  clearCart: async () => undefined,
  createBanner: async () => BigInt(3),
  createBundle: async () => BigInt(2),
  createBuyXGetYRule: async () => BigInt(2),
  createCategory: async () => BigInt(11),
  createCoupon: async () => BigInt(3),
  createFlashDeal: async () => BigInt(3),
  createProduct: async () => BigInt(13),
  createSeasonalCollection: async () => BigInt(2),
  deleteAddress: async () => undefined,
  deleteBanner: async () => undefined,
  deleteBundle: async () => undefined,
  deleteBuyXGetYRule: async () => undefined,
  deleteCategory: async () => undefined,
  deleteCoupon: async () => undefined,
  deleteFlashDeal: async () => undefined,
  deleteProduct: async () => undefined,
  deleteSeasonalCollection: async () => undefined,
  deleteShopLocation: async () => undefined,
  generateReferralCode: async () => "NEXG-XK42",
  getActiveShopLocations: async () => sampleShopLocations,
  getAdminBundles: async () => sampleBundles,
  getAdminBuyXGetYRules: async () => sampleBuyXGetYRules,
  getAdminSeasonalCollections: async () => sampleSeasonalCollections,
  getAdminStats: async () => sampleAdminStats,
  getAllChatThreads: async () => [sampleChatThread],
  getBanners: async () => sampleBanners,
  getBestSellers: async () => sampleProducts.filter(p => p.isBestSeller),
  getBundleById: async () => sampleBundles[0],
  getBundles: async () => sampleBundles,
  getBuyXGetYRules: async () => sampleBuyXGetYRules,
  getCallerUserRole: async () => UserRole.admin,
  getCategories: async () => sampleCategories,
  getChatMessages: async () => sampleChatMessages,
  getChatThread: async () => sampleChatThread,
  getCoupons: async () => sampleCoupons,
  getFeaturedProducts: async () => sampleProducts.filter(p => p.isFeatured),
  getFlashDeals: async () => sampleFlashDeals,
  getInAppNotifications: async () => sampleNotifications,
  getLoyaltyBalance: async () => BigInt(250),
  getLoyaltyHistory: async () => sampleLoyaltyHistory,
  getNewArrivals: async () => sampleProducts.filter(p => p.isNewArrival),
  getOrderById: async () => sampleOrder,
  getOrders: async () => [sampleOrder],
  getProductById: async () => sampleProducts[0],
  getProductReviews: async () => sampleReviews,
  getProducts: async () => sampleProducts,
  getReviews: async () => sampleReviews,
  getSeasonalCollections: async () => sampleSeasonalCollections,
  getShopLocations: async () => sampleShopLocations,
  getThreadMessages: async () => sampleChatMessages,
  getUnreadNotificationCount: async () => BigInt(1),
  getUserAddresses: async () => sampleAddress,
  getUserCart: async () => sampleCart,
  getUserOrders: async () => [sampleOrder],
  getUserProfile: async () => sampleUser,
  getUserStockSubscriptions: async () => sampleStockSubscriptions,
  getUserWishlist: async () => [BigInt(2), BigInt(5)] as ProductId[],
  getUsers: async () => [sampleUser],
  getWalletBalance: async () => BigInt(500),
  getWalletBonusConfig: async () => BigInt(10),
  getWalletTransactions: async () => sampleWalletTransactions,
  isCallerAdmin: async () => true,
  markNotificationRead: async () => undefined,
  placeOrder: async () => ({ __kind__: "ok", ok: BigInt(2) }),
  rejectReview: async () => undefined,
  removeFromCart: async () => undefined,
  removeFromWishlist: async () => undefined,
  resolveThread: async () => undefined,
  searchProducts: async () => sampleProducts,
  sendChatMessage: async () => BigInt(3),
  setDefaultAddress: async () => undefined,
  setProductFreshness: async () => undefined,
  setSubstituteProduct: async () => undefined,
  setUserLocation: async () => undefined,
  submitReview: async () => BigInt(3),
  subscribeToStockNotification: async () => BigInt(1),
  topUpWallet: async () => undefined,
  triggerStockBackNotifications: async () => BigInt(0),
  unsubscribeStockNotification: async () => undefined,
  updateAddress: async () => undefined,
  updateBanner: async () => undefined,
  updateBundle: async () => undefined,
  updateBuyXGetYRule: async () => undefined,
  updateCartQty: async () => undefined,
  updateCategory: async () => undefined,
  updateCoupon: async () => undefined,
  updateFlashDeal: async () => undefined,
  updateOrderStatus: async () => undefined,
  updateProduct: async () => undefined,
  updateSeasonalCollection: async () => undefined,
  updateShopLocation: async () => undefined,
  updateUserProfile: async () => undefined,
  updateWalletBonusConfig: async () => undefined,
  validateInviteCode: async () => true,
  createPriceDropAlert: async () => BigInt(1),
  createRecipe: async () => BigInt(1),
  createSubscriptionPlan: async () => BigInt(1),
  deleteRecipe: async () => undefined,
  deleteSubscriptionPlan: async () => undefined,
  generateWishlistShareToken: async () => "mock-share-token",
  getPriceDropAlerts: async () => [],
  getProductsByIds: async () => sampleProducts,
  getRecipeById: async () => null,
  getRecipes: async () => [],
  getSharedWishlist: async () => [],
  getSubscriptionPlans: async () => [],
  getUserPreferences: async () => null,
  getUserPriceDropAlerts: async () => [],
  getUserSubscriptions: async () => [],
  subscribeToPlan: async () => BigInt(1),
  unsubscribeFromPlan: async () => undefined,
  updateRecipe: async () => undefined,
  updateSubscriptionPlan: async () => undefined,
  updateUserPreferences: async () => undefined,
  _immutableObjectStorageBlobsAreLive: async () => [],
  _immutableObjectStorageBlobsToDelete: async () => [],
  _immutableObjectStorageConfirmBlobDeletion: async () => undefined,
  _immutableObjectStorageCreateCertificate: async (): Promise<_ImmutableObjectStorageCreateCertificateResult> => ({ method: "", blob_hash: "" }),
  _immutableObjectStorageRefillCashier: async (): Promise<_ImmutableObjectStorageRefillResult> => ({}),
  _immutableObjectStorageUpdateGatewayPrincipals: async () => undefined,
  _initializeAccessControl: async () => undefined,
};
