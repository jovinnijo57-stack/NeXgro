import Common "common";

module {
  public type DeliveryAddress = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    phone : Text;
    tag : Text;
  };

  public type OrderItem = {
    productId : Common.ProductId;
    quantity : Nat;
    priceAtOrder : Nat;
  };

  public type OrderStatus = {
    #Pending;
    #Processing;
    #Shipped;
    #Delivered;
    #Cancelled;
  };

  public type StatusHistoryEntry = {
    status : OrderStatus;
    timestamp : Common.Timestamp;
  };

  public type Order = {
    id : Common.OrderId;
    userId : Common.UserId;
    items : [OrderItem];
    subtotal : Nat;
    deliveryFee : Nat;
    tax : Nat;
    total : Nat;
    couponId : ?Common.CouponId;
    loyaltyPointsRedeemed : Nat;
    deliveryAddress : DeliveryAddress;
    deliverySlot : ?Text;
    isExpressDelivery : Bool;
    expressDeliveryFee : Nat;
    walletAmountUsed : Nat;
    totalSavings : Nat;
    buyXGetYSavings : Nat;
    var status : OrderStatus;
    var statusHistory : [StatusHistoryEntry];
    createdAt : Common.Timestamp;
    estimatedDelivery : ?Common.Timestamp;
  };

  public type OrderPublic = {
    id : Common.OrderId;
    userId : Common.UserId;
    items : [OrderItem];
    subtotal : Nat;
    deliveryFee : Nat;
    tax : Nat;
    total : Nat;
    couponId : ?Common.CouponId;
    loyaltyPointsRedeemed : Nat;
    deliveryAddress : DeliveryAddress;
    deliverySlot : ?Text;
    isExpressDelivery : Bool;
    expressDeliveryFee : Nat;
    walletAmountUsed : Nat;
    totalSavings : Nat;
    buyXGetYSavings : Nat;
    status : OrderStatus;
    statusHistory : [StatusHistoryEntry];
    createdAt : Common.Timestamp;
    estimatedDelivery : ?Common.Timestamp;
  };

  public type CartItem = {
    userId : Common.UserId;
    productId : Common.ProductId;
    var quantity : Nat;
    var substituteProductId : ?Nat;
    addedAt : Common.Timestamp;
  };

  public type CartItemPublic = {
    userId : Common.UserId;
    productId : Common.ProductId;
    quantity : Nat;
    substituteProductId : ?Nat;
    addedAt : Common.Timestamp;
  };

  public type WishlistItem = {
    userId : Common.UserId;
    productId : Common.ProductId;
    addedAt : Common.Timestamp;
  };

  public type Coupon = {
    id : Common.CouponId;
    code : Text;
    discountType : { #percent; #fixed };
    discountValue : Nat;
    expirationDate : Common.Timestamp;
    var isActive : Bool;
    usageLimit : Nat;
    var usageCount : Nat;
  };

  public type CouponPublic = {
    id : Common.CouponId;
    code : Text;
    discountType : { #percent; #fixed };
    discountValue : Nat;
    expirationDate : Common.Timestamp;
    isActive : Bool;
    usageLimit : Nat;
    usageCount : Nat;
  };

  public type PlaceOrderResult = {
    #ok : Common.OrderId;
    #err : Text;
  };
};
