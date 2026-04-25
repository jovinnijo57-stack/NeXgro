import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Storage "mo:caffeineai-object-storage/Storage";
import AccessControl "mo:caffeineai-authorization/access-control";
import NewFeatureTypes "../types/new-features";
import CatalogTypes "../types/catalog";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  buyXGetYRules : Map.Map<NewFeatureTypes.BuyXGetYRuleId, NewFeatureTypes.BuyXGetYRule>,
  bundles : Map.Map<NewFeatureTypes.BundleId, NewFeatureTypes.Bundle>,
  seasonalCollections : Map.Map<NewFeatureTypes.SeasonalCollectionId, NewFeatureTypes.SeasonalCollection>,
  products : Map.Map<Common.ProductId, CatalogTypes.Product>,
  counters : Common.Counters,
) {
  // ─── Buy X Get Y ──────────────────────────────────────────────────────────

  public query func getBuyXGetYRules() : async [NewFeatureTypes.BuyXGetYRulePublic] {
    let result = List.empty<NewFeatureTypes.BuyXGetYRulePublic>();
    for ((_, r) in buyXGetYRules.entries()) {
      if (r.isActive) {
        result.add({
          id = r.id;
          name = r.name;
          buyProductId = r.buyProductId;
          buyQty = r.buyQty;
          getProductId = r.getProductId;
          getQty = r.getQty;
          isActive = r.isActive;
          createdAt = r.createdAt;
        });
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getAdminBuyXGetYRules() : async [NewFeatureTypes.BuyXGetYRulePublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<NewFeatureTypes.BuyXGetYRulePublic>();
    for ((_, r) in buyXGetYRules.entries()) {
      result.add({
        id = r.id;
        name = r.name;
        buyProductId = r.buyProductId;
        buyQty = r.buyQty;
        getProductId = r.getProductId;
        getQty = r.getQty;
        isActive = r.isActive;
        createdAt = r.createdAt;
      });
    };
    result.toArray();
  };

  public shared ({ caller }) func createBuyXGetYRule(
    name : Text,
    buyProductId : Common.ProductId,
    buyQty : Nat,
    getProductId : Common.ProductId,
    getQty : Nat,
  ) : async NewFeatureTypes.BuyXGetYRuleId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let id = counters.nextBuyXGetYId;
    let rule : NewFeatureTypes.BuyXGetYRule = {
      id = id;
      var name = name;
      var buyProductId = buyProductId;
      var buyQty = buyQty;
      var getProductId = getProductId;
      var getQty = getQty;
      var isActive = true;
      createdAt = Time.now();
    };
    buyXGetYRules.add(id, rule);
    counters.nextBuyXGetYId += 1;
    id;
  };

  public shared ({ caller }) func updateBuyXGetYRule(
    id : NewFeatureTypes.BuyXGetYRuleId,
    name : Text,
    buyProductId : Common.ProductId,
    buyQty : Nat,
    getProductId : Common.ProductId,
    getQty : Nat,
    isActive : Bool,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (buyXGetYRules.get(id)) {
      case null { Runtime.trap("Rule not found") };
      case (?r) {
        r.name := name;
        r.buyProductId := buyProductId;
        r.buyQty := buyQty;
        r.getProductId := getProductId;
        r.getQty := getQty;
        r.isActive := isActive;
      };
    };
  };

  public shared ({ caller }) func deleteBuyXGetYRule(id : NewFeatureTypes.BuyXGetYRuleId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    buyXGetYRules.remove(id);
  };

  // ─── Bundles ──────────────────────────────────────────────────────────────

  public query func getBundles() : async [NewFeatureTypes.BundlePublic] {
    let result = List.empty<NewFeatureTypes.BundlePublic>();
    for ((_, b) in bundles.entries()) {
      if (b.isActive) {
        result.add({
          id = b.id;
          name = b.name;
          description = b.description;
          imageBlob = b.imageBlob;
          productIds = b.productIds;
          bundlePrice = b.bundlePrice;
          isActive = b.isActive;
          createdAt = b.createdAt;
        });
      };
    };
    result.toArray();
  };

  public query func getBundleById(id : NewFeatureTypes.BundleId) : async ?NewFeatureTypes.BundlePublic {
    switch (bundles.get(id)) {
      case null null;
      case (?b) {
        ?{
          id = b.id;
          name = b.name;
          description = b.description;
          imageBlob = b.imageBlob;
          productIds = b.productIds;
          bundlePrice = b.bundlePrice;
          isActive = b.isActive;
          createdAt = b.createdAt;
        };
      };
    };
  };

  public query ({ caller }) func getAdminBundles() : async [NewFeatureTypes.BundlePublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<NewFeatureTypes.BundlePublic>();
    for ((_, b) in bundles.entries()) {
      result.add({
        id = b.id;
        name = b.name;
        description = b.description;
        imageBlob = b.imageBlob;
        productIds = b.productIds;
        bundlePrice = b.bundlePrice;
        isActive = b.isActive;
        createdAt = b.createdAt;
      });
    };
    result.toArray();
  };

  public shared ({ caller }) func createBundle(
    name : Text,
    description : Text,
    imageBlob : Storage.ExternalBlob,
    productIds : [Common.ProductId],
    bundlePrice : Nat,
  ) : async NewFeatureTypes.BundleId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let id = counters.nextBundleId;
    let bundle : NewFeatureTypes.Bundle = {
      id = id;
      var name = name;
      var description = description;
      var imageBlob = imageBlob;
      var productIds = productIds;
      var bundlePrice = bundlePrice;
      var isActive = true;
      createdAt = Time.now();
    };
    bundles.add(id, bundle);
    counters.nextBundleId += 1;
    id;
  };

  public shared ({ caller }) func updateBundle(
    id : NewFeatureTypes.BundleId,
    name : Text,
    description : Text,
    imageBlob : Storage.ExternalBlob,
    productIds : [Common.ProductId],
    bundlePrice : Nat,
    isActive : Bool,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (bundles.get(id)) {
      case null { Runtime.trap("Bundle not found") };
      case (?b) {
        b.name := name;
        b.description := description;
        b.imageBlob := imageBlob;
        b.productIds := productIds;
        b.bundlePrice := bundlePrice;
        b.isActive := isActive;
      };
    };
  };

  public shared ({ caller }) func deleteBundle(id : NewFeatureTypes.BundleId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    bundles.remove(id);
  };

  // ─── Seasonal Collections ─────────────────────────────────────────────────

  public query func getSeasonalCollections() : async [NewFeatureTypes.SeasonalCollectionPublic] {
    let now = Time.now();
    let result = List.empty<NewFeatureTypes.SeasonalCollectionPublic>();
    for ((_, sc) in seasonalCollections.entries()) {
      if (sc.isActive and sc.startDate <= now and sc.endDate >= now) {
        result.add({
          id = sc.id;
          name = sc.name;
          description = sc.description;
          imageBlob = sc.imageBlob;
          productIds = sc.productIds;
          startDate = sc.startDate;
          endDate = sc.endDate;
          isActive = sc.isActive;
          createdAt = sc.createdAt;
        });
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getAdminSeasonalCollections() : async [NewFeatureTypes.SeasonalCollectionPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<NewFeatureTypes.SeasonalCollectionPublic>();
    for ((_, sc) in seasonalCollections.entries()) {
      result.add({
        id = sc.id;
        name = sc.name;
        description = sc.description;
        imageBlob = sc.imageBlob;
        productIds = sc.productIds;
        startDate = sc.startDate;
        endDate = sc.endDate;
        isActive = sc.isActive;
        createdAt = sc.createdAt;
      });
    };
    result.toArray();
  };

  public shared ({ caller }) func createSeasonalCollection(
    name : Text,
    description : Text,
    imageBlob : Storage.ExternalBlob,
    productIds : [Common.ProductId],
    startDate : Common.Timestamp,
    endDate : Common.Timestamp,
  ) : async NewFeatureTypes.SeasonalCollectionId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let id = counters.nextSeasonalCollectionId;
    let sc : NewFeatureTypes.SeasonalCollection = {
      id = id;
      var name = name;
      var description = description;
      var imageBlob = imageBlob;
      var productIds = productIds;
      var startDate = startDate;
      var endDate = endDate;
      var isActive = true;
      createdAt = Time.now();
    };
    seasonalCollections.add(id, sc);
    counters.nextSeasonalCollectionId += 1;
    id;
  };

  public shared ({ caller }) func updateSeasonalCollection(
    id : NewFeatureTypes.SeasonalCollectionId,
    name : Text,
    description : Text,
    imageBlob : Storage.ExternalBlob,
    productIds : [Common.ProductId],
    startDate : Common.Timestamp,
    endDate : Common.Timestamp,
    isActive : Bool,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (seasonalCollections.get(id)) {
      case null { Runtime.trap("Seasonal collection not found") };
      case (?sc) {
        sc.name := name;
        sc.description := description;
        sc.imageBlob := imageBlob;
        sc.productIds := productIds;
        sc.startDate := startDate;
        sc.endDate := endDate;
        sc.isActive := isActive;
      };
    };
  };

  public shared ({ caller }) func deleteSeasonalCollection(id : NewFeatureTypes.SeasonalCollectionId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    seasonalCollections.remove(id);
  };
};
