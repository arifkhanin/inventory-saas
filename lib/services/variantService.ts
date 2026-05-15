import { supabaseAdmin } from "../supabaseAdmin";

// --------------------------------------------------
// LIST VARIANTS BY PRODUCT
// --------------------------------------------------
export async function listVariants(
  productId: string,
  clientId: string
) {
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select(`
      id,
      product_id,
      variant_name,
      sku,
      barcode,
      is_default,
      is_active,
      created_at,
      updated_at
    `)
    .eq("product_id", productId)
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("is_default", {
      ascending: false,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    const msg =
      error.message?.toLowerCase() || "";

    if (msg.includes("uuid")) {
      throw new Error("INVALID_ID");
    }

    throw error;
  }

  return data;
}

// --------------------------------------------------
// CREATE VARIANT
// --------------------------------------------------
export async function createVariant(
  clientId: string,
  payload: any
) {
  const {
    product_id,
    variant_name,
    sku,
    barcode,
  } = payload;

  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .insert({
      client_id: clientId,
      product_id,
      variant_name:
        variant_name?.trim() || null,
      sku: sku?.trim() || null,
      barcode:
        barcode?.trim() || null,
      is_default: false,
      is_active: true,
    })
    .select()
    .maybeSingle();

  if (error) {
    const msg =
      error.message?.toLowerCase() || "";

    if (msg.includes("uuid")) {
      throw new Error("INVALID_ID");
    }

    if (
      msg.includes(
        "ux_variant_client_barcode"
      )
    ) {
      throw new Error(
        "DUPLICATE_BARCODE"
      );
    }

    if (
      msg.includes(
        "ux_variant_client_sku"
      )
    ) {
      throw new Error(
        "DUPLICATE_SKU"
      );
    }

    throw error;
  }

  return data;
}

// --------------------------------------------------
// UPDATE VARIANT
// --------------------------------------------------
export async function updateVariant(
  id: string,
  clientId: string,
  payload: any
) {
  const {
    variant_name,
    sku,
    barcode,
  } = payload;

  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .update({
      variant_name:
        variant_name?.trim() || null,
      sku: sku?.trim() || null,
      barcode:
        barcode?.trim() || null,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .eq("client_id", clientId)
    .select()
    .maybeSingle();

  if (error) {
    const msg =
      error.message?.toLowerCase() || "";

    if (msg.includes("uuid")) {
      throw new Error("INVALID_ID");
    }

    if (
      msg.includes(
        "ux_variant_client_barcode"
      )
    ) {
      throw new Error(
        "DUPLICATE_BARCODE"
      );
    }

    if (
      msg.includes(
        "ux_variant_client_sku"
      )
    ) {
      throw new Error(
        "DUPLICATE_SKU"
      );
    }

    throw error;
  }

  if (!data) {
    throw new Error("NOT_FOUND");
  }

  return data;
}

// --------------------------------------------------
// DELETE VARIANT (SOFT DELETE)
// --------------------------------------------------
export async function deleteVariant(
  id: string,
  clientId: string
) {
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .update({
      is_active: false,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .eq("client_id", clientId)
    .select(`
      id,
      product_id,
      is_default
    `)
    .maybeSingle();

  if (error) {
    const msg =
      error.message?.toLowerCase() || "";

    if (msg.includes("uuid")) {
      throw new Error("INVALID_ID");
    }

    throw error;
  }

  if (!data) {
    throw new Error("NOT_FOUND");
  }

  return data;
}

// --------------------------------------------------
// SET DEFAULT VARIANT
// --------------------------------------------------
export async function setDefaultVariant(
  id: string,
  clientId: string
) {
  const { data, error } =
    await supabaseAdmin.rpc(
      "set_default_variant",
      {
        p_variant_id: id,
        p_client_id: clientId,
      }
    );

  if (error) {
    const msg =
      error.message?.toLowerCase() || "";

    if (msg.includes("uuid")) {
      throw new Error("INVALID_ID");
    }

    if (msg.includes("not_found")) {
      throw new Error("NOT_FOUND");
    }

    throw error;
  }

  return data;
}