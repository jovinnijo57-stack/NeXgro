import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import NewFeatureTypes "../types/new-features";
import CatalogTypes "../types/catalog";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  stockSubscriptions : Map.Map<NewFeatureTypes.StockSubId, NewFeatureTypes.StockSubscription>,
  inAppNotifications : Map.Map<NewFeatureTypes.InAppNotifId, NewFeatureTypes.InAppNotification>,
  products : Map.Map<Common.ProductId, CatalogTypes.Product>,
  counters : Common.Counters,
) {
  public shared ({ caller }) func subscribeToStockNotification(productId : Common.ProductId) : async NewFeatureTypes.StockSubId {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };

    // Check if already subscribed
    for ((_, sub) in stockSubscriptions.entries()) {
      if (Principal.equal(sub.userId, caller) and sub.productId == productId) {
        return sub.id;
      };
    };

    let id = counters.nextStockSubId;
    let sub : NewFeatureTypes.StockSubscription = {
      id = id;
      userId = caller;
      productId = productId;
      createdAt = Time.now();
    };
    stockSubscriptions.add(id, sub);
    counters.nextStockSubId += 1;
    id;
  };

  public shared ({ caller }) func unsubscribeStockNotification(productId : Common.ProductId) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    let toRemove = List.empty<NewFeatureTypes.StockSubId>();
    for ((sid, sub) in stockSubscriptions.entries()) {
      if (Principal.equal(sub.userId, caller) and sub.productId == productId) {
        toRemove.add(sid);
      };
    };
    toRemove.forEach(func(sid) { stockSubscriptions.remove(sid) });
  };

  public query ({ caller }) func getUserStockSubscriptions() : async [NewFeatureTypes.StockSubscription] {
    if (caller.isAnonymous()) { return [] };
    let result = List.empty<NewFeatureTypes.StockSubscription>();
    for ((_, sub) in stockSubscriptions.entries()) {
      if (Principal.equal(sub.userId, caller)) {
        result.add(sub);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getInAppNotifications() : async [NewFeatureTypes.InAppNotificationPublic] {
    if (caller.isAnonymous()) { return [] };
    let result = List.empty<NewFeatureTypes.InAppNotificationPublic>();
    for ((_, n) in inAppNotifications.entries()) {
      if (Principal.equal(n.userId, caller)) {
        result.add({
          id = n.id;
          userId = n.userId;
          notifType = n.notifType;
          title = n.title;
          body = n.body;
          productId = n.productId;
          orderId = n.orderId;
          isRead = n.isRead;
          createdAt = n.createdAt;
        });
      };
    };
    // Sort newest first
    let arr = result.toArray();
    arr.sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
  };

  public shared ({ caller }) func markNotificationRead(id : NewFeatureTypes.InAppNotifId) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    switch (inAppNotifications.get(id)) {
      case null { Runtime.trap("Notification not found") };
      case (?n) {
        if (not Principal.equal(n.userId, caller)) {
          Runtime.trap("Unauthorized: not your notification");
        };
        n.isRead := true;
      };
    };
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (caller.isAnonymous()) { return 0 };
    var count = 0;
    for ((_, n) in inAppNotifications.entries()) {
      if (Principal.equal(n.userId, caller) and not n.isRead) {
        count += 1;
      };
    };
    count;
  };

  public shared ({ caller }) func triggerStockBackNotifications(productId : Common.ProductId) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let productName = switch (products.get(productId)) {
      case null { "Product #" # productId.toText() };
      case (?p) p.name;
    };
    var notified = 0;
    let now = Time.now();
    for ((_, sub) in stockSubscriptions.entries()) {
      if (sub.productId == productId) {
        let notifId = counters.nextInAppNotifId;
        let notif : NewFeatureTypes.InAppNotification = {
          id = notifId;
          userId = sub.userId;
          notifType = #stockBack;
          title = "Back in Stock!";
          body = productName # " is now available. Grab it before it's gone!";
          productId = ?productId;
          orderId = null;
          var isRead = false;
          createdAt = now;
        };
        inAppNotifications.add(notifId, notif);
        counters.nextInAppNotifId += 1;
        notified += 1;
      };
    };
    notified;
  };
};
