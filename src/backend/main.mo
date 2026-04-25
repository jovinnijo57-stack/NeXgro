import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import CatalogLib "lib/catalog";
import Common "types/common";
import UserTypes "types/users";
import CatalogTypes "types/catalog";
import OrderTypes "types/orders";
import NewFeatureTypes "types/new-features";
import UsersMixin "mixins/users-api";
import CatalogMixin "mixins/catalog-api";
import OrdersMixin "mixins/orders-api";
import AdminMixin "mixins/admin-api";
import LocationsMixin "mixins/locations-api";
import PromotionsMixin "mixins/promotions-api";
import WalletMixin "mixins/wallet-api";
import ChatMixin "mixins/chat-api";
import NotificationsMixin "mixins/notifications-api";
import RecipesMixin "mixins/recipes-api";
import SubscriptionsMixin "mixins/subscriptions-api";
import PreferencesMixin "mixins/preferences-api";
import Migration "migration";

(with migration = Migration.run)
actor {
  // --- Auth + Storage infrastructure ---
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinObjectStorage();

  // --- Shared mutable counters (passed by reference to all mixins) ---
  let counters : Common.Counters = {
    var nextProductId = 0;
    var nextCategoryId = 0;
    var nextOrderId = 0;
    var nextReviewId = 0;
    var nextCouponId = 0;
    var nextBannerId = 0;
    var nextFlashDealId = 0;
    var nextAddressId = 0;
    var nextLoyaltyTxId = 0;
    var nextShopLocationId = 0;
    var nextBundleId = 0;
    var nextBuyXGetYId = 0;
    var nextSeasonalCollectionId = 0;
    var nextWalletTxId = 0;
    var nextChatMsgId = 0;
    var nextChatThreadId = 0;
    var nextStockSubId = 0;
    var nextInAppNotifId = 0;
    var nextRecipeId = 0;
    var nextSubscriptionPlanId = 0;
    var nextUserSubscriptionId = 0;
    var nextPriceDropAlertId = 0;
  };

  // --- Core collections ---
  let users = Map.empty<Common.UserId, UserTypes.User>();
  let addresses = Map.empty<Common.AddressId, UserTypes.SavedAddress>();
  let loyaltyTxs = List.empty<UserTypes.LoyaltyTransaction>();

  let products = Map.empty<Common.ProductId, CatalogTypes.Product>();
  let categories = Map.empty<Common.CategoryId, CatalogTypes.Category>();
  let reviews = List.empty<CatalogTypes.Review>();
  let flashDeals = Map.empty<Common.FlashDealId, CatalogTypes.FlashDeal>();
  let banners = Map.empty<Common.BannerId, CatalogTypes.Banner>();
  let wishlists = Map.empty<Common.UserId, List.List<Common.ProductId>>();

  let orders = Map.empty<Common.OrderId, OrderTypes.Order>();
  let cartItems = Map.empty<Common.UserId, List.List<OrderTypes.CartItem>>();
  let coupons = Map.empty<Common.CouponId, OrderTypes.Coupon>();

  // --- New feature collections ---
  let shopLocations = Map.empty<NewFeatureTypes.ShopLocationId, NewFeatureTypes.ShopLocation>();
  let bundles = Map.empty<NewFeatureTypes.BundleId, NewFeatureTypes.Bundle>();
  let buyXGetYRules = Map.empty<NewFeatureTypes.BuyXGetYRuleId, NewFeatureTypes.BuyXGetYRule>();
  let seasonalCollections = Map.empty<NewFeatureTypes.SeasonalCollectionId, NewFeatureTypes.SeasonalCollection>();
  let wallets = Map.empty<Common.UserId, NewFeatureTypes.Wallet>();
  let walletTransactions = Map.empty<NewFeatureTypes.WalletTxId, NewFeatureTypes.WalletTransaction>();
  let walletBonusConfig : NewFeatureTypes.WalletBonusConfig = { var bonusPercent = 10 };
  let chatMessages = Map.empty<NewFeatureTypes.ChatMsgId, NewFeatureTypes.ChatMessage>();
  let chatThreads = Map.empty<Common.UserId, NewFeatureTypes.ChatThread>();
  let stockSubscriptions = Map.empty<NewFeatureTypes.StockSubId, NewFeatureTypes.StockSubscription>();
  let inAppNotifications = Map.empty<NewFeatureTypes.InAppNotifId, NewFeatureTypes.InAppNotification>();

  // --- New extended collections ---
  let recipes = Map.empty<NewFeatureTypes.RecipeId, NewFeatureTypes.Recipe>();
  let subscriptionPlans = Map.empty<NewFeatureTypes.SubscriptionPlanId, NewFeatureTypes.SubscriptionPlan>();
  let userSubscriptions = Map.empty<NewFeatureTypes.UserSubscriptionId, NewFeatureTypes.UserSubscription>();
  let userPreferences = Map.empty<Common.UserId, NewFeatureTypes.UserPreferences>();
  let priceDropAlerts = Map.empty<NewFeatureTypes.PriceDropAlertId, NewFeatureTypes.PriceDropAlert>();

  // --- Seed data on first initialization ---
  do {
    if (products.isEmpty()) {
      let (newProdId, newCatId) = CatalogLib.seedProducts(products, categories, counters.nextProductId, counters.nextCategoryId);
      counters.nextProductId := newProdId;
      counters.nextCategoryId := newCatId;

      // Seed 3 coupons
      let now = Time.now();
      let oneYearNs : Int = 365 * 24 * 60 * 60 * 1_000_000_000;
      let expiry = now + oneYearNs;

      let coupon0 : OrderTypes.Coupon = {
        id = 0;
        code = "WELCOME10";
        discountType = #percent;
        discountValue = 10;
        expirationDate = expiry;
        var isActive = true;
        usageLimit = 0;
        var usageCount = 0;
      };
      coupons.add(0, coupon0);

      let coupon1 : OrderTypes.Coupon = {
        id = 1;
        code = "SAVE20";
        discountType = #fixed;
        discountValue = 2000;
        expirationDate = expiry;
        var isActive = true;
        usageLimit = 100;
        var usageCount = 0;
      };
      coupons.add(1, coupon1);

      let coupon2 : OrderTypes.Coupon = {
        id = 2;
        code = "NEXGRO15";
        discountType = #percent;
        discountValue = 15;
        expirationDate = expiry;
        var isActive = true;
        usageLimit = 200;
        var usageCount = 0;
      };
      coupons.add(2, coupon2);
      counters.nextCouponId := 3;

      // Seed 5 banners
      let emptyImageBlob : Blob = Blob.empty();
      let banner0 : CatalogTypes.Banner = {
        id = 0;
        imageBlob = emptyImageBlob;
        title = "Fresh Deals Every Day";
        link = "/deals";
        var displayOrder = 1;
        var isActive = true;
        createdAt = now;
      };
      banners.add(0, banner0);

      let banner1 : CatalogTypes.Banner = {
        id = 1;
        imageBlob = emptyImageBlob;
        title = "10% Off Your First Order";
        link = "/signup";
        var displayOrder = 2;
        var isActive = true;
        createdAt = now;
      };
      banners.add(1, banner1);

      let banner2 : CatalogTypes.Banner = {
        id = 2;
        imageBlob = emptyImageBlob;
        title = "Free Delivery Over $50";
        link = "/products";
        var displayOrder = 3;
        var isActive = true;
        createdAt = now;
      };
      banners.add(2, banner2);

      let banner3 : CatalogTypes.Banner = {
        id = 3;
        imageBlob = emptyImageBlob;
        title = "Earn Points on Every Purchase";
        link = "/loyalty";
        var displayOrder = 4;
        var isActive = true;
        createdAt = now;
      };
      banners.add(3, banner3);

      let banner4 : CatalogTypes.Banner = {
        id = 4;
        imageBlob = emptyImageBlob;
        title = "Flash Deals — Limited Time Only";
        link = "/flash-deals";
        var displayOrder = 5;
        var isActive = true;
        createdAt = now;
      };
      banners.add(4, banner4);
      counters.nextBannerId := 5;

      // Seed 5 flash deals (active for 30 days from deployment)
      let thirtyDaysNs : Int = 30 * 24 * 60 * 60 * 1_000_000_000;
      let dealEnd = now + thirtyDaysNs;

      var fi = 0;
      let dealDiscounts = [25, 30, 20, 35, 15];
      while (fi < 5) {
        let fd : CatalogTypes.FlashDeal = {
          id = fi;
          productId = fi;
          discountPercent = dealDiscounts[fi];
          startDateTime = now;
          endDateTime = dealEnd;
          var isActive = true;
        };
        flashDeals.add(fi, fd);
        fi += 1;
      };
      counters.nextFlashDealId := 5;

      // Seed 2 sample shop locations
      let shopLoc0 : NewFeatureTypes.ShopLocation = {
        id = 0;
        var name = "NeXgro Main Store";
        var lat = 12.9716;
        var long = 77.5946;
        var radiusKm = 10.0;
        var deliveryFeeMultiplier = 100;
        var isActive = true;
        createdAt = now;
      };
      shopLocations.add(0, shopLoc0);

      let shopLoc1 : NewFeatureTypes.ShopLocation = {
        id = 1;
        var name = "NeXgro North Hub";
        var lat = 13.0358;
        var long = 77.5970;
        var radiusKm = 8.0;
        var deliveryFeeMultiplier = 110;
        var isActive = true;
        createdAt = now;
      };
      shopLocations.add(1, shopLoc1);
      counters.nextShopLocationId := 2;

      // Seed 2 sample bundles
      let bundle0 : NewFeatureTypes.Bundle = {
        id = 0;
        var name = "Fresh Breakfast Bundle";
        var description = "Start your day right with our curated breakfast essentials";
        var imageBlob = emptyImageBlob;
        var productIds = [0, 1, 2];
        var bundlePrice = 1499;
        var isActive = true;
        createdAt = now;
      };
      bundles.add(0, bundle0);

      let bundle1 : NewFeatureTypes.Bundle = {
        id = 1;
        var name = "Healthy Snack Pack";
        var description = "A week of guilt-free snacking";
        var imageBlob = emptyImageBlob;
        var productIds = [3, 4, 5];
        var bundlePrice = 1999;
        var isActive = true;
        createdAt = now;
      };
      bundles.add(1, bundle1);
      counters.nextBundleId := 2;

      // Seed 2 seasonal collections
      let sixtyDaysNs : Int = 60 * 24 * 60 * 60 * 1_000_000_000;
      let sc0 : NewFeatureTypes.SeasonalCollection = {
        id = 0;
        var name = "Summer Fresh";
        var description = "Beat the heat with our refreshing summer picks";
        var imageBlob = emptyImageBlob;
        var productIds = [0, 1, 2, 3, 4];
        var startDate = now;
        var endDate = now + sixtyDaysNs;
        var isActive = true;
        createdAt = now;
      };
      seasonalCollections.add(0, sc0);

      let sc1 : NewFeatureTypes.SeasonalCollection = {
        id = 1;
        var name = "Diwali Deals";
        var description = "Celebrate with the best of NeXgro at special festive prices";
        var imageBlob = emptyImageBlob;
        var productIds = [5, 6, 7, 8, 9];
        var startDate = now;
        var endDate = now + sixtyDaysNs;
        var isActive = true;
        createdAt = now;
      };
      seasonalCollections.add(1, sc1);
      counters.nextSeasonalCollectionId := 2;

      // Seed 3 recipes: Biryani, Pasta, Mango Smoothie
      let recipe0 : NewFeatureTypes.Recipe = {
        id = 0;
        var name = "Chicken Biryani";
        var description = "Aromatic basmati rice cooked with spiced chicken and caramelised onions";
        var imageBlob = emptyImageBlob;
        var cookTimeMinutes = 60;
        var servings = 4;
        var ingredients = [
          { productId = 12; quantity = 500.0; unit = "g" },  // Chicken Breast
          { productId = 40; quantity = 500.0; unit = "g" },  // Basmati Rice
          { productId = 4; quantity = 200.0; unit = "g" },   // Red Onions
          { productId = 6; quantity = 1000.0; unit = "ml" }, // Full Cream Milk (for marinade)
        ];
        var isActive = true;
        createdAt = now;
      };
      recipes.add(0, recipe0);

      let recipe1 : NewFeatureTypes.Recipe = {
        id = 1;
        var name = "Pasta Arrabbiata";
        var description = "Spicy Italian pasta with rich tomato sauce and fresh herbs";
        var imageBlob = emptyImageBlob;
        var cookTimeMinutes = 25;
        var servings = 2;
        var ingredients = [
          { productId = 42; quantity = 250.0; unit = "g" },  // Pasta Penne
          { productId = 44; quantity = 400.0; unit = "g" },  // Tomato Passata
          { productId = 41; quantity = 30.0; unit = "ml" },  // Olive Oil
        ];
        var isActive = true;
        createdAt = now;
      };
      recipes.add(1, recipe1);

      let recipe2 : NewFeatureTypes.Recipe = {
        id = 2;
        var name = "Mango Smoothie";
        var description = "Thick and creamy tropical mango smoothie — ready in 5 minutes";
        var imageBlob = emptyImageBlob;
        var cookTimeMinutes = 5;
        var servings = 2;
        var ingredients = [
          { productId = 21; quantity = 300.0; unit = "ml" }, // Mango Smoothie base
          { productId = 8; quantity = 200.0; unit = "g" },   // Greek Yogurt
          { productId = 6; quantity = 200.0; unit = "ml" },  // Full Cream Milk
        ];
        var isActive = true;
        createdAt = now;
      };
      recipes.add(2, recipe2);
      counters.nextRecipeId := 3;

      // Seed 2 subscription plans: Weekly Essentials, Monthly Organic
      let plan0 : NewFeatureTypes.SubscriptionPlan = {
        id = 0;
        var name = "Weekly Essentials";
        var description = "7 days of fresh essentials delivered to your door every week";
        var items = [
          { productId = 0; quantity = 2 },  // Bananas
          { productId = 6; quantity = 2 },  // Full Cream Milk
          { productId = 7; quantity = 1 },  // Organic Eggs
          { productId = 35; quantity = 1 }, // Sourdough Loaf
        ];
        var pricePerCycle = 1299;
        var frequency = #weekly;
        var isActive = true;
        createdAt = now;
      };
      subscriptionPlans.add(0, plan0);

      let plan1 : NewFeatureTypes.SubscriptionPlan = {
        id = 1;
        var name = "Monthly Organic";
        var description = "Premium organic produce curated monthly for health-conscious families";
        var items = [
          { productId = 1; quantity = 4 },  // Organic Apples
          { productId = 7; quantity = 4 },  // Organic Eggs
          { productId = 2; quantity = 3 },  // Baby Spinach
          { productId = 8; quantity = 2 },  // Greek Yogurt
          { productId = 45; quantity = 1 }, // Raw Honey
        ];
        var pricePerCycle = 3999;
        var frequency = #monthly;
        var isActive = true;
        createdAt = now;
      };
      subscriptionPlans.add(1, plan1);
      counters.nextSubscriptionPlanId := 2;
    };
  };

  // --- Mixins ---
  include UsersMixin(
    accessControlState,
    users,
    addresses,
    loyaltyTxs,
    counters,
  );

  include CatalogMixin(
    accessControlState,
    products,
    categories,
    reviews,
    flashDeals,
    banners,
    wishlists,
    stockSubscriptions,
    inAppNotifications,
    counters,
  );

  include OrdersMixin(
    accessControlState,
    orders,
    cartItems,
    coupons,
    products,
    users,
    loyaltyTxs,
    addresses,
    wallets,
    walletTransactions,
    buyXGetYRules,
    flashDeals,
    counters,
  );

  include AdminMixin(
    accessControlState,
    users,
    orders,
    products,
    categories,
    coupons,
    reviews,
  );

  include LocationsMixin(
    accessControlState,
    shopLocations,
    users,
    counters,
  );

  include PromotionsMixin(
    accessControlState,
    buyXGetYRules,
    bundles,
    seasonalCollections,
    products,
    counters,
  );

  include WalletMixin(
    accessControlState,
    wallets,
    walletTransactions,
    walletBonusConfig,
    counters,
  );

  include ChatMixin(
    accessControlState,
    chatMessages,
    chatThreads,
    counters,
  );

  include NotificationsMixin(
    accessControlState,
    stockSubscriptions,
    inAppNotifications,
    products,
    counters,
  );

  include RecipesMixin(
    accessControlState,
    recipes,
    counters,
  );

  include SubscriptionsMixin(
    accessControlState,
    subscriptionPlans,
    userSubscriptions,
    counters,
  );

  include PreferencesMixin(
    accessControlState,
    userPreferences,
    priceDropAlerts,
    wishlists,
    users,
    inAppNotifications,
    products,
    counters,
  );
};
