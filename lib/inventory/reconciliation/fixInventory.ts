import { validateInventory } from "./validateInventory";
import { smartRebuild } from "./smartRebuild";

/**
 * FIX INVENTORY
 *
 * - detects drift
 * - triggers smart rebuild if needed
 */
export async function fixInventory({
  client_id,
  branch_id,
}: {
  client_id: string;
  branch_id: string;
}) {
  // 🔍 1. Validate
  const validation = await validateInventory({
    client_id,
    branch_id,
  });

  if (!validation.has_drift) {
    return {
      success: true,
      message: "No drift detected",
    };
  }

  // 🔁 2. Rebuild using smart strategy
  const rebuildResult = await smartRebuild({
    client_id,
    branch_id,
  });

  return {
    success: true,
    fixed: true,
    strategy: rebuildResult.strategy,
    mismatch_count: validation.mismatch_count,
  };
}