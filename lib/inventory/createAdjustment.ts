import { updateInventory } from "../inventoryEngine";
import { supabase } from "../supabase";

type CreateAdjustmentInput = {
  client_id: string;
  branch_id: string;
  user_id: string;
  variant_id: string;
  quantity: number;
  direction: "increase" | "decrease";
  reason: string;
};

export async function createAdjustment({
  client_id,
  branch_id,
  user_id,
  variant_id,
  quantity,
  direction,
  reason,
}: CreateAdjustmentInput) {
  // Guards
  if (!client_id) throw new Error("client_id required");
  if (!branch_id) throw new Error("branch_id required");
  if (!user_id) throw new Error("user_id required");
  if (!variant_id) throw new Error("variant_id required");

  const qty = Number(quantity);

  if (!qty || qty <= 0) {
    throw new Error("Valid quantity required");
  }

  if (!reason || !reason.trim()) {
    throw new Error("Reason required");
  }

  const stock_direction = direction === "increase" ? 1 : -1;

  // 1. Inventory transaction + snapshot update
  await updateInventory({
    variant_id,
    branch_id,
    client_id,
    type: "adjustment",
    quantity: qty,
    stock_direction,
    reference_type: "manual_adjustment",
    notes: reason,
  });

  // 2. Audit log
  const { error } = await supabase.from("audit_logs").insert([
    {
      client_id,
      branch_id,
      user_id,
      module: "inventory",
      action: "adjustment",
      entity_id: variant_id,
      metadata: {
        quantity: qty,
        direction,
        reason,
      },
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
  };
}