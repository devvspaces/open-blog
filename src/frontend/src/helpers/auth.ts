import { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Member } from "../../../declarations/backend/backend.did";
import { Plan } from "./types";
import { createActor } from "../../../declarations/backend";

/**
 * Get the identity provider URL
 * @see https://github.com/dfinity/examples/blob/master/motoko/auth_client_demo/src/auth_client_demo_assets/react/use-auth-client.jsx
 */
export const getIdentityProvider = () => {
  if (process.env.DFX_NETWORK === "ic") {
    return "https://identity.ic0.app";
  }

  // Safari does not support localhost subdomains
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) {
    return `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`;
  }

  return `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;
};

/**
 * Create an auth client
 */
export async function createClient() {
  const authClient = await AuthClient.create({
    idleOptions: {
      idleTimeout: 1000 * 60 * 30,
    },
  });
  return authClient;
}

/**
 * Create a new authenticated backend actor
 * @param identity
 */
export async function createBackendActor(identity: Identity) {
  return createActor(process.env.CANISTER_ID_BACKEND as string, {
    agentOptions: {
      identity,
    },
  });
}

/**
 * Convert plan candid variant to enum
 */
export function getPlan(member: Member) {
  if ((member.plan as any).Free === null) {
    return Plan.Free;
  }
  if ((member.plan as any).Elite === null) {
    return Plan.Elite;
  }
  if ((member.plan as any).Legendary === null) {
    return Plan.Legendary;
  }
}

/**
 * Get unique color for plan
 */
export function getPlanColor(plan: Plan) {
  switch (plan) {
    case Plan.Free:
      return "gray";
    case Plan.Elite:
      return "purple";
    case Plan.Legendary:
      return "orange";
  }
}
