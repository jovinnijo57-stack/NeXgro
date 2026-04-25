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
  chatMessages : Map.Map<NewFeatureTypes.ChatMsgId, NewFeatureTypes.ChatMessage>,
  chatThreads : Map.Map<Common.UserId, NewFeatureTypes.ChatThread>,
  counters : Common.Counters,
) {
  public shared ({ caller }) func sendChatMessage(message : Text) : async NewFeatureTypes.ChatMsgId {
    if (caller.isAnonymous()) { Runtime.trap("Not authenticated") };
    if (message.size() == 0) { Runtime.trap("Message cannot be empty") };

    let now = Time.now();

    // Create or update thread
    switch (chatThreads.get(caller)) {
      case null {
        let thread : NewFeatureTypes.ChatThread = {
          userId = caller;
          var status = #open;
          var lastMessageAt = now;
          createdAt = now;
        };
        chatThreads.add(caller, thread);
      };
      case (?t) {
        t.lastMessageAt := now;
        t.status := #open;
      };
    };

    let msgId = counters.nextChatMsgId;
    let msg : NewFeatureTypes.ChatMessage = {
      id = msgId;
      userId = caller;
      sender = #user;
      text = message;
      createdAt = now;
    };
    chatMessages.add(msgId, msg);
    counters.nextChatMsgId += 1;
    msgId;
  };

  public query ({ caller }) func getChatMessages() : async [NewFeatureTypes.ChatMessage] {
    if (caller.isAnonymous()) { return [] };
    let result = List.empty<NewFeatureTypes.ChatMessage>();
    for ((_, msg) in chatMessages.entries()) {
      if (Principal.equal(msg.userId, caller)) {
        result.add(msg);
      };
    };
    let arr = result.toArray();
    arr.sort(func(a, b) = Int.compare(a.createdAt, b.createdAt));
  };

  public query ({ caller }) func getChatThread() : async ?NewFeatureTypes.ChatThreadPublic {
    if (caller.isAnonymous()) { return null };
    switch (chatThreads.get(caller)) {
      case null null;
      case (?t) {
        ?{
          userId = t.userId;
          status = t.status;
          lastMessageAt = t.lastMessageAt;
          createdAt = t.createdAt;
        };
      };
    };
  };

  public query ({ caller }) func getAllChatThreads() : async [NewFeatureTypes.ChatThreadPublic] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<NewFeatureTypes.ChatThreadPublic>();
    for ((_, t) in chatThreads.entries()) {
      result.add({
        userId = t.userId;
        status = t.status;
        lastMessageAt = t.lastMessageAt;
        createdAt = t.createdAt;
      });
    };
    result.toArray();
  };

  public query ({ caller }) func getThreadMessages(userId : Principal) : async [NewFeatureTypes.ChatMessage] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let result = List.empty<NewFeatureTypes.ChatMessage>();
    for ((_, msg) in chatMessages.entries()) {
      if (Principal.equal(msg.userId, userId)) {
        result.add(msg);
      };
    };
    let arr = result.toArray();
    arr.sort(func(a, b) = Int.compare(a.createdAt, b.createdAt));
  };

  public shared ({ caller }) func adminReplyToThread(userId : Principal, message : Text) : async NewFeatureTypes.ChatMsgId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    if (message.size() == 0) { Runtime.trap("Message cannot be empty") };

    let now = Time.now();

    // Update thread last message time
    switch (chatThreads.get(userId)) {
      case null { Runtime.trap("Thread not found") };
      case (?t) { t.lastMessageAt := now };
    };

    let msgId = counters.nextChatMsgId;
    let msg : NewFeatureTypes.ChatMessage = {
      id = msgId;
      userId = userId;
      sender = #admin;
      text = message;
      createdAt = now;
    };
    chatMessages.add(msgId, msg);
    counters.nextChatMsgId += 1;
    msgId;
  };

  public shared ({ caller }) func resolveThread(userId : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    switch (chatThreads.get(userId)) {
      case null { Runtime.trap("Thread not found") };
      case (?t) { t.status := #resolved };
    };
  };
};
