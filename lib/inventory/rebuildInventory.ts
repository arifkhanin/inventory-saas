import { supabase } from "../supabase";

export async function rebuildInventory({
  client_id,
  branch_id,
}: {
  client_id: string;
  branch_id: string;
}) {
  if (!client_id) throw new Error("client_id required");
  if (!branch_id) throw new Error("branch_id required");

  // 🧾 1. FETCH ALL TRANSACTIONS
  const { data: txns, error } = await supabase
    .from("inventory_transactions")
    .select("variant_id, quantity, stock_direction")
    .eq("client_id", client_id)
    .eq("branch_id", branch_id);

  if (error) throw new Error(error.message);

  // 🧠 2. COMPUTE STOCK MAP IN MEMORY
  const map: Record<string, number> = {};

  for (const t of txns || []) {
    const delta = Number(t.quantity) * Number(t.stock_direction || 0);

    map[t.variant_id] = (map[t.variant_id] || 0) + delta;
  }

  // 📦 3. FETCH EXISTING SNAPSHOTS
  const { data: snapshots, error: snapErr } = await supabase
    .from("inventory_snapshots")
    .select("*")
    .eq("client_id", client_id)
    .eq("branch_id", branch_id);

  if (snapErr) throw new Error(snapErr.message);

  const snapshotMap: Record<string, any> = {};

  for (const s of snapshots || []) {
    snapshotMap[s.variant_id] = s;
  }

  // 🔁 4. UPSERT REBUILT VALUES
  for (const variant_id of Object.keys(map)) {
    const computedQty = map[variant_id];

    const existing = snapshotMap[variant_id];

    if (existing) {
      await supabase
        .from("inventory_snapshots")
        .update({
          quantity: computedQty,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("inventory_snapshots").insert([
        {
          client_id,
          branch_id,
          variant_id,
          quantity: computedQty,
          snapshot_date: new Date().toISOString().split("T")[0],
        },
      ]);
    }
  }

  return {
    success: true,
    rebuilt_variants: Object.keys(map).length,
  };
}