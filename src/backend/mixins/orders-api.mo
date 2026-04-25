import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import OrderLib "../lib/orders";
import UserLib "../lib/users";
import OrderTypes "../types/orders";
import CatalogTypes "../types/catalog";
import UserTypes "../types/users";
import NewFeatureTypes "../types/new-features";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  orders : Map.Map<Common.OrderId, OrderTypes.Order>,
  cartItems : Map.Map<Common.UserId, List.List<OrderTypes.CartItem>>,
  coupons : Map.Map<Common.CouponId, OrderTypes.Coupon>,
  products : Map.Map<Common.ProductId, CatalogTypes.Product>,
  users : Map.Map<Common.UserId, UserTypes.User>,
  loyaltyTxs : List.List<UserTypes.LoyaltyTransaction>,
  addresses : Map.Map<Common.AddressId, UserTypes.SavedAddress>,
  wallets : Map.Map<Common.UserId, NewFeatureTypes.Wallet>,
  walletTransactions : Map.Map<NewFeatureTypes.WalletTxId, NewFeatureTypes.WalletTransaction>,
  buyXGetYRules : Map.Map<NewFeatureTypes.BuyXGetYRuleId, NewFeatureTypes.BuyXGetYRule>,
  flashDeals : Map.Map<Common.FlashDealId, CatalogTypes.FlashDeal>,
  counters : Common.Counters,
) {
  public query ({ caller }) func getUserOrders() : async [OrderTypes.OrderPublic] {
    if (caller.isAnonymous()) { return [] };
    let result = List.empty<OrderTypes.OrderPublic>();
    for ((_, o) in orders.entries()) {
      if (o.userId == caller) {
        result.add(OrderLib.toPublicOrder(o));
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getOrderById(id : Common.OrderId) : async ?OrderTypes.OrderPublic {
    if (caller.isAnonymous()) { return null };
    switch (orders.get(id)) {
      case null null;
      case (?o) {
        if (o.userId == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?OrderLib.toPublicOrder(o);
        } else {
          Runtime.trap("Unauthorized: not your order");
        };
      };
    };
  };

  public query ({ caller }) func getUserCart() : async [OrderTypes.CartItemPublic] {
    if (caller.isAnonymous()) { return [] };
    switch (cartItems.get(caller)) {
      case null [];
      case (?cart) {
        let result = List.empty<OrderTypes.CartItemPublic>();
        cart.forEach(func(ci) {
          result.add(OrderLib.toPublicCartItem(ci));
        });
        result.toArray();
      };
    };
  };

  public query ({ caller }) func getCoupons() : async [OrderTypes.CouponPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<OrderTypes.CouponPublic>();
    for ((_, c) in coupons.entries()) {
      result.add(OrderLib.toPublicCoupon(c));
    };
    result.toArray();
  };

  public query ({ caller }) func getOrders() : async [OrderTypes.OrderPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<OrderTypes.OrderPublic>();
    for ((_, o) in orders.entries()) {
      result.add(OrderLib.toPublicOrder(o));
    };
    result.toArray();
  };

  public shared ({ caller }) func addToCart(productId : Common.ProductId, qty : Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    if (qty == 0) { Runtime.trap("Quantity must be > 0") };
    switch (cartItems.get(caller)) {
      case null {
        let cart = List.empty<OrderTypes.CartItem>();
        cart.add({
          userId = caller;
          productId = productId;
          var quantity = qty;
          var substituteProductId = (null : ?Nat);
          addedAt = Time.now();
        });
        cartItems.add(caller, cart);
      };
      case (?cart) {
        let existing = cart.find(func(ci) { ci.productId == productId });
        switch (existing) {
          case (?ci) { ci.quantity += qty };
          case null {
            cart.add({
              userId = caller;
              productId = productId;
              var quantity = qty;
              var substituteProductId = (null : ?Nat);
              addedAt = Time.now();
            });
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : Common.ProductId) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    switch (cartItems.get(caller)) {
      case null {};
      case (?cart) {
        let filtered = cart.filter(func(ci) { ci.productId != productId });
        cartItems.add(caller, filtered);
      };
    };
  };

  public shared ({ caller }) func updateCartQty(productId : Common.ProductId, qty : Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    if (qty == 0) {
      switch (cartItems.get(caller)) {
        case null {};
        case (?cart) {
          let filtered = cart.filter(func(ci) { ci.productId != productId });
          cartItems.add(caller, filtered);
        };
      };
    } else {
      switch (cartItems.get(caller)) {
        case null {};
        case (?cart) {
          cart.mapInPlace(func(ci) {
            if (ci.productId == productId) { ci.quantity := qty };
            ci;
          });
        };
      };
    };
  };

  public shared ({ caller }) func setSubstituteProduct(productId : Common.ProductId, substituteId : ?Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    switch (cartItems.get(caller)) {
      case null { Runtime.trap("Cart is empty") };
      case (?cart) {
        cart.mapInPlace(func(ci) {
          if (ci.productId == productId) { ci.substituteProductId := substituteId };
          ci;
        });
      };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    cartItems.remove(caller);
  };

  public shared ({ caller }) func placeOrder(
    addressId : Common.AddressId,
    couponCode : ?Text,
    loyaltyPointsToRedeem : Nat,
    deliverySlot : ?Text,
    isExpressDelivery : Bool,
    walletAmountToUse : Nat,
  ) : async OrderTypes.PlaceOrderResult {
    if (caller.isAnonymous()) { return #err("Not authenticated") };

    // Get user cart
    let userCart = switch (cartItems.get(caller)) {
      case null { return #err("Cart is empty") };
      case (?cart) {
        if (cart.isEmpty()) { return #err("Cart is empty") };
        cart;
      };
    };

    // Build order items
    let orderItems = OrderLib.buildOrderItems(userCart, products, caller);
    if (orderItems.size() == 0) { return #err("No valid items in cart") };

    // Get delivery address
    let addr = switch (addresses.get(addressId)) {
      case null { return #err("Address not found") };
      case (?a) {
        if (a.userId != caller) { return #err("Not your address") };
        a;
      };
    };

    // Validate coupon if provided
    var couponDiscount = 0;
    var usedCouponId : ?Common.CouponId = null;
    var usedCoupon : ?OrderTypes.Coupon = null;
    var rawSubtotal = 0;
    for (item in orderItems.values()) {
      rawSubtotal += item.priceAtOrder * item.quantity;
    };

    switch (couponCode) {
      case null {};
      case (?code) {
        switch (OrderLib.validateCoupon(coupons, code, rawSubtotal)) {
          case null { return #err("Invalid or expired coupon: " # code) };
          case (?c) {
            couponDiscount := OrderLib.applyCouponDiscount(c, rawSubtotal);
            usedCouponId := ?c.id;
            usedCoupon := ?c;
          };
        };
      };
    };

    // Get user for loyalty validation
    let user = switch (users.get(caller)) {
      case null { return #err("User not found") };
      case (?u) u;
    };

    // Validate loyalty points redemption
    let pointsToRedeem = if (loyaltyPointsToRedeem > user.loyaltyBalance) {
      user.loyaltyBalance
    } else {
      loyaltyPointsToRedeem
    };

    // Calculate flash deal savings on items
    let now = Time.now();
    var flashDealSavings = 0;
    for (item in orderItems.values()) {
      for ((_, fd) in flashDeals.entries()) {
        if (fd.productId == item.productId and fd.isActive and fd.startDateTime <= now and fd.endDateTime >= now) {
          let saving = item.priceAtOrder * item.quantity * fd.discountPercent / 100;
          flashDealSavings += saving;
        };
      };
    };

    // Apply Buy X Get Y rules
    var buyXGetYSavings = 0;
    for ((_, rule) in buyXGetYRules.entries()) {
      if (rule.isActive) {
        // Count how many buy-product the user has
        var buyCount = 0;
        for (item in orderItems.values()) {
          if (item.productId == rule.buyProductId) {
            buyCount += item.quantity;
          };
        };
        // How many sets trigger the rule
        let sets = buyCount / rule.buyQty;
        if (sets > 0) {
          // Find price of the free product
          switch (products.get(rule.getProductId)) {
            case null {};
            case (?p) {
              buyXGetYSavings += p.price * (sets * rule.getQty);
            };
          };
        };
      };
    };

    // Validate wallet amount to use
    let walletBalance = switch (wallets.get(caller)) {
      case null 0;
      case (?w) w.balanceCents;
    };
    let actualWalletUsed = if (walletAmountToUse > walletBalance) { walletBalance } else { walletAmountToUse };

    // Express delivery fee: +500 cents if express
    let expressFee : Nat = if (isExpressDelivery) { 500 } else { 0 };

    // Calculate order totals
    let calc = OrderLib.calculateOrder(orderItems, couponDiscount, pointsToRedeem);
    var finalTotal = calc.total + expressFee;

    // Apply wallet deduction
    finalTotal := if (actualWalletUsed > finalTotal) { 0 } else { finalTotal - actualWalletUsed };

    // Apply BuyXGetY savings to total
    finalTotal := if (buyXGetYSavings > finalTotal) { 0 } else { finalTotal - buyXGetYSavings };

    // Total savings = coupon + loyalty + buyXGetY + flash deals
    let loyaltyDiscountCents = pointsToRedeem; // 1 pt = 1 cent
    let totalSavings = couponDiscount + loyaltyDiscountCents + buyXGetYSavings + flashDealSavings;

    // Check stock for all items
    for (item in orderItems.values()) {
      switch (products.get(item.productId)) {
        case null { return #err("Product not found: " # debug_show(item.productId)) };
        case (?p) {
          if (p.stockQty < item.quantity) {
            return #err("Insufficient stock for: " # p.name);
          };
        };
      };
    };

    // Deduct stock
    for (item in orderItems.values()) {
      switch (products.get(item.productId)) {
        case null {};
        case (?p) { p.stockQty -= item.quantity };
      };
    };

    // Deduct wallet balance
    if (actualWalletUsed > 0) {
      switch (wallets.get(caller)) {
        case null {};
        case (?w) {
          w.balanceCents := if (actualWalletUsed > w.balanceCents) { 0 } else { w.balanceCents - actualWalletUsed };
          let txId = counters.nextWalletTxId;
          let tx : NewFeatureTypes.WalletTransaction = {
            id = txId;
            userId = caller;
            amount = -Int.fromNat(actualWalletUsed);
            txType = #orderDeduction;
            description = "Order payment";
            orderId = ?counters.nextOrderId;
            createdAt = now;
          };
          walletTransactions.add(txId, tx);
          counters.nextWalletTxId += 1;
        };
      };
    };

    // Build delivery address record
    let deliveryAddr : OrderTypes.DeliveryAddress = {
      street = addr.street;
      city = addr.city;
      state = addr.state;
      zip = addr.zip;
      phone = addr.phone;
      tag = addr.tag;
    };

    let orderId = counters.nextOrderId;

    let order : OrderTypes.Order = {
      id = orderId;
      userId = caller;
      items = orderItems;
      subtotal = calc.subtotal;
      deliveryFee = calc.deliveryFee + expressFee;
      tax = calc.tax;
      total = finalTotal;
      couponId = usedCouponId;
      loyaltyPointsRedeemed = pointsToRedeem;
      deliveryAddress = deliveryAddr;
      deliverySlot = deliverySlot;
      isExpressDelivery = isExpressDelivery;
      expressDeliveryFee = expressFee;
      walletAmountUsed = actualWalletUsed;
      totalSavings = totalSavings;
      buyXGetYSavings = buyXGetYSavings;
      var status = #Pending;
      var statusHistory = [{ status = #Pending; timestamp = now }];
      createdAt = now;
      estimatedDelivery = ?(now + (if (isExpressDelivery) { 600_000_000_000 } else { 3 * 24 * 60 * 60 * 1_000_000_000 }));
    };
    orders.add(orderId, order);
    counters.nextOrderId += 1;

    // Update coupon usage count
    switch (usedCoupon) {
      case null {};
      case (?c) { c.usageCount += 1 };
    };

    // Deduct loyalty points if redeemed
    if (pointsToRedeem > 0) {
      let _ = UserLib.addLoyaltyPoints(user, loyaltyTxs, counters.nextLoyaltyTxId, -Int.fromNat(pointsToRedeem), #redemption, ?orderId);
      counters.nextLoyaltyTxId += 1;
    };

    // Award loyalty points: 1 point per dollar (total in cents / 100)
    let pointsEarned = finalTotal / 100;
    if (pointsEarned > 0) {
      let _ = UserLib.addLoyaltyPoints(user, loyaltyTxs, counters.nextLoyaltyTxId, Int.fromNat(pointsEarned), #purchase, ?orderId);
      counters.nextLoyaltyTxId += 1;
    };

    // Referral bonus: 100 pts each for first order
    var userOrderCount = 0;
    for ((_, o) in orders.entries()) {
      if (o.userId == caller) { userOrderCount += 1 };
    };
    if (userOrderCount == 1) {
      switch (user.referredBy) {
        case null {};
        case (?referrerId) {
          let _ = UserLib.addLoyaltyPoints(user, loyaltyTxs, counters.nextLoyaltyTxId, 100, #referral, ?orderId);
          counters.nextLoyaltyTxId += 1;
          switch (users.get(referrerId)) {
            case null {};
            case (?referrer) {
              let _ = UserLib.addLoyaltyPoints(referrer, loyaltyTxs, counters.nextLoyaltyTxId, 100, #referral, ?orderId);
              counters.nextLoyaltyTxId += 1;
            };
          };
        };
      };
    };

    // Clear cart
    cartItems.remove(caller);

    #ok(orderId);
  };

  public shared ({ caller }) func updateOrderStatus(
    orderId : Common.OrderId,
    status : OrderTypes.OrderStatus,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (orders.get(orderId)) {
      case null { Runtime.trap("Order not found") };
      case (?o) {
        let now = Time.now();
        o.status := status;
        o.statusHistory := o.statusHistory.concat([{ status = status; timestamp = now }]);
      };
    };
  };

  public shared ({ caller }) func createCoupon(
    code : Text,
    discountType : { #percent; #fixed },
    discountValue : Nat,
    expirationDate : Common.Timestamp,
    usageLimit : Nat,
  ) : async Common.CouponId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let id = counters.nextCouponId;
    let coupon : OrderTypes.Coupon = {
      id = id;
      code = code;
      discountType = discountType;
      discountValue = discountValue;
      expirationDate = expirationDate;
      var isActive = true;
      usageLimit = usageLimit;
      var usageCount = 0;
    };
    coupons.add(id, coupon);
    counters.nextCouponId += 1;
    id;
  };

  public shared ({ caller }) func updateCoupon(
    id : Common.CouponId,
    discountType : { #percent; #fixed },
    discountValue : Nat,
    expirationDate : Common.Timestamp,
    isActive : Bool,
    usageLimit : Nat,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (coupons.get(id)) {
      case null { Runtime.trap("Coupon not found") };
      case (?c) {
        let updated : OrderTypes.Coupon = {
          id = id;
          code = c.code;
          discountType = discountType;
          discountValue = discountValue;
          expirationDate = expirationDate;
          var isActive = isActive;
          usageLimit = usageLimit;
          var usageCount = c.usageCount;
        };
        coupons.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteCoupon(id : Common.CouponId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    coupons.remove(id);
  };
};
