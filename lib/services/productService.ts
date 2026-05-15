import { supabaseAdmin } from "../supabaseAdmin";

/* ---------------------------
   LIST PRODUCTS
----------------------------*/
export async function listProducts(clientId: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(`
      id,
      name,
      sku,
      description,
      hsn_code,
      gst_rate,
      status,
      categories(name),
      units(name),
      product_variants(
        id,
        sku,
        barcode,
        is_default
      )
    `)
    .eq("client_id", clientId)
    .in("status", ["active"])
    .order("name");

  if (error) throw error;

  return data;
}

/* ---------------------------
   CREATE PRODUCT
----------------------------*/
export async function createProduct(clientId: string, payload: any) {
  const {
    name,
    category_id,
    base_unit_id,
    description,
    hsn_code,
    gst_rate,
    sku,
    barcode
  } = payload;

  const { data, error } = await supabaseAdmin.rpc(
    "create_product_with_default_variant",
    {
      p_client_id: clientId,
      p_name: name,
      p_category_id: category_id || null,
      p_base_unit_id: base_unit_id || null,
      p_description: description || null,
      p_hsn_code: hsn_code || null,
      p_gst_rate: gst_rate || null,
      p_sku: sku || null,
      p_barcode: barcode || null
    }
  );

  if (error) {
    const msg = error.message?.toLowerCase() || "";
  
    if (msg.includes("uuid")) {
      throw new Error("INVALID_ID");
    }
  
    if (msg.includes("ux_variant_client_barcode")) {
      throw new Error("DUPLICATE_BARCODE");
    }
  
    if (msg.includes("ux_variant_client_sku")) {
      throw new Error("DUPLICATE_SKU");
    }
  
    throw error;
  }

  return data?.data;
}
/* ---------------------------
   UPDATE PRODUCT
----------------------------*/
export async function updateProduct(
  id: string,
  clientId: string,
  payload: any
) {
  const {
    name,
    category_id,
    base_unit_id,
    description,
    hsn_code,
    gst_rate
  } = payload;

  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      name: name.trim(),
      category_id: category_id || null,
      base_unit_id: base_unit_id || null,
      description: description || null,
      hsn_code: hsn_code || null,
      gst_rate: gst_rate || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("client_id", clientId)
    .select()
    .maybeSingle();

  if (error) {
    const msg = error.message?.toLowerCase() || "";

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

/* ---------------------------
   DELETE PRODUCT (SOFT)
----------------------------*/
export async function deleteProduct(
  id: string,
  clientId: string
) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("client_id", clientId)
    .select()
    .maybeSingle();

  if (error) {
    const msg = error.message?.toLowerCase() || "";

    if (msg.includes("uuid")) {
      throw new Error("INVALID_ID");
    }

    throw error;
  }

  if (!data) {
    throw new Error("NOT_FOUND");
  }

  await supabaseAdmin
    .from("product_variants")
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq("product_id", id)
    .eq("client_id", clientId);

  return data;
}

/* ---------------------------
   ARCHIVE PRODUCT
----------------------------*/
export async function archiveProduct(
  id: string,
  clientId: string
) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      status: "archived",
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("client_id", clientId)
    .select()
    .maybeSingle();

    if (error) {
      const msg = error.message?.toLowerCase() || "";
    
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

/* ---------------------------
   RESTORE PRODUCT
----------------------------*/
export async function restoreProduct(
  id: string,
  clientId: string
) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      status: "active",
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("client_id", clientId)
    .select()
    .maybeSingle();

    if (error) {
      const msg = error.message?.toLowerCase() || "";
    
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