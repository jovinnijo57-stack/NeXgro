import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type BuyXGetYRule = {
    id : Nat;
    name : Text;
    productId : Nat;
    buyQty : Nat;
    getQty : Nat;
    var isActive : Bool;
    createdAt : Int;
  };

  public type BuyXGetYRulePublic = {
    id : Nat;
    name : Text;
    productId : Nat;
    buyQty : Nat;
    getQty : Nat;
    isActive : Bool;
    createdAt : Int;
  };

  public type Bundle = {
    id : Nat;
    var name : Text;
    var description : Text;
    var productIds : [Nat];
    var discountPercent : Nat;
    var imageBlob : ?Storage.ExternalBlob;
    var isActive : Bool;
    createdAt : Int;
  };

  public type BundlePublic = {
    id : Nat;
    name : Text;
    description : Text;
    productIds : [Nat];
    discountPercent : Nat;
    imageBlob : ?Storage.ExternalBlob;
    isActive : Bool;
    createdAt : Int;
  };

  public type SeasonalCollection = {
    id : Nat;
    var name : Text;
    var theme : Text;
    var productIds : [Nat];
    var badgeColor : Text;
    var isActive : Bool;
    startDate : Int;
    endDate : Int;
    createdAt : Int;
  };

  public type SeasonalCollectionPublic = {
    id : Nat;
    name : Text;
    theme : Text;
    productIds : [Nat];
    badgeColor : Text;
    isActive : Bool;
    startDate : Int;
    endDate : Int;
    createdAt : Int;
  };
};
