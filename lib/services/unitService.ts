import { supabaseAdmin } from "../supabaseAdmin";

export async function listUnits(clientId: string) {
  const { data, error } = await supabaseAdmin
    .from("units")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

export async function createUnit(clientId: string, name: string, symbol?: string) {
  const { data, error } = await supabaseAdmin
    .from("units")
    .insert([
      {
        client_id: clientId,
        name: name.trim(),
        symbol: symbol?.trim() || null
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUnit(
  id: string,
  clientId: string,
  name: string,
  symbol?: string
) {
  const { data, error } = await supabaseAdmin
    .from("units")
    .update({
      name: name.trim(),
      symbol: symbol || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("client_id", clientId)
    .select()
    .maybeSingle();

  if (error) {
    if (error.message?.toLowerCase().includes("uuid")) {
      throw new Error("INVALID_ID");
    }
    throw error;
  }

  if (!data) {
    throw new Error("NOT_FOUND");
  }

  return data;
}

export async function deleteUnit(
  id: string,
  clientId: string
) {
  const { data, error } = await supabaseAdmin
    .from("units")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("client_id", clientId)
    .select()
    .maybeSingle();

  if (error) {
    if (error.message?.toLowerCase().includes("uuid")) {
      throw new Error("INVALID_ID");
    }
    throw error;
  }

  if (!data) {
    throw new Error("NOT_FOUND");
  }

  return data;
}