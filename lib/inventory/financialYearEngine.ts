import { supabase } from "../supabase";

/**
 * ============================
 * FINANCIAL YEAR ENGINE (ERP CORE)
 * ============================
 *
 * Responsibilities:
 * 1. Manage financial year boundaries
 * 2. Define current FY context
 * 3. Generate opening balances for new FY
 * 4. Support reconciliation + inventory periodization
 */

/**
 * 🔵 1. GET CURRENT FINANCIAL YEAR
 */
export async function getCurrentFinancialYear({
  client_id,
  branch_id,
}: {
  client_id: string;
  branch_id: string;
}) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("financial_years")
    .select("*")
    .eq("client_id", client_id)
    .eq("branch_id", branch_id)
    .lte("start_date", today)
    .gte("end_date", today)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to fetch financial year: " + error.message);
  }

  return data;
}

/**
 * 🟢 2. CREATE FINANCIAL YEAR
 * (Used when setting up system or new branch)
 */
export async function createFinancialYear({
  client_id,
  branch_id,
  start_date,
  end_date,
}: {
  client_id: string;
  branch_id: string;
  start_date: string;
  end_date: string;
}) {
  const { data, error } = await supabase
    .from("financial_years")
    .insert([
      {
        client_id,
        branch_id,
        start_date,
        end_date,
        is_closed: false,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error("Failed to create financial year: " + error.message);
  }

  return data;
}

/**
 * 🔴 3. CLOSE FINANCIAL YEAR
 * (Locks FY from further modifications logically)
 */
export async function closeFinancialYear({
  financial_year_id,
}: {
  financial_year_id: string;
}) {
  const { error } = await supabase
    .from("financial_years")
    .update({
      is_closed: true,
    })
    .eq("id", financial_year_id);

  if (error) {
    throw new Error("Failed to close financial year: " + error.message);
  }

  return { success: true };
}

/**
 * 🟣 4. OPENING BALANCE GENERATION (CRITICAL STEP 3)
 *
 * Transfers closing stock of previous FY
 * into opening stock of new FY
 *
 * ERP Rule:
 * opening_quantity = previous FY closing_quantity
 */
export async function generateOpeningBalances({
  previous_fy_id,
  new_fy_id,
}: {
  previous_fy_id: string;
  new_fy_id: string;
}) {
  // 📦 1. Fetch previous FY closing snapshots
  const { data: prevSnapshots, error } = await supabase
    .from("inventory_period_snapshots")
    .select("*")
    .eq("financial_year_id", previous_fy_id);

  if (error) {
    throw new Error(
      "Failed to fetch previous FY snapshots: " + error.message
    );
  }

  if (!prevSnapshots || prevSnapshots.length === 0) {
    return {
      success: true,
      message: "No previous FY data found",
      processed: 0,
    };
  }

  // 🔁 2. Create opening balances for new FY
  for (const snap of prevSnapshots) {
    const { error: upsertError } = await supabase
      .from("inventory_period_snapshots")
      .upsert(
        {
          financial_year_id: new_fy_id,
          client_id: snap.client_id,
          branch_id: snap.branch_id,
          variant_id: snap.variant_id,

          // 🔵 KEY ERP RULE
          opening_quantity: snap.closing_quantity,
          closing_quantity: snap.closing_quantity,
        },
        {
          onConflict: "financial_year_id,variant_id,branch_id",
        }
      );

    if (upsertError) {
      throw new Error(
        "Failed to generate opening balance: " + upsertError.message
      );
    }
  }

  return {
    success: true,
    processed: prevSnapshots.length,
  };
}