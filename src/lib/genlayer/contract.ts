import type { CalldataEncodable, GenLayerClient, TransactionHash } from "genlayer-js/types";
import { CONTRACT_ADDRESS, REQUIRED_METHODS } from "./config";
import { createReadClient } from "./read-client";
import type { Policy, Quote, Summary } from "../types";

type Client = GenLayerClient<typeof import("./config").chain>;

export async function verifyContractSchema() {
  if (!CONTRACT_ADDRESS) return { ok: false, missing: REQUIRED_METHODS, configured: false };
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  const schema = await readMaybe<{ methods: Record<string, unknown> }>(() => client.getContractSchema(address));
  if (!schema) return { ok: false, missing: REQUIRED_METHODS, configured: true };
  const missing = REQUIRED_METHODS.filter((method) => !schema.methods[method]);
  return { ok: missing.length === 0, missing, configured: true };
}

export async function getSummary(): Promise<Summary> {
  if (!CONTRACT_ADDRESS) return emptySummary();
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  return (await readMaybe<Summary>(() => client.readContract({ address, functionName: "get_summary", args: [] }))) ?? emptySummary();
}

export async function listPolicies(): Promise<Policy[]> {
  if (!CONTRACT_ADDRESS) return [];
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  return (await readMaybe<Policy[]>(() => client.readContract({
    address,
    functionName: "list_policies",
    args: [0n, 100n],
  }))) ?? [];
}

export async function listPoliciesByHolder(account: `0x${string}`): Promise<Policy[]> {
  if (!CONTRACT_ADDRESS) return [];
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  return (await readMaybe<Policy[]>(() => client.readContract({
    address,
    functionName: "list_policies_by_holder",
    args: [account, 0n, 100n],
  }))) ?? [];
}

export async function getPolicy(id: string): Promise<Policy | undefined> {
  if (!CONTRACT_ADDRESS) return undefined;
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  return readMaybe<Policy>(() => client.readContract({ address, functionName: "get_policy", args: [id] }));
}

export async function getQuote(id: string): Promise<Quote | undefined> {
  if (!CONTRACT_ADDRESS) return undefined;
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  return readMaybe<Quote>(() => client.readContract({ address, functionName: "get_quote", args: [id] }));
}

export async function listQuotesByRequester(account: `0x${string}`): Promise<Quote[]> {
  if (!CONTRACT_ADDRESS) return [];
  const address = CONTRACT_ADDRESS;
  const client = createReadClient();
  return (await readMaybe<Quote[]>(() => client.readContract({
    address,
    functionName: "list_quotes_by_requester",
    args: [account, 0n, 50n],
  }))) ?? [];
}

export type QuoteFingerprint = Pick<
  Quote,
  "peril" | "location_label" | "latitude" | "longitude" | "threshold_value" | "window" |
  "coverage_start" | "coverage_end" | "requested_payout"
>;

/** Find the quote created by a finalized request using the contract's authoritative global
 * sequence and direct quote reads. The requester-filtered view is intentionally not used here:
 * it has returned an empty list for finalized StudioNet writes due to address encoding. Scanning
 * every ID created after our pre-write snapshot also avoids mistaking a concurrent user's quote
 * for ours. */
export async function findFinalizedQuote(
  countBefore: bigint,
  requester: `0x${string}`,
  expected: QuoteFingerprint,
): Promise<Quote> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const summary = await getSummary();
    const countAfter = BigInt(summary.quote_count);
    for (let sequence = countAfter; sequence > countBefore; sequence -= 1n) {
      const quote = await getQuote(`ZSQ-${sequence}`);
      if (quote && quoteMatches(quote, requester, expected)) return quote;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
  }
  throw new Error(
    "No new on-chain quote was recorded for this request. The consensus round may have timed out " +
    "(Validators Timeout, nothing written) or VITE_ZEROSKY_CONTRACT may point at a different deployment " +
    "than the transaction was sent to. Check the tx in the explorer against the configured contract.",
  );
}

function quoteMatches(quote: Quote, requester: string, expected: QuoteFingerprint) {
  return quote.requester.toLowerCase() === requester.toLowerCase()
    && quote.peril === expected.peril
    && quote.location_label === expected.location_label
    && quote.latitude === expected.latitude
    && quote.longitude === expected.longitude
    && quote.threshold_value === expected.threshold_value
    && quote.window === expected.window
    && quote.coverage_start === expected.coverage_start
    && quote.coverage_end === expected.coverage_end
    && quote.requested_payout === expected.requested_payout;
}

export async function writeContract(
  client: Client,
  functionName: string,
  args: CalldataEncodable[],
  value: bigint,
) {
  if (!CONTRACT_ADDRESS) throw new Error("No deployed contract address is configured.");
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args,
    value,
    consensusMaxRotations: 3,
  });
  return hash as TransactionHash;
}

function emptySummary(): Summary {
  return {
    admin: "",
    policy_count: 0,
    quote_count: 0,
    pool_balance: "0",
    outstanding_liability: "0",
    contract_balance: "0",
  };
}

async function readMaybe<T>(read: () => Promise<unknown>): Promise<T | undefined> {
  try {
    return (await read()) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("execution failed") ||
      message.includes("Missing or invalid parameters") ||
      message.includes("Rate limit exceeded") ||
      message.includes("QueuePool limit") ||
      message.includes("Unexpected token")
    ) {
      return undefined;
    }
    throw error;
  }
}

// Studio can report a valid SUCCESS GenVM trace while the overall consensus never reached
// agreement (the tx ends at VALIDATORS_TIMEOUT). The GenVM execution_result alone is
// therefore not enough to call a write committed: the terminal tx status must also be one of
// the success states and the leader receipt must report a successful execution.
const DECIDED_STATUSES = new Set([
  "ACCEPTED",
  "FINALIZED",
  "CANCELED",
  "UNDETERMINED",
  "VALIDATORS_TIMEOUT",
  "LEADER_TIMEOUT",
]);
const SUCCESS_STATUSES = new Set(["ACCEPTED", "FINALIZED"]);

export async function waitAccepted(client: Client, hash: TransactionHash) {
  const deadline = Date.now() + 15 * 60 * 1000;
  let finalized = await client.getTransaction({ hash });

  for (;;) {
    const status = String(finalized?.statusName ?? finalized?.status ?? "");
    if (DECIDED_STATUSES.has(status)) break;
    if (Date.now() > deadline) {
      throw new Error(
        `Timed out waiting for consensus on ${hash}: still in state "${status || "UNKNOWN"}". ` +
        "Nothing was written on-chain; no GEN moved.",
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 4000));
    finalized = await client.getTransaction({ hash });
  }

  const status = String(finalized?.statusName ?? finalized?.status ?? "");
  if (!SUCCESS_STATUSES.has(status)) {
    throw new Error(
      `GenLayer consensus for ${hash} ended in state ${status}, not a committed write. ` +
      "No quote or policy was recorded and no payouts can be expected; retry the request, and check the tx in the explorer.",
    );
  }

  const result = finalized?.consensus_data?.leader_receipt?.[0]?.execution_result;
  if (result && result !== "SUCCESS") {
    throw new Error(`GenLayer contract execution failed (${result}). Transaction: ${hash}`);
  }
  return finalized;
}
