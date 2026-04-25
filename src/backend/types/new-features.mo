import Common "common";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  // ─── Locations ────────────────────────────────────────────────────────────

  public type ShopLocationId = Nat;

  public type ShopLocation = {
    id : ShopLocationId;
    var name : Text;
    var lat : Float;
    var long : Float;
    var radiusKm : Float;
    var deliveryFeeMultiplier : Nat; // 100 = 1x, 150 = 1.5x
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type ShopLocationPublic = {
    id : ShopLocationId;
    name : Text;
    lat : Float;
    long : Float;
    radiusKm : Float;
    deliveryFeeMultiplier : Nat;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type LocationCheckResult = {
    #withinRadius : { shopLocationId : ShopLocationId; distanceKm : Float };
    #outOfRange : { nearestDistanceKm : Float };
    #noShopLocations;
  };

  // ─── Promotions ───────────────────────────────────────────────────────────

  public type BuyXGetYRuleId = Nat;

  public type BuyXGetYRule = {
    id : BuyXGetYRuleId;
    var name : Text;
    var buyProductId : Common.ProductId;
    var buyQty : Nat;
    var getProductId : Common.ProductId;
    var getQty : Nat;
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type BuyXGetYRulePublic = {
    id : BuyXGetYRuleId;
    name : Text;
    buyProductId : Common.ProductId;
    buyQty : Nat;
    getProductId : Common.ProductId;
    getQty : Nat;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type BundleId = Nat;

  public type Bundle = {
    id : BundleId;
    var name : Text;
    var description : Text;
    var imageBlob : Storage.ExternalBlob;
    var productIds : [Common.ProductId];
    var bundlePrice : Nat; // discounted price in cents
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type BundlePublic = {
    id : BundleId;
    name : Text;
    description : Text;
    imageBlob : Storage.ExternalBlob;
    productIds : [Common.ProductId];
    bundlePrice : Nat;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type SeasonalCollectionId = Nat;

  public type SeasonalCollection = {
    id : SeasonalCollectionId;
    var name : Text;
    var description : Text;
    var imageBlob : Storage.ExternalBlob;
    var productIds : [Common.ProductId];
    var startDate : Common.Timestamp;
    var endDate : Common.Timestamp;
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type SeasonalCollectionPublic = {
    id : SeasonalCollectionId;
    name : Text;
    description : Text;
    imageBlob : Storage.ExternalBlob;
    productIds : [Common.ProductId];
    startDate : Common.Timestamp;
    endDate : Common.Timestamp;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  // ─── Wallet ───────────────────────────────────────────────────────────────

  public type WalletTxId = Nat;

  public type WalletTxType = {
    #topUp;
    #bonus;
    #orderDeduction;
    #adminAdjustment;
    #refund;
  };

  public type WalletTransaction = {
    id : WalletTxId;
    userId : Common.UserId;
    amount : Int; // positive = credit, negative = debit (in cents)
    txType : WalletTxType;
    description : Text;
    orderId : ?Common.OrderId;
    createdAt : Common.Timestamp;
  };

  public type Wallet = {
    userId : Common.UserId;
    var balanceCents : Nat;
  };

  public type WalletBonusConfig = {
    var bonusPercent : Nat; // e.g. 10 = 10% bonus on top-up
  };

  // ─── Chat ─────────────────────────────────────────────────────────────────

  public type ChatMsgId = Nat;

  public type ChatMessageSender = { #user; #admin };

  public type ChatMessage = {
    id : ChatMsgId;
    userId : Common.UserId;
    sender : ChatMessageSender;
    text : Text;
    createdAt : Common.Timestamp;
  };

  public type ChatThreadStatus = { #open; #resolved };

  public type ChatThread = {
    userId : Common.UserId;
    var status : ChatThreadStatus;
    var lastMessageAt : Common.Timestamp;
    createdAt : Common.Timestamp;
  };

  public type ChatThreadPublic = {
    userId : Common.UserId;
    status : ChatThreadStatus;
    lastMessageAt : Common.Timestamp;
    createdAt : Common.Timestamp;
  };

  // ─── Notifications ────────────────────────────────────────────────────────

  public type StockSubId = Nat;

  public type StockSubscription = {
    id : StockSubId;
    userId : Common.UserId;
    productId : Common.ProductId;
    createdAt : Common.Timestamp;
  };

  public type InAppNotifId = Nat;

  public type InAppNotifType = {
    #stockBack;
    #orderStatus;
    #promotion;
    #priceDrop;
    #general;
  };

  public type InAppNotification = {
    id : InAppNotifId;
    userId : Common.UserId;
    notifType : InAppNotifType;
    title : Text;
    body : Text;
    productId : ?Common.ProductId;
    orderId : ?Common.OrderId;
    var isRead : Bool;
    createdAt : Common.Timestamp;
  };

  public type InAppNotificationPublic = {
    id : InAppNotifId;
    userId : Common.UserId;
    notifType : InAppNotifType;
    title : Text;
    body : Text;
    productId : ?Common.ProductId;
    orderId : ?Common.OrderId;
    isRead : Bool;
    createdAt : Common.Timestamp;
  };

  // ─── Recipes ──────────────────────────────────────────────────────────────

  public type RecipeId = Nat;

  public type RecipeIngredient = {
    productId : Common.ProductId;
    quantity : Float;
    unit : Text; // e.g. "g", "ml", "pcs"
  };

  public type Recipe = {
    id : RecipeId;
    var name : Text;
    var description : Text;
    var imageBlob : Storage.ExternalBlob;
    var cookTimeMinutes : Nat;
    var servings : Nat;
    var ingredients : [RecipeIngredient];
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type RecipePublic = {
    id : RecipeId;
    name : Text;
    description : Text;
    imageBlob : Storage.ExternalBlob;
    cookTimeMinutes : Nat;
    servings : Nat;
    ingredients : [RecipeIngredient];
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  // ─── Subscriptions ────────────────────────────────────────────────────────

  public type SubscriptionPlanId = Nat;
  public type UserSubscriptionId = Nat;

  public type SubscriptionFrequency = { #weekly; #monthly };

  public type SubscriptionItem = {
    productId : Common.ProductId;
    quantity : Nat;
  };

  public type SubscriptionPlan = {
    id : SubscriptionPlanId;
    var name : Text;
    var description : Text;
    var items : [SubscriptionItem];
    var pricePerCycle : Nat; // in cents
    var frequency : SubscriptionFrequency;
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type SubscriptionPlanPublic = {
    id : SubscriptionPlanId;
    name : Text;
    description : Text;
    items : [SubscriptionItem];
    pricePerCycle : Nat;
    frequency : SubscriptionFrequency;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type UserSubscription = {
    id : UserSubscriptionId;
    userId : Common.UserId;
    planId : SubscriptionPlanId;
    startDate : Common.Timestamp;
    var nextDeliveryDate : Common.Timestamp;
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type UserSubscriptionPublic = {
    id : UserSubscriptionId;
    userId : Common.UserId;
    planId : SubscriptionPlanId;
    startDate : Common.Timestamp;
    nextDeliveryDate : Common.Timestamp;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  // ─── Age-Gated Categories ─────────────────────────────────────────────────

  public type AgeGatedCategory = { #Alcohol; #Tobacco };

  // ─── User Preferences ─────────────────────────────────────────────────────

  public type Language = { #EN; #HI; #ES };

  public type UserPreferences = {
    userId : Common.UserId;
    var language : Language;
    var darkMode : Bool;
  };

  public type UserPreferencesPublic = {
    userId : Common.UserId;
    language : Language;
    darkMode : Bool;
  };

  // ─── Price Drop Alerts ────────────────────────────────────────────────────

  public type PriceDropAlertId = Nat;

  public type PriceDropAlert = {
    id : PriceDropAlertId;
    productId : Common.ProductId;
    originalPrice : Nat;
    newPrice : Nat;
    alertedUsers : [Common.UserId];
    createdAt : Common.Timestamp;
  };
};
