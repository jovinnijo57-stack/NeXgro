import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Types "../types/users";
import Common "../types/common";

module {
  public func getOrCreateUser(
    users : Map.Map<Common.UserId, Types.User>,
    caller : Principal,
  ) : Types.User {
    switch (users.get(caller)) {
      case (?u) { u };
      case null {
        let u : Types.User = {
          id = caller;
          name = "";
          email = "";
          phone = "";
          role = #user;
          var loyaltyBalance = 0;
          var referralCode = generateReferralCode(caller);
          referredBy = null;
          var userLat = null;
          var userLong = null;
          var wishlistShareToken = null;
          createdAt = Time.now();
        };
        users.add(caller, u);
        u;
      };
    };
  };

  public func toPublic(u : Types.User) : Types.UserPublic {
    {
      id = u.id;
      name = u.name;
      email = u.email;
      phone = u.phone;
      role = u.role;
      loyaltyBalance = u.loyaltyBalance;
      referralCode = u.referralCode;
      referredBy = u.referredBy;
      userLat = u.userLat;
      userLong = u.userLong;
      wishlistShareToken = u.wishlistShareToken;
      createdAt = u.createdAt;
    };
  };

  public func generateReferralCode(userId : Common.UserId) : Text {
    let txt = userId.toText();
    let arr = txt.toArray();
    let len = arr.size();
    var code = "NX";
    var count = 0;
    var i = if (len > 8) { len - 8 } else { 0 };
    while (i < len and count < 8) {
      let c = arr[i];
      if ((c >= 'A' and c <= 'Z') or (c >= '0' and c <= '9')) {
        code := code # Text.fromChar(c);
        count += 1;
      };
      i += 1;
    };
    code;
  };

  // Find the referrer's user id for a given code
  public func findReferrerId(
    users : Map.Map<Common.UserId, Types.User>,
    referralCode : Text,
  ) : ?Common.UserId {
    for ((uid, u) in users.entries()) {
      if (u.referralCode == referralCode) {
        return ?uid;
      };
    };
    null;
  };

  public func applyReferral(
    users : Map.Map<Common.UserId, Types.User>,
    newUserId : Common.UserId,
    referralCode : Text,
  ) : Bool {
    switch (findReferrerId(users, referralCode)) {
      case null false;
      case (?_) true;
    };
  };

  public func addLoyaltyPoints(
    user : Types.User,
    txList : List.List<Types.LoyaltyTransaction>,
    nextTxId : Nat,
    points : Int,
    reason : Types.LoyaltyReason,
    orderId : ?Common.OrderId,
  ) : Nat {
    let newBalance : Nat = if (points >= 0) {
      user.loyaltyBalance + Int.abs(points);
    } else {
      let pts = Int.abs(points);
      if (pts > user.loyaltyBalance) { 0 } else { user.loyaltyBalance - pts };
    };
    user.loyaltyBalance := newBalance;

    let tx : Types.LoyaltyTransaction = {
      id = nextTxId;
      userId = user.id;
      pointsChange = points;
      reason = reason;
      orderId = orderId;
      createdAt = Time.now();
    };
    txList.add(tx);
    newBalance;
  };

  public func addressToPublic(a : Types.SavedAddress) : Types.SavedAddressPublic {
    {
      id = a.id;
      userId = a.userId;
      street = a.street;
      city = a.city;
      state = a.state;
      zip = a.zip;
      phone = a.phone;
      isDefault = a.isDefault;
      tag = a.tag;
    };
  };
};
