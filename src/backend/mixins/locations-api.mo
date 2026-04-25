import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import NewFeatureTypes "../types/new-features";
import UserTypes "../types/users";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  shopLocations : Map.Map<NewFeatureTypes.ShopLocationId, NewFeatureTypes.ShopLocation>,
  users : Map.Map<Common.UserId, UserTypes.User>,
  counters : Common.Counters,
) {
  // Haversine distance in km between two lat/lng points
  func haversineDistance(lat1 : Float, lon1 : Float, lat2 : Float, lon2 : Float) : Float {
    let r : Float = 6371.0; // Earth radius in km
    let dLat = (lat2 - lat1) * Float.pi / 180.0;
    let dLon = (lon2 - lon1) * Float.pi / 180.0;
    let a =
      Float.sin(dLat / 2.0) * Float.sin(dLat / 2.0) +
      Float.cos(lat1 * Float.pi / 180.0) *
      Float.cos(lat2 * Float.pi / 180.0) *
      Float.sin(dLon / 2.0) * Float.sin(dLon / 2.0);
    let c = 2.0 * Float.arctan2(Float.sqrt(a), Float.sqrt(1.0 - a));
    r * c;
  };

  public query func getShopLocations() : async [NewFeatureTypes.ShopLocationPublic] {
    let result = List.empty<NewFeatureTypes.ShopLocationPublic>();
    for ((_, loc) in shopLocations.entries()) {
      result.add({
        id = loc.id;
        name = loc.name;
        lat = loc.lat;
        long = loc.long;
        radiusKm = loc.radiusKm;
        deliveryFeeMultiplier = loc.deliveryFeeMultiplier;
        isActive = loc.isActive;
        createdAt = loc.createdAt;
      });
    };
    result.toArray();
  };

  public query func getActiveShopLocations() : async [NewFeatureTypes.ShopLocationPublic] {
    let result = List.empty<NewFeatureTypes.ShopLocationPublic>();
    for ((_, loc) in shopLocations.entries()) {
      if (loc.isActive) {
        result.add({
          id = loc.id;
          name = loc.name;
          lat = loc.lat;
          long = loc.long;
          radiusKm = loc.radiusKm;
          deliveryFeeMultiplier = loc.deliveryFeeMultiplier;
          isActive = loc.isActive;
          createdAt = loc.createdAt;
        });
      };
    };
    result.toArray();
  };

  public query func checkDeliveryRadius(lat : Float, long : Float) : async NewFeatureTypes.LocationCheckResult {
    if (shopLocations.isEmpty()) {
      return #noShopLocations;
    };
    var nearestDist : Float = 999999.0;
    var matchId : ?NewFeatureTypes.ShopLocationId = null;
    var matchDist : Float = 0.0;
    for ((_, loc) in shopLocations.entries()) {
      if (loc.isActive) {
        let dist = haversineDistance(lat, long, loc.lat, loc.long);
        if (dist < nearestDist) {
          nearestDist := dist;
        };
        if (dist <= loc.radiusKm) {
          switch (matchId) {
            case null {
              matchId := ?loc.id;
              matchDist := dist;
            };
            case (?_) {
              // keep the nearest matching shop
              if (dist < matchDist) {
                matchId := ?loc.id;
                matchDist := dist;
              };
            };
          };
        };
      };
    };
    switch (matchId) {
      case (?sid) { #withinRadius({ shopLocationId = sid; distanceKm = matchDist }) };
      case null { #outOfRange({ nearestDistanceKm = nearestDist }) };
    };
  };

  public shared ({ caller }) func setUserLocation(lat : Float, long : Float) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    switch (users.get(caller)) {
      case null { Runtime.trap("User not found — register first") };
      case (?u) {
        u.userLat := ?lat;
        u.userLong := ?long;
      };
    };
  };

  public shared ({ caller }) func addShopLocation(
    name : Text,
    lat : Float,
    long : Float,
    radiusKm : Float,
    deliveryFeeMultiplier : Nat,
  ) : async NewFeatureTypes.ShopLocationId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let id = counters.nextShopLocationId;
    let loc : NewFeatureTypes.ShopLocation = {
      id = id;
      var name = name;
      var lat = lat;
      var long = long;
      var radiusKm = radiusKm;
      var deliveryFeeMultiplier = deliveryFeeMultiplier;
      var isActive = true;
      createdAt = Time.now();
    };
    shopLocations.add(id, loc);
    counters.nextShopLocationId += 1;
    id;
  };

  public shared ({ caller }) func updateShopLocation(
    id : NewFeatureTypes.ShopLocationId,
    name : Text,
    lat : Float,
    long : Float,
    radiusKm : Float,
    deliveryFeeMultiplier : Nat,
    isActive : Bool,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (shopLocations.get(id)) {
      case null { Runtime.trap("Shop location not found") };
      case (?loc) {
        loc.name := name;
        loc.lat := lat;
        loc.long := long;
        loc.radiusKm := radiusKm;
        loc.deliveryFeeMultiplier := deliveryFeeMultiplier;
        loc.isActive := isActive;
      };
    };
  };

  public shared ({ caller }) func deleteShopLocation(id : NewFeatureTypes.ShopLocationId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    shopLocations.remove(id);
  };
};
