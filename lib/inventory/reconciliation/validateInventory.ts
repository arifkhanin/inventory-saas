import { supabase } from "../../supabase";

/**
 * VALIDATE INVENTORY
 *
 * Compares:
 * - computed stock from transactions
 * vs
 * - current snapshot
 *
 * Detects drift
 */
export async function validateInventory({
  client_id,
  branch_id,
}: {
  client_id: string;
  branch_id: string;
}) {
  // 🧾 1. Fetch all transactions
  const { data: txns, error: txError } = await supabase
    .from("inventory_transactions")
    .select("variant_id, quantity, stock_direction")
    .eq("client_id", client_id)
    .eq("branch_id", branch_id);

  if (txError) {
    throw new Error("Failed to fetch transactions: " + txError.message);
  }

  // 📦 2. Fetch snapshots
  const { data: snapshots, error: snapError } = await supabase
    .from("inventory_snapshots")
    .select("variant_id, quantity")
    .eq("client_id", client_id)
    .eq("branch_id", branch_id);

  if (snapError) {
    throw new Error("Failed to fetch snapshots: " + snapError.message);
  }

  // 🧠 3. Compute expected stock
  const computed: Record<string, number> = {};
  const snapshotMap: Record<string, number> = {};

  for (const t of txns || []) {
    const delta = Number(t.quantity) * Number(t.stock_direction || 0);
    computed[t.variant_id] = (computed[t.variant_id] || 0) + delta;
  }

  for (const s of snapshots || []) {
    snapshotMap[s.variant_id] = Number(s.quantity);
  }

  // 🔍 4. Compare
  const mismatches: {
    variant_id: string;
    expected: number;
    actual: number;
    diff: number;
  }[] = [];

  const allVariants = new Set([
    ...Object.keys(computed),
    ...Object.keys(snapshotMap),
  ]);

  for (const variant_id of allVariants) {
    const expected = computed[variant_id] || 0;
    const actual = snapshotMap[variant_id] || 0;

    if (expected !== actual) {
      mismatches.push({
        variant_id,
        expected,
        actual,
        diff: expected - actual,
      });
    }
  }

  return {
    has_drift: mismatches.length > 0,
    mismatch_count: mismatches.length,
    mismatches,
  };
}