import Common "common";
import Storage "mo:caffeineai-object-storage/Storage";
import NewFeatureTypes "new-features";

module {
  public type Category = {
    id : Common.CategoryId;
    name : Text;
    var displayOrder : Nat;
    var isActive : Bool;
    iconEmoji : Text;
  };

  public type CategoryPublic = {
    id : Common.CategoryId;
    name : Text;
    displayOrder : Nat;
    isActive : Bool;
    iconEmoji : Text;
  };

  public type Product = {
    id : Common.ProductId;
    var name : Text;
    var description : Text;
    var price : Nat;
    var categoryId : Common.CategoryId;
    var imageBlob : Storage.ExternalBlob;
    var stockQty : Nat;
    var rating : Nat;
    var reviewCount : Nat;
    var isActive : Bool;
    var isFeatured : Bool;
    var isBestSeller : Bool;
    var isNewArrival : Bool;
    var harvestDate : ?Int;
    var bestBeforeDate : ?Int;
    var bundleId : ?Nat;
    var ageRestricted : Bool;
    var ageCategory : ?NewFeatureTypes.AgeGatedCategory;
    createdAt : Common.Timestamp;
  };

  public type ProductPublic = {
    id : Common.ProductId;
    name : Text;
    description : Text;
    price : Nat;
    categoryId : Common.CategoryId;
    imageBlob : Storage.ExternalBlob;
    stockQty : Nat;
    rating : Nat;
    reviewCount : Nat;
    isActive : Bool;
    isFeatured : Bool;
    isBestSeller : Bool;
    isNewArrival : Bool;
    harvestDate : ?Int;
    bestBeforeDate : ?Int;
    bundleId : ?Nat;
    ageRestricted : Bool;
    ageCategory : ?NewFeatureTypes.AgeGatedCategory;
    createdAt : Common.Timestamp;
  };

  public type ProductFilters = {
    categoryId : ?Common.CategoryId;
    minPrice : ?Nat;
    maxPrice : ?Nat;
    minRating : ?Nat;
    searchQuery : ?Text;
    onlyActive : Bool;
  };

  public type Review = {
    id : Common.ReviewId;
    productId : Common.ProductId;
    userId : Common.UserId;
    rating : Nat;
    title : Text;
    text : Text;
    var isApproved : Bool;
    var helpfulCount : Nat;
    createdAt : Common.Timestamp;
  };

  public type ReviewPublic = {
    id : Common.ReviewId;
    productId : Common.ProductId;
    userId : Common.UserId;
    rating : Nat;
    title : Text;
    text : Text;
    isApproved : Bool;
    helpfulCount : Nat;
    createdAt : Common.Timestamp;
  };

  public type FlashDeal = {
    id : Common.FlashDealId;
    productId : Common.ProductId;
    discountPercent : Nat;
    startDateTime : Common.Timestamp;
    endDateTime : Common.Timestamp;
    var isActive : Bool;
  };

  public type FlashDealPublic = {
    id : Common.FlashDealId;
    productId : Common.ProductId;
    discountPercent : Nat;
    startDateTime : Common.Timestamp;
    endDateTime : Common.Timestamp;
    isActive : Bool;
  };

  public type Banner = {
    id : Common.BannerId;
    imageBlob : Storage.ExternalBlob;
    title : Text;
    link : Text;
    var displayOrder : Nat;
    var isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type BannerPublic = {
    id : Common.BannerId;
    imageBlob : Storage.ExternalBlob;
    title : Text;
    link : Text;
    displayOrder : Nat;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };
};
