import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import NewFeatureTypes "../types/new-features";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  wallets : Map.Map<Common.UserId, NewFeatureTypes.Wallet>,
  walletTransactions : Map.Map<NewFeatureTypes.WalletTxId, NewFeatureTypes.WalletTransaction>,
  walletBonusConfig : NewFeatureTypes.WalletBonusConfig,
  counters : Common.Counters,
) {
  public query ({ caller }) func getWalletBalance() : async Nat {
    if (caller.isAnonymous()) { return 0 };
    switch (wallets.get(caller)) {
      case null 0;
      case (?w) w.balanceCents;
    };
  };

  public query ({ caller }) func getWalletTransactions() : async [NewFeatureTypes.WalletTransaction] {
    if (caller.isAnonymous()) { return [] };
    let result = List.empty<NewFeatureTypes.WalletTransaction>();
    for ((_, tx) in walletTransactions.entries()) {
      if (Principal.equal(tx.userId, caller)) {
        result.add(tx);
      };
    };
    // Sort newest first
    let arr = result.toArray();
    arr.sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
  };

  public shared ({ caller }) func topUpWallet(amount : Nat) : async () {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    if (amount == 0) { Runtime.trap("Amount must be > 0") };

    let now = Time.now();

    // Ensure wallet exists
    switch (wallets.get(caller)) {
      case null {
        let w : NewFeatureTypes.Wallet = { userId = caller; var balanceCents = 0 };
        wallets.add(caller, w);
      };
      case (?_) {};
    };

    let wallet = switch (wallets.get(caller)) {
      case null { Runtime.trap("Wallet not found") };
      case (?w) w;
    };

    // Record top-up transaction
    let txId = counters.nextWalletTxId;
    let topUpTx : NewFeatureTypes.WalletTransaction = {
      id = txId;
      userId = caller;
      amount = Int.fromNat(amount);
      txType = #topUp;
      description = "Wallet top-up";
      orderId = null;
      createdAt = now;
    };
    walletTransactions.add(txId, topUpTx);
    counters.nextWalletTxId += 1;
    wallet.balanceCents += amount;

    // Award bonus if configured
    if (walletBonusConfig.bonusPercent > 0) {
      let bonus = amount * walletBonusConfig.bonusPercent / 100;
      if (bonus > 0) {
        let bonusTxId = counters.nextWalletTxId;
        let bonusTx : NewFeatureTypes.WalletTransaction = {
          id = bonusTxId;
          userId = caller;
          amount = Int.fromNat(bonus);
          txType = #bonus;
          description = "Top-up bonus (" # walletBonusConfig.bonusPercent.toText() # "%)";
          orderId = null;
          createdAt = now;
        };
        walletTransactions.add(bonusTxId, bonusTx);
        counters.nextWalletTxId += 1;
        wallet.balanceCents += bonus;
      };
    };
  };

  public query ({ caller }) func getWalletBonusConfig() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    walletBonusConfig.bonusPercent;
  };

  public shared ({ caller }) func updateWalletBonusConfig(bonusPercent : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    walletBonusConfig.bonusPercent := bonusPercent;
  };

  public query ({ caller }) func adminGetAllWallets() : async [(Principal, Nat)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<(Principal, Nat)>();
    for ((uid, w) in wallets.entries()) {
      result.add((uid, w.balanceCents));
    };
    result.toArray();
  };

  public shared ({ caller }) func adminAdjustWallet(
    userId : Principal,
    amount : Int,
    description : Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };

    // Ensure wallet exists
    switch (wallets.get(userId)) {
      case null {
        let w : NewFeatureTypes.Wallet = { userId = userId; var balanceCents = 0 };
        wallets.add(userId, w);
      };
      case (?_) {};
    };

    let wallet = switch (wallets.get(userId)) {
      case null { Runtime.trap("Wallet not found") };
      case (?w) w;
    };

    let txId = counters.nextWalletTxId;
    let tx : NewFeatureTypes.WalletTransaction = {
      id = txId;
      userId = userId;
      amount = amount;
      txType = #adminAdjustment;
      description = description;
      orderId = null;
      createdAt = Time.now();
    };
    walletTransactions.add(txId, tx);
    counters.nextWalletTxId += 1;

    // Update balance (handle negative carefully)
    if (amount >= 0) {
      wallet.balanceCents += Int.abs(amount);
    } else {
      let deduction = Int.abs(amount);
      wallet.balanceCents := if (deduction > wallet.balanceCents) { 0 } else { wallet.balanceCents - deduction };
    };
  };
};
