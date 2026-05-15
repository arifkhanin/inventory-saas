import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { getUserContextApi } from "../../../lib/getUserContextApi";
import { canUser } from "../../../lib/permissions";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await getUserContextApi(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    // -----------------------------------
    // PUT → UPDATE VARIANT (unchanged)
    // -----------------------------------
    if (req.method === "PUT") {
      if (!canUser(user, "variants.update")) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const { variant_name, sku, barcode } = req.body;

      const { data, error } = await supabaseAdmin
        .from("product_variants")
        .update({
          variant_name,
          sku,
          barcode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("client_id", user.client_id)
        .select()
        .maybeSingle();

      if (error) {
        const msg = error.message?.toLowerCase() || "";

        if (msg.includes("duplicate")) {
          return res.status(409).json({
            success: false,
            message: "Duplicate SKU or Barcode",
          });
        }

        throw error;
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    }

    // -----------------------------------
    // DELETE → DELEGATE TO PRODUCT RPC
    // -----------------------------------
    if (req.method === "DELETE") {
      if (!canUser(user, "variants.delete")) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      // Step 1: resolve product_id from variant
      const { data: variant, error: fetchError } = await supabaseAdmin
        .from("product_variants")
        .select("product_id")
        .eq("id", id)
        .eq("client_id", user.client_id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }

      // Step 2: route through PRODUCT lifecycle RPC
      const { data, error } = await supabaseAdmin.rpc(
        "soft_delete_product_with_variants",
        {
          p_product_id: variant.product_id,
          p_client_id: user.client_id,
          p_reason: "VARIANT_DELETE_REQUEST",
          p_requested_by: user.id,
        }
      );

      // Step 3: RPC error handling
      if (error) {
        const msg = error.message;

        if (msg === "NOT_FOUND") {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }

        if (msg === "PRODUCT_HAS_INVENTORY_HISTORY") {
          return res.status(409).json({
            success: false,
            message: "Cannot delete product with inventory history",
          });
        }

        console.error("VARIANT_DELETE_RPC_ERROR", {
          variant_id: id,
          client_id: user.client_id,
          error,
        });

        return res.status(500).json({
          success: false,
          message: "Server error",
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });

  } catch (error: any) {
    console.error("VARIANT_API_ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}