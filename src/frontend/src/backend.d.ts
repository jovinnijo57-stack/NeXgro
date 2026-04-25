import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type StockSubId = bigint;
export interface RecipePublic {
    id: RecipeId;
    imageBlob: ExternalBlob;
    name: string;
    createdAt: Timestamp;
    description: string;
    cookTimeMinutes: bigint;
    isActive: boolean;
    servings: bigint;
    ingredients: Array<RecipeIngredient>;
}
export type PriceDropAlertId = bigint;
export interface UserPublic {
    id: UserId;
    userLong?: number;
    referralCode: string;
    wishlistShareToken?: string;
    name: string;
    createdAt: Timestamp;
    role: UserRole;
    userLat?: number;
    email: string;
    referredBy?: UserId;
    phone: string;
    loyaltyBalance: bigint;
}
export type InAppNotifId = bigint;
export interface ShopLocationPublic {
    id: ShopLocationId;
    lat: number;
    long: number;
    name: string;
    createdAt: Timestamp;
    isActive: boolean;
    deliveryFeeMultiplier: bigint;
    radiusKm: number;
}
export interface CategoryPublic {
    id: CategoryId;
    displayOrder: bigint;
    name: string;
    isActive: boolean;
    iconEmoji: string;
}
export interface StatusHistoryEntry {
    status: OrderStatus;
    timestamp: Timestamp;
}
export type BannerId = bigint;
export type WalletTxId = bigint;
export type RecipeId = bigint;
export interface PriceDropAlert {
    id: PriceDropAlertId;
    originalPrice: bigint;
    createdAt: Timestamp;
    productId: ProductId;
    alertedUsers: Array<UserId>;
    newPrice: bigint;
}
export interface CouponPublic {
    id: CouponId;
    discountValue: bigint;
    code: string;
    discountType: Variant_fixed_percent;
    usageCount: bigint;
    isActive: boolean;
    usageLimit: bigint;
    expirationDate: Timestamp;
}
export type BuyXGetYRuleId = bigint;
export interface BannerPublic {
    id: BannerId;
    title: string;
    imageBlob: ExternalBlob;
    displayOrder: bigint;
    link: string;
    createdAt: Timestamp;
    isActive: boolean;
}
export interface UserSubscriptionPublic {
    id: UserSubscriptionId;
    planId: SubscriptionPlanId;
    userId: UserId;
    createdAt: Timestamp;
    nextDeliveryDate: Timestamp;
    isActive: boolean;
    startDate: Timestamp;
}
export interface ProductFilters {
    categoryId?: CategoryId;
    minRating?: bigint;
    onlyActive: boolean;
    maxPrice?: bigint;
    minPrice?: bigint;
    searchQuery?: string;
}
export type UserSubscriptionId = bigint;
export type ChatMsgId = bigint;
export interface ChatMessage {
    id: ChatMsgId;
    userId: UserId;
    createdAt: Timestamp;
    text: string;
    sender: ChatMessageSender;
}
export type PlaceOrderResult = {
    __kind__: "ok";
    ok: OrderId;
} | {
    __kind__: "err";
    err: string;
};
export type ShopLocationId = bigint;
export interface SubscriptionPlanPublic {
    id: SubscriptionPlanId;
    name: string;
    createdAt: Timestamp;
    description: string;
    isActive: boolean;
    frequency: SubscriptionFrequency;
    items: Array<SubscriptionItem>;
    pricePerCycle: bigint;
}
export interface ReviewPublic {
    id: ReviewId;
    isApproved: boolean;
    title: string;
    userId: UserId;
    createdAt: Timestamp;
    text: string;
    productId: ProductId;
    rating: bigint;
    helpfulCount: bigint;
}
export interface RecipeIngredient {
    unit: string;
    productId: ProductId;
    quantity: number;
}
export type UserId = Principal;
export interface AdminStats {
    totalOrders: bigint;
    ordersByDay: Array<[string, bigint]>;
    lowStockCount: bigint;
    userGrowthByDay: Array<[string, bigint]>;
    totalUsers: bigint;
    topProducts: Array<[bigint, string, bigint]>;
    pendingReviews: bigint;
    totalRevenue: bigint;
    totalRevenue30Days: bigint;
    activeProducts: bigint;
    totalSavingsDistributed: bigint;
}
export interface StockSubscription {
    id: StockSubId;
    userId: UserId;
    createdAt: Timestamp;
    productId: ProductId;
}
export interface InAppNotificationPublic {
    id: InAppNotifId;
    title: string;
    notifType: InAppNotifType;
    body: string;
    userId: UserId;
    createdAt: Timestamp;
    productId?: ProductId;
    isRead: boolean;
    orderId?: OrderId;
}
export type SeasonalCollectionId = bigint;
export type Timestamp = bigint;
export interface LoyaltyTransaction {
    id: LoyaltyTxId;
    userId: UserId;
    createdAt: Timestamp;
    orderId?: OrderId;
    pointsChange: bigint;
    reason: LoyaltyReason;
}
export interface ProductPublic {
    id: ProductId;
    categoryId: CategoryId;
    imageBlob: ExternalBlob;
    stockQty: bigint;
    name: string;
    createdAt: Timestamp;
    isNewArrival: boolean;
    description: string;
    ageRestricted: boolean;
    isActive: boolean;
    bestBeforeDate?: bigint;
    isFeatured: boolean;
    rating: bigint;
    bundleId?: bigint;
    price: bigint;
    reviewCount: bigint;
    isBestSeller: boolean;
    harvestDate?: bigint;
    ageCategory?: AgeGatedCategory;
}
export interface SeasonalCollectionPublic {
    id: SeasonalCollectionId;
    imageBlob: ExternalBlob;
    endDate: Timestamp;
    productIds: Array<ProductId>;
    name: string;
    createdAt: Timestamp;
    description: string;
    isActive: boolean;
    startDate: Timestamp;
}
export interface OrderItem {
    productId: ProductId;
    quantity: bigint;
    priceAtOrder: bigint;
}
export type LocationCheckResult = {
    __kind__: "noShopLocations";
    noShopLocations: null;
} | {
    __kind__: "withinRadius";
    withinRadius: {
        shopLocationId: ShopLocationId;
        distanceKm: number;
    };
} | {
    __kind__: "outOfRange";
    outOfRange: {
        nearestDistanceKm: number;
    };
};
export interface WalletTransaction {
    id: WalletTxId;
    userId: UserId;
    createdAt: Timestamp;
    description: string;
    orderId?: OrderId;
    txType: WalletTxType;
    amount: bigint;
}
export interface OrderPublic {
    id: OrderId;
    tax: bigint;
    status: OrderStatus;
    deliveryAddress: DeliveryAddress;
    loyaltyPointsRedeemed: bigint;
    total: bigint;
    buyXGetYSavings: bigint;
    deliveryFee: bigint;
    userId: UserId;
    createdAt: Timestamp;
    estimatedDelivery?: Timestamp;
    totalSavings: bigint;
    walletAmountUsed: bigint;
    statusHistory: Array<StatusHistoryEntry>;
    deliverySlot?: string;
    couponId?: CouponId;
    items: Array<OrderItem>;
    expressDeliveryFee: bigint;
    isExpressDelivery: boolean;
    subtotal: bigint;
}
export type FlashDealId = bigint;
export interface FlashDealPublic {
    id: FlashDealId;
    discountPercent: bigint;
    productId: ProductId;
    isActive: boolean;
    endDateTime: Timestamp;
    startDateTime: Timestamp;
}
export interface BundlePublic {
    id: BundleId;
    imageBlob: ExternalBlob;
    productIds: Array<ProductId>;
    name: string;
    createdAt: Timestamp;
    description: string;
    isActive: boolean;
    bundlePrice: bigint;
}
export interface UserPreferencesPublic {
    userId: UserId;
    language: Language;
    darkMode: boolean;
}
export type AddressId = bigint;
export interface ChatThreadPublic {
    status: ChatThreadStatus;
    lastMessageAt: Timestamp;
    userId: UserId;
    createdAt: Timestamp;
}
export type ReviewId = bigint;
export interface DeliveryAddress {
    tag: string;
    zip: string;
    street: string;
    city: string;
    state: string;
    phone: string;
}
export type CouponId = bigint;
export interface SavedAddressPublic {
    id: AddressId;
    tag: string;
    zip: string;
    street: string;
    city: string;
    userId: UserId;
    state: string;
    isDefault: boolean;
    phone: string;
}
export type BundleId = bigint;
export interface CartItemPublic {
    userId: UserId;
    productId: ProductId;
    addedAt: Timestamp;
    substituteProductId?: bigint;
    quantity: bigint;
}
export type LoyaltyTxId = bigint;
export type CategoryId = bigint;
export interface SubscriptionItem {
    productId: ProductId;
    quantity: bigint;
}
export type ProductId = bigint;
export type SubscriptionPlanId = bigint;
export interface BuyXGetYRulePublic {
    id: BuyXGetYRuleId;
    name: string;
    createdAt: Timestamp;
    isActive: boolean;
    getProductId: ProductId;
    getQty: bigint;
    buyQty: bigint;
    buyProductId: ProductId;
}
export type OrderId = bigint;
export enum AgeGatedCategory {
    Alcohol = "Alcohol",
    Tobacco = "Tobacco"
}
export enum ChatMessageSender {
    admin = "admin",
    user = "user"
}
export enum ChatThreadStatus {
    resolved = "resolved",
    open = "open"
}
export enum InAppNotifType {
    stockBack = "stockBack",
    orderStatus = "orderStatus",
    promotion = "promotion",
    general = "general",
    priceDrop = "priceDrop"
}
export enum Language {
    EN = "EN",
    ES = "ES",
    HI = "HI"
}
export enum LoyaltyReason {
    referral = "referral",
    admin = "admin",
    purchase = "purchase",
    redemption = "redemption"
}
export enum OrderStatus {
    Delivered = "Delivered",
    Cancelled = "Cancelled",
    Processing = "Processing",
    Shipped = "Shipped",
    Pending = "Pending"
}
export enum SubscriptionFrequency {
    monthly = "monthly",
    weekly = "weekly"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_fixed_percent {
    fixed = "fixed",
    percent = "percent"
}
export enum WalletTxType {
    topUp = "topUp",
    adminAdjustment = "adminAdjustment",
    orderDeduction = "orderDeduction",
    bonus = "bonus",
    refund = "refund"
}
export interface backendInterface {
    addAddress(street: string, city: string, state: string, zip: string, phone: string, tag: string): Promise<AddressId>;
    addShopLocation(name: string, lat: number, long: number, radiusKm: number, deliveryFeeMultiplier: bigint): Promise<ShopLocationId>;
    addToCart(productId: ProductId, qty: bigint): Promise<void>;
    addToWishlist(productId: ProductId): Promise<void>;
    adminAdjustWallet(userId: Principal, amount: bigint, description: string): Promise<void>;
    adminGetAllWallets(): Promise<Array<[Principal, bigint]>>;
    adminReplyToThread(userId: Principal, message: string): Promise<ChatMsgId>;
    approveReview(id: ReviewId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkDeliveryRadius(lat: number, long: number): Promise<LocationCheckResult>;
    clearCart(): Promise<void>;
    createBanner(imageBlob: ExternalBlob, title: string, link: string, displayOrder: bigint): Promise<BannerId>;
    createBundle(name: string, description: string, imageBlob: ExternalBlob, productIds: Array<ProductId>, bundlePrice: bigint): Promise<BundleId>;
    createBuyXGetYRule(name: string, buyProductId: ProductId, buyQty: bigint, getProductId: ProductId, getQty: bigint): Promise<BuyXGetYRuleId>;
    createCategory(name: string, displayOrder: bigint, iconEmoji: string): Promise<CategoryId>;
    createCoupon(code: string, discountType: Variant_fixed_percent, discountValue: bigint, expirationDate: Timestamp, usageLimit: bigint): Promise<CouponId>;
    createFlashDeal(productId: ProductId, discountPercent: bigint, startDateTime: Timestamp, endDateTime: Timestamp): Promise<FlashDealId>;
    createPriceDropAlert(productId: ProductId, originalPrice: bigint, newPrice: bigint): Promise<PriceDropAlertId>;
    createProduct(name: string, description: string, price: bigint, categoryId: CategoryId, imageBlob: ExternalBlob, stockQty: bigint, isFeatured: boolean, isBestSeller: boolean, isNewArrival: boolean, harvestDate: bigint | null, bestBeforeDate: bigint | null, bundleId: bigint | null, ageRestricted: boolean, ageCategory: AgeGatedCategory | null): Promise<ProductId>;
    createRecipe(name: string, description: string, imageBlob: ExternalBlob, cookTimeMinutes: bigint, servings: bigint, ingredients: Array<RecipeIngredient>): Promise<RecipeId>;
    createSeasonalCollection(name: string, description: string, imageBlob: ExternalBlob, productIds: Array<ProductId>, startDate: Timestamp, endDate: Timestamp): Promise<SeasonalCollectionId>;
    createSubscriptionPlan(name: string, description: string, items: Array<SubscriptionItem>, pricePerCycle: bigint, frequency: SubscriptionFrequency): Promise<SubscriptionPlanId>;
    deleteAddress(id: AddressId): Promise<void>;
    deleteBanner(id: BannerId): Promise<void>;
    deleteBundle(id: BundleId): Promise<void>;
    deleteBuyXGetYRule(id: BuyXGetYRuleId): Promise<void>;
    deleteCategory(id: CategoryId): Promise<void>;
    deleteCoupon(id: CouponId): Promise<void>;
    deleteFlashDeal(id: FlashDealId): Promise<void>;
    deleteProduct(id: ProductId): Promise<void>;
    deleteRecipe(id: RecipeId): Promise<void>;
    deleteSeasonalCollection(id: SeasonalCollectionId): Promise<void>;
    deleteShopLocation(id: ShopLocationId): Promise<void>;
    deleteSubscriptionPlan(id: SubscriptionPlanId): Promise<void>;
    generateReferralCode(): Promise<string>;
    generateWishlistShareToken(): Promise<string>;
    getActiveShopLocations(): Promise<Array<ShopLocationPublic>>;
    getAdminBundles(): Promise<Array<BundlePublic>>;
    getAdminBuyXGetYRules(): Promise<Array<BuyXGetYRulePublic>>;
    getAdminSeasonalCollections(): Promise<Array<SeasonalCollectionPublic>>;
    getAdminStats(): Promise<AdminStats>;
    getAllChatThreads(): Promise<Array<ChatThreadPublic>>;
    getBanners(): Promise<Array<BannerPublic>>;
    getBestSellers(): Promise<Array<ProductPublic>>;
    getBundleById(id: BundleId): Promise<BundlePublic | null>;
    getBundles(): Promise<Array<BundlePublic>>;
    getBuyXGetYRules(): Promise<Array<BuyXGetYRulePublic>>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<CategoryPublic>>;
    getChatMessages(): Promise<Array<ChatMessage>>;
    getChatThread(): Promise<ChatThreadPublic | null>;
    getCoupons(): Promise<Array<CouponPublic>>;
    getFeaturedProducts(): Promise<Array<ProductPublic>>;
    getFlashDeals(): Promise<Array<FlashDealPublic>>;
    getInAppNotifications(): Promise<Array<InAppNotificationPublic>>;
    getLoyaltyBalance(): Promise<bigint>;
    getLoyaltyHistory(): Promise<Array<LoyaltyTransaction>>;
    getNewArrivals(): Promise<Array<ProductPublic>>;
    getOrderById(id: OrderId): Promise<OrderPublic | null>;
    getOrders(): Promise<Array<OrderPublic>>;
    getPriceDropAlerts(): Promise<Array<PriceDropAlert>>;
    getProductById(id: ProductId): Promise<ProductPublic | null>;
    getProductReviews(productId: ProductId): Promise<Array<ReviewPublic>>;
    getProducts(filters: ProductFilters): Promise<Array<ProductPublic>>;
    getProductsByIds(ids: Array<ProductId>): Promise<Array<ProductPublic>>;
    getRecipeById(id: RecipeId): Promise<RecipePublic | null>;
    getRecipes(): Promise<Array<RecipePublic>>;
    getReviews(approved: boolean): Promise<Array<ReviewPublic>>;
    getSeasonalCollections(): Promise<Array<SeasonalCollectionPublic>>;
    getSharedWishlist(token: string): Promise<Array<ProductId>>;
    getShopLocations(): Promise<Array<ShopLocationPublic>>;
    getSubscriptionPlans(): Promise<Array<SubscriptionPlanPublic>>;
    getThreadMessages(userId: Principal): Promise<Array<ChatMessage>>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserAddresses(): Promise<Array<SavedAddressPublic>>;
    getUserCart(): Promise<Array<CartItemPublic>>;
    getUserOrders(): Promise<Array<OrderPublic>>;
    getUserPreferences(): Promise<UserPreferencesPublic | null>;
    getUserPriceDropAlerts(): Promise<Array<PriceDropAlert>>;
    getUserProfile(): Promise<UserPublic | null>;
    getUserStockSubscriptions(): Promise<Array<StockSubscription>>;
    getUserSubscriptions(): Promise<Array<UserSubscriptionPublic>>;
    getUserWishlist(): Promise<Array<ProductId>>;
    getUsers(): Promise<Array<UserPublic>>;
    getWalletBalance(): Promise<bigint>;
    getWalletBonusConfig(): Promise<bigint>;
    getWalletTransactions(): Promise<Array<WalletTransaction>>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationRead(id: InAppNotifId): Promise<void>;
    placeOrder(addressId: AddressId, couponCode: string | null, loyaltyPointsToRedeem: bigint, deliverySlot: string | null, isExpressDelivery: boolean, walletAmountToUse: bigint): Promise<PlaceOrderResult>;
    rejectReview(id: ReviewId): Promise<void>;
    removeFromCart(productId: ProductId): Promise<void>;
    removeFromWishlist(productId: ProductId): Promise<void>;
    resolveThread(userId: Principal): Promise<void>;
    searchProducts(searchQuery: string, filters: ProductFilters): Promise<Array<ProductPublic>>;
    sendChatMessage(message: string): Promise<ChatMsgId>;
    setDefaultAddress(id: AddressId): Promise<void>;
    setProductFreshness(productId: ProductId, harvestDate: bigint | null, bestBeforeDate: bigint | null): Promise<void>;
    setSubstituteProduct(productId: ProductId, substituteId: bigint | null): Promise<void>;
    setUserLocation(lat: number, long: number): Promise<void>;
    submitReview(productId: ProductId, rating: bigint, title: string, text: string): Promise<ReviewId>;
    subscribeToPlan(planId: SubscriptionPlanId): Promise<UserSubscriptionId>;
    subscribeToStockNotification(productId: ProductId): Promise<StockSubId>;
    topUpWallet(amount: bigint): Promise<void>;
    triggerStockBackNotifications(productId: ProductId): Promise<bigint>;
    unsubscribeFromPlan(subscriptionId: UserSubscriptionId): Promise<void>;
    unsubscribeStockNotification(productId: ProductId): Promise<void>;
    updateAddress(id: AddressId, street: string, city: string, state: string, zip: string, phone: string, tag: string): Promise<void>;
    updateBanner(id: BannerId, imageBlob: ExternalBlob, title: string, link: string, displayOrder: bigint, isActive: boolean): Promise<void>;
    updateBundle(id: BundleId, name: string, description: string, imageBlob: ExternalBlob, productIds: Array<ProductId>, bundlePrice: bigint, isActive: boolean): Promise<void>;
    updateBuyXGetYRule(id: BuyXGetYRuleId, name: string, buyProductId: ProductId, buyQty: bigint, getProductId: ProductId, getQty: bigint, isActive: boolean): Promise<void>;
    updateCartQty(productId: ProductId, qty: bigint): Promise<void>;
    updateCategory(id: CategoryId, name: string, displayOrder: bigint, isActive: boolean, iconEmoji: string): Promise<void>;
    updateCoupon(id: CouponId, discountType: Variant_fixed_percent, discountValue: bigint, expirationDate: Timestamp, isActive: boolean, usageLimit: bigint): Promise<void>;
    updateFlashDeal(id: FlashDealId, discountPercent: bigint, startDateTime: Timestamp, endDateTime: Timestamp, isActive: boolean): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updateProduct(id: ProductId, name: string, description: string, price: bigint, categoryId: CategoryId, imageBlob: ExternalBlob, stockQty: bigint, isActive: boolean, isFeatured: boolean, isBestSeller: boolean, isNewArrival: boolean, harvestDate: bigint | null, bestBeforeDate: bigint | null, bundleId: bigint | null, ageRestricted: boolean, ageCategory: AgeGatedCategory | null): Promise<void>;
    updateRecipe(id: RecipeId, name: string, description: string, imageBlob: ExternalBlob, cookTimeMinutes: bigint, servings: bigint, ingredients: Array<RecipeIngredient>, isActive: boolean): Promise<void>;
    updateSeasonalCollection(id: SeasonalCollectionId, name: string, description: string, imageBlob: ExternalBlob, productIds: Array<ProductId>, startDate: Timestamp, endDate: Timestamp, isActive: boolean): Promise<void>;
    updateShopLocation(id: ShopLocationId, name: string, lat: number, long: number, radiusKm: number, deliveryFeeMultiplier: bigint, isActive: boolean): Promise<void>;
    updateSubscriptionPlan(id: SubscriptionPlanId, name: string, description: string, items: Array<SubscriptionItem>, pricePerCycle: bigint, frequency: SubscriptionFrequency, isActive: boolean): Promise<void>;
    updateUserPreferences(language: Language, darkMode: boolean): Promise<void>;
    updateUserProfile(name: string, email: string, phone: string): Promise<void>;
    updateWalletBonusConfig(bonusPercent: bigint): Promise<void>;
    validateInviteCode(code: string): Promise<boolean>;
}
