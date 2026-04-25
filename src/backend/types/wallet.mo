import Common "common";

module {
  public type WalletTxType = {
    #TopUp;
    #Bonus;
    #Redemption;
    #Refund;
    #AdminAdjust;
  };

  public type Wallet = {
    userId : Common.UserId;
    var balance : Nat;
    var totalAdded : Nat;
    var totalRedeemed : Nat;
    var lastUpdatedAt : Int;
  };

  public type WalletPublic = {
    userId : Common.UserId;
    balance : Nat;
    totalAdded : Nat;
    totalRedeemed : Nat;
    lastUpdatedAt : Int;
  };

  public type WalletTransaction = {
    id : Nat;
    userId : Common.UserId;
    amount : Nat;
    txType : WalletTxType;
    description : Text;
    createdAt : Int;
  };

  public type WalletBonusConfig = {
    var bonusPercent : Nat;
  };
};
