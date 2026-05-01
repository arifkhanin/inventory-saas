import { supabaseAdmin } from "../supabaseAdmin";

export async function listCategories(clientId: string) {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, parent_id, created_at, updated_at")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return data;
}

export async function createCategory(
  clientId: string,
  name: string,
  parentId?: string | null
) {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      client_id: clientId,
      name: name.trim(),
      parent_id: parentId || null,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateCategory(
  id: string,
  clientId: string,
  name: string,
  parentId?: string | null
) {
  if (parentId === id) {
    throw new Error("Category cannot be its own parent");
  }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update({
      name: name.trim(),
      parent_id: parentId || null,
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

export async function deleteCategory(
  id: string,
  clientId: string
) {
  const { data, error } = await supabaseAdmin
    .from("categories")
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