import Map "mo:core/Map";
import List "mo:core/List";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import OrderTypes "../types/orders";
import CatalogTypes "../types/catalog";
import UserTypes "../types/users";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  users : Map.Map<Common.UserId, UserTypes.User>,
  orders : Map.Map<Common.OrderId, OrderTypes.Order>,
  products : Map.Map<Common.ProductId, CatalogTypes.Product>,
  categories : Map.Map<Common.CategoryId, CatalogTypes.Category>,
  coupons : Map.Map<Common.CouponId, OrderTypes.Coupon>,
  reviews : List.List<CatalogTypes.Review>,
) {
  public type AdminStats = {
    totalOrders : Nat;
    totalRevenue : Nat;
    totalUsers : Nat;
    activeProducts : Nat;
    pendingReviews : Nat;
    lowStockCount : Nat;
    totalRevenue30Days : Nat;
    ordersByDay : [(Text, Nat)];
    topProducts : [(Nat, Text, Nat)];
    userGrowthByDay : [(Text, Nat)];
    totalSavingsDistributed : Nat;
  };

  // Convert nanosecond timestamp to "YYYY-MM-DD" date string
  func timestampToDateKey(ts : Int) : Text {
    // ts is nanoseconds since epoch. Convert to seconds.
    let secs = ts / 1_000_000_000;
    // Simple approximate date computation (good enough for grouping)
    // Days since epoch
    let days = secs / 86400;
    // Zeller's-adjacent: approximate year/month/day
    let z = days + 719468;
    let era = (if (z >= 0) { z } else { z - 146096 }) / 146097;
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = mp + (if (mp < 10) { 3 } else { -9 });
    let yr = y + (if (m <= 2) { 1 } else { 0 });
    // Format as YYYY-MM-DD
    let ys = yr.toText();
    let ms = if (m < 10) { "0" # m.toText() } else { m.toText() };
    let ds = if (d < 10) { "0" # d.toText() } else { d.toText() };
    ys # "-" # ms # "-" # ds;
  };

  public query ({ caller }) func getAdminStats() : async AdminStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };

    let now = Time.now();
    let thirtyDaysNs : Int = 30 * 24 * 60 * 60 * 1_000_000_000;
    let cutoff = now - thirtyDaysNs;

    var totalOrders = 0;
    var totalRevenue = 0;
    var totalRevenue30Days = 0;
    var totalSavingsDistributed = 0;

    // Track orders per day and units per product
    let dayOrderMap = Map.empty<Text, Nat>();
    let productUnitsMap = Map.empty<Nat, Nat>();

    for ((_, o) in orders.entries()) {
      totalOrders += 1;
      totalRevenue += o.total;
      totalSavingsDistributed += o.totalSavings;
      if (o.createdAt >= cutoff) {
        totalRevenue30Days += o.total;
        let key = timestampToDateKey(o.createdAt);
        let prev = switch (dayOrderMap.get(key)) { case null 0; case (?n) n };
        dayOrderMap.add(key, prev + 1);
      };
      // Count product units sold
      for (item in o.items.values()) {
        let prev = switch (productUnitsMap.get(item.productId)) { case null 0; case (?n) n };
        productUnitsMap.add(item.productId, prev + item.quantity);
      };
    };

    let totalUsers = users.size();

    var activeProducts = 0;
    var lowStockCount = 0;
    for ((_, p) in products.entries()) {
      if (p.isActive) { activeProducts += 1 };
      if (p.stockQty < 5) { lowStockCount += 1 };
    };

    var pendingReviews = 0;
    reviews.forEach(func(r) {
      if (not r.isApproved) { pendingReviews += 1 };
    });

    // Build ordersByDay sorted array (last 30 days)
    let ordersByDayList = List.empty<(Text, Nat)>();
    for ((day, cnt) in dayOrderMap.entries()) {
      ordersByDayList.add((day, cnt));
    };
    let ordersByDayArr = ordersByDayList.toArray();
    let ordersByDay = ordersByDayArr.sort(func(a, b) = Text.compare(a.0, b.0));

    // Build top 5 products by units sold
    let productUnitsList = List.empty<(Nat, Nat)>();
    for ((pid, units) in productUnitsMap.entries()) {
      productUnitsList.add((pid, units));
    };
    let sortedProducts = productUnitsList.toArray().sort(func(a, b) {
      // descending
      if (a.1 > b.1) { #less } else if (a.1 < b.1) { #greater } else { #equal }
    });
    let topCount = if (sortedProducts.size() < 5) { sortedProducts.size() } else { 5 };
    let topProductsList = List.empty<(Nat, Text, Nat)>();
    var ti = 0;
    while (ti < topCount) {
      let (pid, units) = sortedProducts[ti];
      let pname = switch (products.get(pid)) { case null "Unknown"; case (?p) p.name };
      topProductsList.add((pid, pname, units));
      ti += 1;
    };
    let topProducts = topProductsList.toArray();

    // User growth by day (last 30 days)
    let userDayMap = Map.empty<Text, Nat>();
    for ((_, u) in users.entries()) {
      if (u.createdAt >= cutoff) {
        let key = timestampToDateKey(u.createdAt);
        let prev = switch (userDayMap.get(key)) { case null 0; case (?n) n };
        userDayMap.add(key, prev + 1);
      };
    };
    let userGrowthList = List.empty<(Text, Nat)>();
    for ((day, cnt) in userDayMap.entries()) {
      userGrowthList.add((day, cnt));
    };
    let userGrowthArr = userGrowthList.toArray();
    let userGrowthByDay = userGrowthArr.sort(func(a, b) = Text.compare(a.0, b.0));

    {
      totalOrders = totalOrders;
      totalRevenue = totalRevenue;
      totalUsers = totalUsers;
      activeProducts = activeProducts;
      pendingReviews = pendingReviews;
      lowStockCount = lowStockCount;
      totalRevenue30Days = totalRevenue30Days;
      ordersByDay = ordersByDay;
      topProducts = topProducts;
      userGrowthByDay = userGrowthByDay;
      totalSavingsDistributed = totalSavingsDistributed;
    };
  };
};
