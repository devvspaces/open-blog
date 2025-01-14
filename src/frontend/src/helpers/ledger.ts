import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { createAgent } from "@dfinity/utils";
import { backend } from "../../../declarations/backend";
import { createClient } from "./auth";
import { Principal } from "@dfinity/principal";

/**
 * Create an ICRC ledger canister
 */
export async function createLedgerCanister() {
  const client = await createClient();

  if (!client.isAuthenticated()) {
    throw new Error("User not authenticated");
  }

  const MY_LEDGER_CANISTER_ID = process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER as string;
  
  const agent = await createAgent({
    identity: client.getIdentity(),
    host: `http://localhost:4943`,
    fetchRootKey: true,
  });

  return IcrcLedgerCanister.create({
    agent,
    canisterId: MY_LEDGER_CANISTER_ID,
  });
}
