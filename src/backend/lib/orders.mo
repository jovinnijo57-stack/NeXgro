import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/orders";
import CatalogTypes "../types/catalog";
import Common "../types/common";

module {
  public func validateCoupon(
    coupons : Map.Map<Common.CouponId, Types.Coupon>,
    code : Text,
    subtotal : Nat,
  ) : ?Types.Coupon {
    let now = Time.now();
    for ((_, c) in coupons.entries()) {
      if (c.code == code and c.isActive and c.expirationDate >= now) {
        if (c.usageLimit == 0 or c.usageCount < c.usageLimit) {
          return ?c;
        };
      };
    };
    null;
  };

  public func applyCouponDiscount(coupon : Types.Coupon, subtotal : Nat) : Nat {
    switch (coupon.discountType) {
      case (#percent) {
        let discount = subtotal * coupon.discountValue / 100;
        if (discount > subtotal) { subtotal } else { discount };
      };
      case (#fixed) {
        if (coupon.discountValue > subtotal) { subtotal } else { coupon.discountValue };
      };
    };
  };

  public func calculateOrder(
    items : [Types.OrderItem],
    couponDiscount : Nat,
    loyaltyPointsToRedeem : Nat,
  ) : { subtotal : Nat; deliveryFee : Nat; tax : Nat; total : Nat } {
    var subtotal = 0;
    for (item in items.values()) {
      subtotal += item.priceAtOrder * item.quantity;
    };

    // Apply coupon discount
    let afterCoupon = if (couponDiscount > subtotal) { 0 } else { subtotal - couponDiscount };

    // $2 delivery fee (in cents = 200)
    let deliveryFee : Nat = 200;

    // 8% tax on (afterCoupon + deliveryFee)
    let taxBase = afterCoupon + deliveryFee;
    let tax = taxBase * 8 / 100;

    // Loyalty redemption: 1 point = 1 cent
    let loyaltyDiscount = loyaltyPointsToRedeem;

    var total = afterCoupon + deliveryFee + tax;
    total := if (loyaltyDiscount > total) { 0 } else { total - loyaltyDiscount };

    { subtotal; deliveryFee; tax; total };
  };

  public func buildOrderItems(
    cartItems : List.List<Types.CartItem>,
    products : Map.Map<Common.ProductId, CatalogTypes.Product>,
    userId : Common.UserId,
  ) : [Types.OrderItem] {
    let results = List.empty<Types.OrderItem>();
    cartItems.forEach(func(ci) {
      if (Principal.equal(ci.userId, userId)) {
        switch (products.get(ci.productId)) {
          case (?p) {
            results.add({
              productId = ci.productId;
              quantity = ci.quantity;
              priceAtOrder = p.price;
            });
          };
          case null {};
        };
      };
    });
    results.toArray();
  };

  public func toPublicCoupon(c : Types.Coupon) : Types.CouponPublic {
    {
      id = c.id;
      code = c.code;
      discountType = c.discountType;
      discountValue = c.discountValue;
      expirationDate = c.expirationDate;
      isActive = c.isActive;
      usageLimit = c.usageLimit;
      usageCount = c.usageCount;
    };
  };

  public func toPublicCartItem(c : Types.CartItem) : Types.CartItemPublic {
    {
      userId = c.userId;
      productId = c.productId;
      quantity = c.quantity;
      substituteProductId = c.substituteProductId;
      addedAt = c.addedAt;
    };
  };

  public func toPublicOrder(o : Types.Order) : Types.OrderPublic {
    {
      id = o.id;
      userId = o.userId;
      items = o.items;
      subtotal = o.subtotal;
      deliveryFee = o.deliveryFee;
      tax = o.tax;
      total = o.total;
      couponId = o.couponId;
      loyaltyPointsRedeemed = o.loyaltyPointsRedeemed;
      deliveryAddress = o.deliveryAddress;
      status = o.status;
      statusHistory = o.statusHistory;
      createdAt = o.createdAt;
      estimatedDelivery = o.estimatedDelivery;
      deliverySlot = o.deliverySlot;
      isExpressDelivery = o.isExpressDelivery;
      expressDeliveryFee = o.expressDeliveryFee;
      walletAmountUsed = o.walletAmountUsed;
      totalSavings = o.totalSavings;
      buyXGetYSavings = o.buyXGetYSavings;
    };
  };
};
