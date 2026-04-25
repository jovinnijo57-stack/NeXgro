import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserLib "../lib/users";
import Types "../types/users";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  users : Map.Map<Common.UserId, Types.User>,
  addresses : Map.Map<Common.AddressId, Types.SavedAddress>,
  loyaltyTxs : List.List<Types.LoyaltyTransaction>,
  counters : Common.Counters,
) {
  // getUserProfile — auto-creates user on first call (must be shared, not query)
  public shared ({ caller }) func getUserProfile() : async ?Types.UserPublic {
    if (caller.isAnonymous()) {
      return null;
    };
    let u = UserLib.getOrCreateUser(users, caller);
    ?UserLib.toPublic(u);
  };

  public query ({ caller }) func getUsers() : async [Types.UserPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<Types.UserPublic>();
    for ((_, u) in users.entries()) {
      result.add(UserLib.toPublic(u));
    };
    result.toArray();
  };

  public query ({ caller }) func getLoyaltyBalance() : async Nat {
    if (caller.isAnonymous()) { return 0 };
    switch (users.get(caller)) {
      case (?u) u.loyaltyBalance;
      case null 0;
    };
  };

  public query ({ caller }) func getLoyaltyHistory() : async [Types.LoyaltyTransaction] {
    if (caller.isAnonymous()) { return [] };
    let result = List.empty<Types.LoyaltyTransaction>();
    loyaltyTxs.forEach(func(tx) {
      if (tx.userId == caller) {
        result.add(tx);
      };
    });
    result.toArray();
  };

  public query ({ caller }) func getUserAddresses() : async [Types.SavedAddressPublic] {
    if (caller.isAnonymous()) { return [] };
    let result = List.empty<Types.SavedAddressPublic>();
    for ((_, a) in addresses.entries()) {
      if (a.userId == caller) {
        result.add(UserLib.addressToPublic(a));
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func updateUserProfile(name : Text, email : Text, phone : Text) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    let u = UserLib.getOrCreateUser(users, caller);
    // name/email/phone are immutable fields — re-insert updated record
    let updated : Types.User = {
      id = u.id;
      name = name;
      email = email;
      phone = phone;
      role = u.role;
      var loyaltyBalance = u.loyaltyBalance;
      var referralCode = u.referralCode;
      referredBy = u.referredBy;
      var userLat = u.userLat;
      var userLong = u.userLong;
      var wishlistShareToken = u.wishlistShareToken;
      createdAt = u.createdAt;
    };
    users.add(caller, updated);
  };

  public shared ({ caller }) func addAddress(
    street : Text,
    city : Text,
    state : Text,
    zip : Text,
    phone : Text,
    tag : Text,
  ) : async Common.AddressId {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    let id = counters.nextAddressId;
    // Check if this is the first address → set as default
    var hasExisting = false;
    for ((_, a) in addresses.entries()) {
      if (a.userId == caller) { hasExisting := true };
    };
    let addr : Types.SavedAddress = {
      id = id;
      userId = caller;
      street = street;
      city = city;
      state = state;
      zip = zip;
      phone = phone;
      var isDefault = not hasExisting;
      tag = tag;
    };
    addresses.add(id, addr);
    counters.nextAddressId += 1;
    id;
  };

  public shared ({ caller }) func updateAddress(
    id : Common.AddressId,
    street : Text,
    city : Text,
    state : Text,
    zip : Text,
    phone : Text,
    tag : Text,
  ) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    switch (addresses.get(id)) {
      case null { Runtime.trap("Address not found") };
      case (?a) {
        if (a.userId != caller) {
          Runtime.trap("Unauthorized: not your address");
        };
        let updated : Types.SavedAddress = {
          id = id;
          userId = caller;
          street = street;
          city = city;
          state = state;
          zip = zip;
          phone = phone;
          var isDefault = a.isDefault;
          tag = tag;
        };
        addresses.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteAddress(id : Common.AddressId) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    switch (addresses.get(id)) {
      case null { Runtime.trap("Address not found") };
      case (?a) {
        if (a.userId != caller) {
          Runtime.trap("Unauthorized: not your address");
        };
        addresses.remove(id);
      };
    };
  };

  public shared ({ caller }) func setDefaultAddress(id : Common.AddressId) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    // First unset all defaults for this user
    for ((_, a) in addresses.entries()) {
      if (a.userId == caller) {
        a.isDefault := false;
      };
    };
    switch (addresses.get(id)) {
      case null { Runtime.trap("Address not found") };
      case (?a) {
        if (a.userId != caller) {
          Runtime.trap("Unauthorized: not your address");
        };
        a.isDefault := true;
      };
    };
  };

  public shared ({ caller }) func generateReferralCode() : async Text {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    let u = UserLib.getOrCreateUser(users, caller);
    let code = UserLib.generateReferralCode(caller);
    u.referralCode := code;
    code;
  };

  public shared ({ caller }) func validateInviteCode(code : Text) : async Bool {
    if (caller.isAnonymous()) { return false };
    // Validate by checking if any user has this referral code
    for ((uid, u) in users.entries()) {
      if (u.referralCode == code and uid != caller) {
        return true;
      };
    };
    false;
  };
};
