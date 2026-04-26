import { supabase } from "../../supabase";
import { rebuildInventory } from "./rebuildInventory";
import { rebuildInventoryForFY } from "./rebuildInventoryForFY";

/**
 * SMART REBUILD CONTROLLER
 *
 * Decides whether to:
 * - use GLOBAL rebuild
 * - use FY rebuild
 */
export async function smartRebuild({
  client_id,
  branch_id,
}: {
  client_id: string;
  branch_id: string;
}) {
  // 🧾 1. Find current financial year
  const today = new Date().toISOString().split("T")[0];

  const { data: fy, error: fyError } = await supabase
    .from("financial_years")
    .select("*")
    .eq("client_id", client_id)
    .eq("branch_id", branch_id)
    .lte("start_date", today)
    .gte("end_date", today)
    .maybeSingle();

  if (fyError) {
    throw new Error("Failed to fetch financial year: " + fyError.message);
  }

  // ❌ No FY → fallback to GLOBAL
  if (!fy) {
    return {
      strategy: "GLOBAL_NO_FY",
      result: await rebuildInventory({ client_id, branch_id }),
    };
  }

  // 🧾 2. Check if opening balance exists
  const { data: openingCheck, error: openErr } = await supabase
    .from("inventory_period_snapshots")
    .select("id")
    .eq("financial_year_id", fy.id)
    .limit(1);

  if (openErr) {
    throw new Error(
      "Failed to check opening balance: " + openErr.message
    );
  }

  const hasOpeningBalance =
    openingCheck && openingCheck.length > 0;

  // ❌ No opening balance → fallback to GLOBAL
  if (!hasOpeningBalance) {
    return {
      strategy: "GLOBAL_NO_OPENING_BALANCE",
      result: await rebuildInventory({ client_id, branch_id }),
    };
  }

  // ✅ Use FY rebuild
  return {
    strategy: "FY_REBUILD",
    result: await rebuildInventoryForFY({
      financial_year_id: fy.id,
      client_id,
      branch_id,
    }),
  };
}