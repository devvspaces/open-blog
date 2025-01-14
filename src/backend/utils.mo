import ICRC1 "mo:icrc1-types";
import Sha256 "mo:sha2/Sha256";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Result "mo:base/Result";

module Utils {
  type Result<A, B> = Result.Result<A, B>;

  public func createIcrcActor(canisterId : Text) : async ICRC1.Service {
    actor (canisterId);
  };

  public func computeUserSubaccountAccount(p : Principal) : Blob {
    Sha256.fromArray(#sha256, Array.flatten([[0x04 : Nat8], Blob.toArray(Text.encodeUtf8("user")), Blob.toArray(Principal.toBlob(p))]));
  };
  
  public func getAccountUserSubaccount({
    canisterId : Principal;
    user : Principal;
  }) : ICRC1.Account {
    { owner = canisterId; subaccount = ?(computeUserSubaccountAccount(user)) };
  };
};
