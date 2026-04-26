import { supabase } from "./supabase";

export interface UpdateInventoryParams {
  client_id: string;
  branch_id: string;
  variant_id: string;

  type: string;

  quantity: number;

  stock_direction: number; 
  // allowed: -1, 0, 1

  unit_cost?: number | null;

  reference_type?: string | null;
  reference_id?: string | null;

  created_by?: string | null;
}

export async function updateInventory({
  client_id,
  branch_id,
  variant_id,
  type,
  quantity,
  stock_direction,
  unit_cost = null,
  reference_type = null,
  reference_id = null,
  created_by = null,
}: UpdateInventoryParams) {

  // 🚨 VALIDATION
  if (!client_id) throw new Error("client_id required");
  if (!branch_id) throw new Error("branch_id required");
  if (!variant_id) throw new Error("variant_id required");
  if (!type) throw new Error("type required");

  if (quantity === undefined || quantity === null || isNaN(quantity)) {
    throw new Error("valid quantity required");
  }

  // 🧠 UPDATED RULE: allow 0 (opening balance)
  if (![1, 0, -1].includes(stock_direction)) {
    throw new Error("stock_direction must be -1, 0, or 1");
  }

  // 📊 DELTA LOGIC
  const delta = Number(quantity) * stock_direction;

  // 🧾 1. INSERT TRANSACTION
  const { error: txError } = await supabase
    .from("inventory_transactions")
    .insert([
      {
        client_id,
        branch_id,
        variant_id,
        type,
        quantity,
        stock_direction,
        unit_cost,
        reference_type,
        reference_id,
        created_by,
      },
    ]);

  if (txError) {
    throw new Error("Transaction failed: " + txError.message);
  }

  // 📦 2. UPDATE SNAPSHOT

  const { data: existing, error: fetchError } = await supabase
    .from("inventory_snapshots")
    .select("*")
    .eq("client_id", client_id)
    .eq("branch_id", branch_id)
    .eq("variant_id", variant_id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (existing) {

    const newQty =
      stock_direction === 0
        ? Number(quantity) // 🧠 opening balance override
        : existing.quantity + delta;

    const { error: updateError } = await supabase
      .from("inventory_snapshots")
      .update({
        quantity: newQty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

  } else {

    const initialQty =
      stock_direction === 0
        ? Number(quantity)
        : delta;

    const { error: insertError } = await supabase
      .from("inventory_snapshots")
      .insert([
        {
          client_id,
          branch_id,
          variant_id,
          quantity: initialQty,
          snapshot_date: new Date().toISOString().split("T")[0],
        },
      ]);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return { success: true };
}