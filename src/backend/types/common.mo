import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  public type UserId = Principal;
  public type Timestamp = Time.Time;
  public type OrderId = Nat;
  public type ProductId = Nat;
  public type CategoryId = Nat;
  public type ReviewId = Nat;
  public type CouponId = Nat;
  public type BannerId = Nat;
  public type FlashDealId = Nat;
  public type AddressId = Nat;
  public type LoyaltyTxId = Nat;

  // Shared mutable counter state — passed by reference to all mixins
  public type Counters = {
    var nextProductId : Nat;
    var nextCategoryId : Nat;
    var nextOrderId : Nat;
    var nextReviewId : Nat;
    var nextCouponId : Nat;
    var nextBannerId : Nat;
    var nextFlashDealId : Nat;
    var nextAddressId : Nat;
    var nextLoyaltyTxId : Nat;
    var nextShopLocationId : Nat;
    var nextBundleId : Nat;
    var nextBuyXGetYId : Nat;
    var nextSeasonalCollectionId : Nat;
    var nextWalletTxId : Nat;
    var nextChatMsgId : Nat;
    var nextChatThreadId : Nat;
    var nextStockSubId : Nat;
    var nextInAppNotifId : Nat;
    var nextRecipeId : Nat;
    var nextSubscriptionPlanId : Nat;
    var nextUserSubscriptionId : Nat;
    var nextPriceDropAlertId : Nat;
  };
};
