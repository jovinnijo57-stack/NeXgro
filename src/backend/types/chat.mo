import Common "common";

module {
  public type ChatMessage = {
    id : Nat;
    userId : Common.UserId;
    userName : Text;
    message : Text;
    isAdminReply : Bool;
    var isResolved : Bool;
    createdAt : Int;
  };

  public type ChatMessagePublic = {
    id : Nat;
    userId : Common.UserId;
    userName : Text;
    message : Text;
    isAdminReply : Bool;
    isResolved : Bool;
    createdAt : Int;
  };

  public type ChatThread = {
    id : Nat;
    userId : Common.UserId;
    userName : Text;
    var lastMessage : Text;
    var isResolved : Bool;
    var messageCount : Nat;
    createdAt : Int;
    var lastUpdatedAt : Int;
  };

  public type ChatThreadPublic = {
    id : Nat;
    userId : Common.UserId;
    userName : Text;
    lastMessage : Text;
    isResolved : Bool;
    messageCount : Nat;
    createdAt : Int;
    lastUpdatedAt : Int;
  };
};
