import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { getUserContextApi } from "../../../lib/getUserContextApi";
import { canUser } from "../../../lib/permissions";

import {
  listVariants,
  createVariant,
} from "../../../lib/services/variantService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user =
      await getUserContextApi(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // --------------------------------
    // GET → List Variants
    // --------------------------------
    if (req.method === "GET") {
      if (
        !canUser(
          user,
          "variants.view"
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const { product_id } = req.query;

      if (
        !product_id ||
        typeof product_id !==
          "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "product_id is required",
        });
      }

      try {
        const data =
          await listVariants(
            product_id,
            user.client_id
          );

        return res.status(200).json({
          success: true,
          data,
        });
      } catch (error: any) {
        if (
          error.message ===
          "INVALID_ID"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product ID",
          });
        }

        throw error;
      }
    }

    // --------------------------------
    // POST → Create Variant
    // --------------------------------
    if (req.method === "POST") {
      if (
        !canUser(
          user,
          "variants.add"
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const {
        product_id,
      } = req.body;

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message:
            "product_id is required",
        });
      }

      try {
        const data =
          await createVariant(
            user.client_id,
            req.body
          );

        return res.status(201).json({
          success: true,
          data,
        });
      } catch (error: any) {
        if (
          error.message ===
          "INVALID_ID"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product ID",
          });
        }

        if (
          error.message ===
          "DUPLICATE_SKU"
        ) {
          return res.status(409).json({
            success: false,
            message:
              "SKU already exists",
          });
        }

        if (
          error.message ===
          "DUPLICATE_BARCODE"
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Barcode already exists",
          });
        }

        throw error;
      }
    }

    return res.status(405).json({
      success: false,
      message:
        "Method not allowed",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error",
    });
  }
}