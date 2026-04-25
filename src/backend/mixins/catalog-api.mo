import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Storage "mo:caffeineai-object-storage/Storage";
import AccessControl "mo:caffeineai-authorization/access-control";
import CatalogLib "../lib/catalog";
import CatalogTypes "../types/catalog";
import NewFeatureTypes "../types/new-features";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  products : Map.Map<Common.ProductId, CatalogTypes.Product>,
  categories : Map.Map<Common.CategoryId, CatalogTypes.Category>,
  reviews : List.List<CatalogTypes.Review>,
  flashDeals : Map.Map<Common.FlashDealId, CatalogTypes.FlashDeal>,
  banners : Map.Map<Common.BannerId, CatalogTypes.Banner>,
  wishlists : Map.Map<Common.UserId, List.List<Common.ProductId>>,
  stockSubscriptions : Map.Map<NewFeatureTypes.StockSubId, NewFeatureTypes.StockSubscription>,
  inAppNotifications : Map.Map<NewFeatureTypes.InAppNotifId, NewFeatureTypes.InAppNotification>,
  counters : Common.Counters,
) {
  public query func getProducts(filters : CatalogTypes.ProductFilters) : async [CatalogTypes.ProductPublic] {
    CatalogLib.filterProducts(products, filters);
  };

  public query func getProductById(id : Common.ProductId) : async ?CatalogTypes.ProductPublic {
    switch (products.get(id)) {
      case (?p) ?CatalogLib.toPublicProduct(p);
      case null null;
    };
  };

  public query func getCategories() : async [CatalogTypes.CategoryPublic] {
    let result = List.empty<CatalogTypes.CategoryPublic>();
    for ((_, c) in categories.entries()) {
      if (c.isActive) { result.add(CatalogLib.toPublicCategory(c)) };
    };
    result.toArray();
  };

  public query func getFeaturedProducts() : async [CatalogTypes.ProductPublic] {
    CatalogLib.getFeatured(products);
  };

  public query func getBestSellers() : async [CatalogTypes.ProductPublic] {
    CatalogLib.getBestSellers(products);
  };

  public query func getNewArrivals() : async [CatalogTypes.ProductPublic] {
    CatalogLib.getNewArrivals(products);
  };

  public query func getFlashDeals() : async [CatalogTypes.FlashDealPublic] {
    CatalogLib.getActiveFlashDeals(flashDeals);
  };

  public query func getBanners() : async [CatalogTypes.BannerPublic] {
    CatalogLib.getActiveBanners(banners);
  };

  public query func searchProducts(searchQuery : Text, filters : CatalogTypes.ProductFilters) : async [CatalogTypes.ProductPublic] {
    CatalogLib.searchProducts(products, searchQuery, filters);
  };

  // Fetch multiple products by IDs — used for product comparison feature
  public query func getProductsByIds(ids : [Common.ProductId]) : async [CatalogTypes.ProductPublic] {
    let result = List.empty<CatalogTypes.ProductPublic>();
    for (id in ids.values()) {
      switch (products.get(id)) {
        case (?p) { result.add(CatalogLib.toPublicProduct(p)) };
        case null {};
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getProductReviews(productId : Common.ProductId) : async [CatalogTypes.ReviewPublic] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let result = List.empty<CatalogTypes.ReviewPublic>();
    reviews.forEach(func(r) {
      if (r.productId == productId and (isAdmin or r.isApproved)) {
        result.add(CatalogLib.toPublicReview(r));
      };
    });
    result.toArray();
  };

  public query ({ caller }) func getUserWishlist() : async [Common.ProductId] {
    if (caller.isAnonymous()) { return [] };
    switch (wishlists.get(caller)) {
      case null [];
      case (?wl) wl.toArray();
    };
  };

  public shared ({ caller }) func addToWishlist(productId : Common.ProductId) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    switch (wishlists.get(caller)) {
      case null {
        let wl = List.empty<Common.ProductId>();
        wl.add(productId);
        wishlists.add(caller, wl);
      };
      case (?wl) {
        // Only add if not already present
        let exists = wl.find(func(pid) { pid == productId });
        switch (exists) {
          case null { wl.add(productId) };
          case (?_) {};
        };
      };
    };
  };

  public shared ({ caller }) func removeFromWishlist(productId : Common.ProductId) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    switch (wishlists.get(caller)) {
      case null {};
      case (?wl) {
        let filtered = wl.filter(func(pid) { pid != productId });
        wishlists.add(caller, filtered);
      };
    };
  };

  public shared ({ caller }) func submitReview(
    productId : Common.ProductId,
    rating : Nat,
    title : Text,
    text : Text,
  ) : async Common.ReviewId {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    if (rating < 1 or rating > 5) { Runtime.trap("Rating must be 1-5") };
    let id = counters.nextReviewId;
    let review : CatalogTypes.Review = {
      id = id;
      productId = productId;
      userId = caller;
      rating = rating;
      title = title;
      text = text;
      var isApproved = false;
      var helpfulCount = 0;
      createdAt = Time.now();
    };
    reviews.add(review);
    counters.nextReviewId += 1;
    id;
  };

  public shared ({ caller }) func createProduct(
    name : Text,
    description : Text,
    price : Nat,
    categoryId : Common.CategoryId,
    imageBlob : Storage.ExternalBlob,
    stockQty : Nat,
    isFeatured : Bool,
    isBestSeller : Bool,
    isNewArrival : Bool,
    harvestDate : ?Int,
    bestBeforeDate : ?Int,
    bundleId : ?Nat,
    ageRestricted : Bool,
    ageCategory : ?NewFeatureTypes.AgeGatedCategory,
  ) : async Common.ProductId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let id = counters.nextProductId;
    let prod : CatalogTypes.Product = {
      id = id;
      var name = name;
      var description = description;
      var price = price;
      var categoryId = categoryId;
      var imageBlob = imageBlob;
      var stockQty = stockQty;
      var rating = 0;
      var reviewCount = 0;
      var isActive = true;
      var isFeatured = isFeatured;
      var isBestSeller = isBestSeller;
      var isNewArrival = isNewArrival;
      var harvestDate = harvestDate;
      var bestBeforeDate = bestBeforeDate;
      var bundleId = bundleId;
      var ageRestricted = ageRestricted;
      var ageCategory = ageCategory;
      createdAt = Time.now();
    };
    products.add(id, prod);
    counters.nextProductId += 1;
    id;
  };

  public shared ({ caller }) func updateProduct(
    id : Common.ProductId,
    name : Text,
    description : Text,
    price : Nat,
    categoryId : Common.CategoryId,
    imageBlob : Storage.ExternalBlob,
    stockQty : Nat,
    isActive : Bool,
    isFeatured : Bool,
    isBestSeller : Bool,
    isNewArrival : Bool,
    harvestDate : ?Int,
    bestBeforeDate : ?Int,
    bundleId : ?Nat,
    ageRestricted : Bool,
    ageCategory : ?NewFeatureTypes.AgeGatedCategory,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (products.get(id)) {
      case null { Runtime.trap("Product not found") };
      case (?p) {
        let wasUnavailable = not p.isActive;
        p.name := name;
        p.description := description;
        p.price := price;
        p.categoryId := categoryId;
        p.imageBlob := imageBlob;
        p.stockQty := stockQty;
        p.isActive := isActive;
        p.isFeatured := isFeatured;
        p.isBestSeller := isBestSeller;
        p.isNewArrival := isNewArrival;
        p.harvestDate := harvestDate;
        p.bestBeforeDate := bestBeforeDate;
        p.bundleId := bundleId;
        p.ageRestricted := ageRestricted;
        p.ageCategory := ageCategory;

        // If product just became available again, notify subscribers
        if (wasUnavailable and isActive and stockQty > 0) {
          let now = Time.now();
          for ((_, sub) in stockSubscriptions.entries()) {
            if (sub.productId == id) {
              let notifId = counters.nextInAppNotifId;
              let notif : NewFeatureTypes.InAppNotification = {
                id = notifId;
                userId = sub.userId;
                notifType = #stockBack;
                title = "Back in Stock!";
                body = name # " is now available. Grab it before it's gone!";
                productId = ?id;
                orderId = null;
                var isRead = false;
                createdAt = now;
              };
              inAppNotifications.add(notifId, notif);
              counters.nextInAppNotifId += 1;
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func setProductFreshness(
    productId : Common.ProductId,
    harvestDate : ?Int,
    bestBeforeDate : ?Int,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (products.get(productId)) {
      case null { Runtime.trap("Product not found") };
      case (?p) {
        p.harvestDate := harvestDate;
        p.bestBeforeDate := bestBeforeDate;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Common.ProductId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    products.remove(id);
  };

  public shared ({ caller }) func createCategory(
    name : Text,
    displayOrder : Nat,
    iconEmoji : Text,
  ) : async Common.CategoryId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let id = counters.nextCategoryId;
    let cat : CatalogTypes.Category = {
      id = id;
      name = name;
      var displayOrder = displayOrder;
      var isActive = true;
      iconEmoji = iconEmoji;
    };
    categories.add(id, cat);
    counters.nextCategoryId += 1;
    id;
  };

  public shared ({ caller }) func updateCategory(
    id : Common.CategoryId,
    name : Text,
    displayOrder : Nat,
    isActive : Bool,
    iconEmoji : Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (categories.get(id)) {
      case null { Runtime.trap("Category not found") };
      case (?c) {
        // name and iconEmoji are immutable — re-insert updated record
        let updated : CatalogTypes.Category = {
          id = id;
          name = name;
          var displayOrder = displayOrder;
          var isActive = isActive;
          iconEmoji = iconEmoji;
        };
        categories.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Common.CategoryId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    categories.remove(id);
  };

  public shared ({ caller }) func createBanner(
    imageBlob : Storage.ExternalBlob,
    title : Text,
    link : Text,
    displayOrder : Nat,
  ) : async Common.BannerId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let id = counters.nextBannerId;
    let banner : CatalogTypes.Banner = {
      id = id;
      imageBlob = imageBlob;
      title = title;
      link = link;
      var displayOrder = displayOrder;
      var isActive = true;
      createdAt = Time.now();
    };
    banners.add(id, banner);
    counters.nextBannerId += 1;
    id;
  };

  public shared ({ caller }) func updateBanner(
    id : Common.BannerId,
    imageBlob : Storage.ExternalBlob,
    title : Text,
    link : Text,
    displayOrder : Nat,
    isActive : Bool,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (banners.get(id)) {
      case null { Runtime.trap("Banner not found") };
      case (?b) {
        let updated : CatalogTypes.Banner = {
          id = id;
          imageBlob = imageBlob;
          title = title;
          link = link;
          var displayOrder = displayOrder;
          var isActive = isActive;
          createdAt = b.createdAt;
        };
        banners.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteBanner(id : Common.BannerId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    banners.remove(id);
  };

  public shared ({ caller }) func createFlashDeal(
    productId : Common.ProductId,
    discountPercent : Nat,
    startDateTime : Common.Timestamp,
    endDateTime : Common.Timestamp,
  ) : async Common.FlashDealId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let id = counters.nextFlashDealId;
    let fd : CatalogTypes.FlashDeal = {
      id = id;
      productId = productId;
      discountPercent = discountPercent;
      startDateTime = startDateTime;
      endDateTime = endDateTime;
      var isActive = true;
    };
    flashDeals.add(id, fd);
    counters.nextFlashDealId += 1;
    id;
  };

  public shared ({ caller }) func updateFlashDeal(
    id : Common.FlashDealId,
    discountPercent : Nat,
    startDateTime : Common.Timestamp,
    endDateTime : Common.Timestamp,
    isActive : Bool,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (flashDeals.get(id)) {
      case null { Runtime.trap("Flash deal not found") };
      case (?fd) {
        let updated : CatalogTypes.FlashDeal = {
          id = id;
          productId = fd.productId;
          discountPercent = discountPercent;
          startDateTime = startDateTime;
          endDateTime = endDateTime;
          var isActive = isActive;
        };
        flashDeals.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteFlashDeal(id : Common.FlashDealId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    flashDeals.remove(id);
  };

  public shared ({ caller }) func approveReview(id : Common.ReviewId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    reviews.mapInPlace(func(r) {
      if (r.id == id) { r.isApproved := true };
      r;
    });
    // Recalculate product rating after approval
    switch (reviews.find(func(r) { r.id == id })) {
      case (?r) { CatalogLib.updateProductRating(products, r.productId, reviews) };
      case null {};
    };
  };

  public shared ({ caller }) func rejectReview(id : Common.ReviewId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    reviews.mapInPlace(func(r) {
      if (r.id == id) { r.isApproved := false };
      r;
    });
  };

  public query ({ caller }) func getReviews(approved : Bool) : async [CatalogTypes.ReviewPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<CatalogTypes.ReviewPublic>();
    reviews.forEach(func(r) {
      if (r.isApproved == approved) {
        result.add(CatalogLib.toPublicReview(r));
      };
    });
    result.toArray();
  };
};
