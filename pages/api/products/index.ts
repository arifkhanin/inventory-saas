import type {
  NextApiRequest,
  NextApiResponse
} from "next";

import { getUserContextApi } from "../../../lib/getUserContextApi";
import { canUser } from "../../../lib/permissions";

import {
  listProducts,
  createProduct
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
        message: "Unauthorized"
      });
    }

    // -----------------------------
    // GET /api/products
    // -----------------------------
    if (req.method === "GET") {
      if (!canUser(user, "products.view")) {
        return res.status(403).json({
          success: false,
          error: "FORBIDDEN",
          message: "Forbidden"
        });
      }

      const data = await listProducts(user.client_id);

      return res.status(200).json({
        success: true,
        data
      });
    }

    // -----------------------------
    // POST /api/products
    // -----------------------------
    if (req.method === "POST") {
      if (!canUser(user, "products.add")) {
        return res.status(403).json({
          success: false,
          error: "FORBIDDEN",
          message: "Forbidden"
        });
      }

      const name = req.body?.name?.trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Name is required"
        });
      }

      const data = await createProduct(user.client_id, {
        ...req.body,
        name
      });

      return res.status(201).json({
        success: true,
        data
      });
    }

    return res.status(405).json({
      success: false,
      error: "METHOD_NOT_ALLOWED",
      message: "Method not allowed"
    });

  } catch (error: any) {
    console.error("PRODUCTS_API_ERROR", error);

    if (error.message === "DUPLICATE_BARCODE") {
      return res.status(409).json({
        success: false,
        error: "DUPLICATE_BARCODE",
        message: "Barcode already exists"
      });
    }

    if (error.message === "DUPLICATE_SKU") {
      return res.status(409).json({
        success: false,
        error: "DUPLICATE_SKU",
        message: "SKU already exists"
      });
    }

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Server error"
    });
  }
}