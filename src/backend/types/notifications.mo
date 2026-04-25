import Common "common";

module {
  public type NotifType = {
    #StockBack;
    #OrderUpdate;
    #Referral;
    #Admin;
  };

  public type StockSubscription = {
    id : Nat;
    userId : Common.UserId;
    productId : Nat;
    createdAt : Int;
  };

  public type InAppNotification = {
    id : Nat;
    userId : Common.UserId;
    title : Text;
    message : Text;
    var isRead : Bool;
    notifType : NotifType;
    createdAt : Int;
  };

  public type InAppNotificationPublic = {
    id : Nat;
    userId : Common.UserId;
    title : Text;
    message : Text;
    isRead : Bool;
    notifType : NotifType;
    createdAt : Int;
  };
};
