import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { getUserContextApi } from "../../../lib/getUserContextApi";
import { canUser } from "../../../lib/permissions";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import {
  updateProduct,
  archiveProduct,
  restoreProduct,
} from "../../../lib/services/productService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await getUserContextApi(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    const { id, action } = req.query;

    if (
      !id ||
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid ID",
      });
    }

    // -----------------------------------
    // PUT → UPDATE PRODUCT (unchanged)
    // -----------------------------------
    if (req.method === "PUT") {
      if (!canUser(user, "products.update")) {
        return res.status(403).json({
          success: false,
          error: "FORBIDDEN",
          message: "Forbidden",
        });
      }

      const name = req.body?.name?.trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Name is required",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("products")
        .update({
          name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("client_id", user.client_id)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          error: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    }

      // -----------------------------------
    // PATCH → ARCHIVE PRODUCT
    // -----------------------------------
    if (
      req.method === "PATCH" &&
      action === "archive"
    ) {
      if (!canUser(user, "products.archive")) {
        return res.status(403).json({
          success: false,
          error: "FORBIDDEN",
          message: "Forbidden",
        });
      }

      const data = await archiveProduct(
        id,
        user.client_id
      );

      return res.status(200).json({
        success: true,
        data,
      });
    }

    // -----------------------------------
    // PATCH → RESTORE PRODUCT
    // -----------------------------------
    if (
      req.method === "PATCH" &&
      action === "restore"
    ) {
      if (!canUser(user, "products.restore")) {
        return res.status(403).json({
          success: false,
          error: "FORBIDDEN",
          message: "Forbidden",
        });
      }

      const data = await restoreProduct(
        id,
        user.client_id
      );

      return res.status(200).json({
        success: true,
        data,
      });
    }

    // -----------------------------------
    // DELETE → RPC LIFECYCLE CONTROL (NEW)
    // -----------------------------------
    if (req.method === "DELETE") {
      if (!canUser(user, "products.delete")) {
        return res.status(403).json({
          success: false,
          error: "FORBIDDEN",
          message: "Forbidden",
        });
      }

      const { data, error } = await supabaseAdmin.rpc(
        "soft_delete_product_with_variants",
        {
          p_product_id: id,
          p_client_id: user.client_id,
          p_reason: "PRODUCT_DELETE_REQUEST",
          p_requested_by: user.id,
        }
      );

      // -----------------------------
      // RPC ERROR HANDLING
      // -----------------------------
      if (error) {
        const msg = error.message;

        if (msg === "NOT_FOUND") {
          return res.status(404).json({
            success: false,
            error: "NOT_FOUND",
            message: "Product not found",
          });
        }

        if (msg === "PRODUCT_HAS_INVENTORY_HISTORY") {
          return res.status(409).json({
            success: false,
            error: "PRODUCT_HAS_INVENTORY_HISTORY",
            message: "Product has inventory history and cannot be deleted",
          });
        }

        console.error("PRODUCT_DELETE_RPC_ERROR", {
          product_id: id,
          client_id: user.client_id,
          error,
        });

        return res.status(500).json({
          success: false,
          error: "INTERNAL_SERVER_ERROR",
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
      error: "METHOD_NOT_ALLOWED",
      message: "Method not allowed",
    });

  } catch (error: any) {
    console.error("PRODUCT_BY_ID_API_ERROR", error);
  
    if (error.message === "INVALID_ID") {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
        message: "Invalid ID",
      });
    }
  
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Product not found",
      });
    }
  
    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Server error",
    });
  }
}