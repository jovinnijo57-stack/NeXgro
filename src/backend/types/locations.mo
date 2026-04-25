module {
  public type ShopLocation = {
    id : Nat;
    name : Text;
    latitude : Float;
    longitude : Float;
    radiusKm : Float;
    deliveryFeeMultiplier : Float;
    var isActive : Bool;
    createdAt : Int;
  };

  public type ShopLocationPublic = {
    id : Nat;
    name : Text;
    latitude : Float;
    longitude : Float;
    radiusKm : Float;
    deliveryFeeMultiplier : Float;
    isActive : Bool;
    createdAt : Int;
  };

  public type LocationCheckResult = {
    #InRange : { shopId : Nat; distanceKm : Float };
    #OutOfRange : { nearestDistanceKm : Float };
  };
};
