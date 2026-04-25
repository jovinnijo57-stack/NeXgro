import Common "common";
import Storage "mo:caffeineai-object-storage/Storage";
import NewFeatureTypes "new-features";

module {
  public type UserRole = { #admin; #user; #guest };

  public type User = {
    id : Common.UserId;
    name : Text;
    email : Text;
    phone : Text;
    role : UserRole;
    var loyaltyBalance : Nat;
    var referralCode : Text;
    referredBy : ?Common.UserId;
    var userLat : ?Float;
    var userLong : ?Float;
    var wishlistShareToken : ?Text;
    createdAt : Common.Timestamp;
  };

  public type UserPublic = {
    id : Common.UserId;
    name : Text;
    email : Text;
    phone : Text;
    role : UserRole;
    loyaltyBalance : Nat;
    referralCode : Text;
    referredBy : ?Common.UserId;
    userLat : ?Float;
    userLong : ?Float;
    wishlistShareToken : ?Text;
    createdAt : Common.Timestamp;
  };

  public type SavedAddress = {
    id : Common.AddressId;
    userId : Common.UserId;
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    phone : Text;
    var isDefault : Bool;
    tag : Text;
  };

  public type SavedAddressPublic = {
    id : Common.AddressId;
    userId : Common.UserId;
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    phone : Text;
    isDefault : Bool;
    tag : Text;
  };

  public type LoyaltyReason = {
    #purchase;
    #referral;
    #redemption;
    #admin;
  };

  public type LoyaltyTransaction = {
    id : Common.LoyaltyTxId;
    userId : Common.UserId;
    pointsChange : Int;
    reason : LoyaltyReason;
    orderId : ?Common.OrderId;
    createdAt : Common.Timestamp;
  };
};
