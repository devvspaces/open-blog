import Result "mo:base/Result";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Types "types";
import Vector "mo:vector";
import Utils "utils";
import Error "mo:base/Error";
import Debug "mo:base/Debug";
import ICRC1 "mo:icrc1-types";
import AccountConverter "account-converter";

shared ({ caller = installer_ }) actor class Blog() = this {
  type Result<A, B> = Result.Result<A, B>;
  type Member = Types.Member;
  type Plan = Types.Plan;
  type Post = Types.Post;
  type PostWithAuthor = Types.PostWithAuthor;
  type PostStatus = Types.PostStatus;
  type Vector<T> = Vector.Vector<T>;
  type PaymentError = Types.PaymentError;
  type PaymentStatus = Types.PaymentStatus;

  var icrc1Actor_ : ICRC1.Service = actor ("mxzaz-hqaaa-aaaar-qaada-cai");
  var icrc1TokenCanisterId_ : Text = Types.INVALID_CANISTER_ID;

  stable let name = "OpenBlog";
  stable var manifesto = "An open blogging platform for all";

  stable var stableMembers : [(Principal, Member)] = [];
  let members = HashMap.fromIter<Principal, Member>(stableMembers.vals(), 0, Principal.equal, Principal.hash);

  stable var stablePosts : [(Principal, Vector<Post>)] = [];
  let posts = HashMap.fromIter<Principal, Vector<Post>>(stablePosts.vals(), 0, Principal.equal, Principal.hash);

  // Serialize stable variables before upgrades
  system func preupgrade() {
    stableMembers := Iter.toArray(members.entries());
    stablePosts := Iter.toArray(posts.entries());
  };

  // Ensure the stable variables are updated when upgrades are done
  system func postupgrade() {
    stableMembers := [];
    stablePosts := [];
  };

  // Get this canister ID
  func getCanisterId_() : Principal {
    Principal.fromActor(this);
  };

  // Get the canister name
  public query func getName() : async Text {
    return name;
  };

  // Get the canister manifesto
  public query func getManifesto() : async Text {
    return manifesto;
  };

  // Find other members on the protocol
  public query func getMembers() : async [(Principal, Member)] {
    Iter.toArray(members.entries());
  };

  // Read published posts on the platform
  public query func getPosts() : async [PostWithAuthor] {
    let vec = Vector.new<PostWithAuthor>();
    for ((principal, userPosts) in posts.entries()) {
      switch (members.get(principal)) {
        case (null) {};
        case (?member) {
          for (post in Vector.vals(userPosts)) {
            if (post.status == #Published) {
              Vector.add<PostWithAuthor>(
                vec,
                {
                  post = post;
                  author = member;
                },
              );
            };
          };
        };
      };
    };
    Vector.toArray(vec);
  };

  // Get a member profile
  public query func getMemberProfile(p : Principal) : async Result<Member, Text> {
    switch (members.get(p)) {
      case null {
        return #err("User not found");
      };
      case (?member) {
        #ok(member);
      };
    };
  };

  // Get a member posts
  public query func getMemberPosts(p : Principal) : async Result<[Post], Text> {
    switch (posts.get(p)) {
      case null {
        #ok([]);
      };
      case (?post) {
        #ok(Vector.toArray<Post>(post));
      };
    };
  };

  // Register a new member account
  public shared ({ caller }) func register(name : Text, github : Text, bio : Text) : async Result<(), Text> {
    switch (members.get(caller)) {
      case (null) {
        let member = {
          name = name;
          bio = bio;
          github = github;
          plan = #Free;
        };
        members.put(caller, member);
        return #ok();
      };
      case (_) {
        return #err("Member already exists");
      };
    };
  };

  // Create a new post
  public shared ({ caller }) func createPost(title : Text, content : Text, status : PostStatus) : async Result<(), Text> {
    switch (members.get(caller)) {
      case (null) {
        return #err("Member not found");
      };
      case (?member) {
        switch (posts.get(caller)) {
          case (null) {
            posts.put(caller, Vector.new<Post>());
          };
          case (_) {};
        };
        switch (posts.get(caller)) {
          case (null) {};
          case (?postsObj) {
            let postCount = Vector.size<Post>(postsObj);
            switch (member.plan) {
              case (#Free) {
                if (postCount >= 5) {
                  return #err("Free plan is limited to 5 posts");
                };
              };
              case (#Elite) {
                if (postCount >= 50) {
                  return #err("Elite plan is limited to 50 posts");
                };
              };
              case (#Legendary) {};
            };

            if (status == #Published) {
              Vector.add<Post>(
                postsObj,
                {
                  id = postCount;
                  title = title;
                  content = content;
                  author = caller;
                  status = status;
                  createdAt = Time.now();
                  publishedAt = ?Time.now();
                },
              );
            } else {
              Vector.add<Post>(
                postsObj,
                {
                  id = postCount;
                  title = title;
                  content = content;
                  author = caller;
                  status = status;
                  createdAt = Time.now();
                  publishedAt = null;
                },
              );
            };
          };
        };
        return #ok();
      };
    };
  };

  // Get post details
  public query func getPost(id : Nat, owner : Principal) : async Result<Post, Text> {
    switch (posts.get(owner)) {
      case null {
        return #err("Post not found");
      };
      case (?postsObj) {
        if (id >= Vector.size<Post>(postsObj)) {
          return #err("Post not found");
        };
        return #ok(Vector.get<Post>(postsObj, id));
      };
    };
  };

  // Update post status
  public shared ({ caller }) func updatePostStatus(id : Nat, status : PostStatus) : async Result<(), Text> {
    switch (members.get(caller)) {
      case (null) {
        return #err("Member not found");
      };
      case (?member) {
        switch (posts.get(caller)) {
          case (null) {
            return #err("Post not found");
          };
          case (?postsObj) {
            if (id >= Vector.size<Post>(postsObj)) {
              return #err("Post not found");
            };
            let post = Vector.get<Post>(postsObj, id);
            let updatedPost = {
              id = post.id;
              title = post.title;
              content = post.content;
              author = post.author;
              status = status;
              createdAt = post.createdAt;
              publishedAt = post.publishedAt;
            };
            Vector.put<Post>(postsObj, id, updatedPost);
            return #ok();
          };
        };
      };
    };
  };

  // Get available plans
  public query func getPlans() : async [Plan] {
    [#Free, #Elite, #Legendary];
  };

  // Private function to get the cost of a plan
  private func _getPlanCost(plan : Plan) : Nat {
    switch (plan) {
      case (#Free) {
        0;
      };
      case (#Elite) {
        10;
      };
      case (#Legendary) {
        20;
      };
    };
  };

  // Function to update a plan of a member
  func _updatePlan(caller : Principal, plan : Plan) : async () {
    switch (members.get(caller)) {
      case (null) {
        return;
      };
      case (?member) {
        let updatedMember = {
          name = member.name;
          bio = member.bio;
          github = member.github;
          plan = plan;
        };
        members.put(caller, updatedMember);
        return;
      };
    };
  };

  // Get the ICRC1 Token canister ID
  public query func get_icrc1_token_canister_id() : async Text {
    icrc1TokenCanisterId_;
  };

  // Get a new ICRC1 Token canister ID
  public shared ({ caller }) func set_icrc1_token_canister(tokenCanisterId : Text) : async Result<(), Text> {
    if (Principal.isAnonymous(caller) or caller != installer_) return #err("Not authorized");

    let icrc1Canister = try {
      #ok(await Utils.createIcrcActor(tokenCanisterId));
    } catch e #err(e);

    switch (icrc1Canister) {
      case (#ok(icrc1Actor)) {
        icrc1Actor_ := icrc1Actor;
        icrc1TokenCanisterId_ := tokenCanisterId;
        #ok;
      };
      case (#err(e)) {
        #err("Failed to instantiate icrc1 token canister from given id(" # tokenCanisterId # ") for reason " # Error.message(e));
      };
    };
  };

  // Get a member subaccount address for sending tokens to the canister
  public shared query ({ caller }) func get_account_address() : async Text {
    AccountConverter.toText(Utils.getAccountUserSubaccount({ canisterId = getCanisterId_(); user = caller }));
  };

  // Transfer tokens for user subaccount to the canister main account
  public shared ({ caller }) func transferFromSubAccountToMain(
    plan : Plan
  ) : async Result<(Text, PaymentStatus), (Text, PaymentStatus)> {
    let account = Utils.getAccountUserSubaccount({
      canisterId = getCanisterId_();
      user = caller;
    });
    var amount = 0;

    switch (plan) {
      case (#Elite) {
        amount := 10;
      };
      case (#Legendary) {
        amount := 20;
      };
      case (_) {};
    };

    // Make the icrc1 intercanister transfer call, catching if error'd:
    let response : Result<ICRC1.TransferResult, PaymentError> = try {
      #ok(await icrc1Actor_.icrc1_transfer({ from_subaccount = account.subaccount; amount; fee = null; memo = null; created_at_time = null; to = { owner = getCanisterId_(); subaccount = null } }));
    } catch (e) {
      #err(#InterCanisterCallCaughtError(Error.message(e)));
    };

    // Parse the results of the icrc1 intercansiter transfer call:
    switch (response) {
      case (#ok(transferResult)) {
        switch (transferResult) {
          case (#Ok index) {
            // Update member plan
            let _ = _updatePlan(caller, plan);
            return #ok("", #Completed({ timestampNs = Time.now(); index }));
          };
          case (#Err transferErr) #err(
            "The icrc1 transfer call could not be completed as requested.",
            #Failed(#TransferErr(transferErr)),
          );
        };
      };
      case (#err(kind)) #err(
        "The intercanister icrc1 transfer call caught an error and did not finish processing.",
        #Failed(kind),
      );
    };

  };
};
