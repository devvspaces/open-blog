import Principal "mo:base/Principal";
import Time "mo:base/Time";
import ICRC1 "mo:icrc1-types";

module {
  public let INVALID_CANISTER_ID = "invalid!canister!id";

  public type Plan = {
    #Free; // Limited to 5 posts
    #Elite; // Limited to 50 posts
    #Legendary; // Unlimited posts
  };

  public type Member = {
    name : Text;
    github : Text;
    bio : Text;
    plan : Plan;
  };

  public type PostStatus = {
    #Draft;
    #Published;
    #Archived;
  };

  public type Post = {
    id : Nat;
    title : Text;
    content : Text;
    author : Principal;
    status : PostStatus;
    createdAt : Time.Time;
    publishedAt : ?Time.Time;
  };

  public type PostWithAuthor = {
    post : Post;
    author : Member;
  };

  public type PaymentError = {
    #TransferErr : ICRC1.TransferError;
    #InterCanisterCallCaughtError : Text;
  };

  public type PaymentStatus = {
    #Completed : {
      timestampNs : Time.Time;
      index: Nat;
    };
    #Failed : PaymentError;
  };
};
