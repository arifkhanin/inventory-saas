export async function rebuildInventoryForFY({
  financial_year_id,
  client_id,
  branch_id,
}: {
  financial_year_id: string;
  client_id: string;
  branch_id: string;
}) {
  // 🧾 1. Get FY boundaries
  const { data: fy, error: fyError } = await supabase
    .from("financial_years")
    .select("*")
    .eq("id", financial_year_id)
    .single();

  if (fyError) throw new Error(fyError.message);

  // 🧾 2. Fetch transactions within FY
  const { data: txns, error: txError } = await supabase
    .from("inventory_transactions")
    .select("variant_id, quantity, stock_direction, created_at")
    .eq("client_id", client_id)
    .eq("branch_id", branch_id)
    .gte("created_at", fy.start_date)
    .lte("created_at", fy.end_date);

  if (txError) throw new Error(txError.message);

  // 🧠 3. Compute stock per variant
  const map: Record<string, number> = {};

  for (const t of txns || []) {
    const delta = Number(t.quantity) * Number(t.stock_direction || 0);
    map[t.variant_id] = (map[t.variant_id] || 0) + delta;
  }

  // 📦 4. UPSERT FY SNAPSHOTS
  for (const variant_id of Object.keys(map)) {
    const closingQty = map[variant_id];

    const { data: existing } = await supabase
      .from("inventory_period_snapshots")
      .select("*")
      .eq("financial_year_id", financial_year_id)
      .eq("variant_id", variant_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("inventory_period_snapshots")
        .update({
          closing_quantity: closingQty,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("inventory_period_snapshots").insert([
        {
          financial_year_id,
          client_id,
          branch_id,
          variant_id,
          closing_quantity: closingQty,
        },
      ]);
    }
  }

  return {
    success: true,
    processed_variants: Object.keys(map).length,
  };
}