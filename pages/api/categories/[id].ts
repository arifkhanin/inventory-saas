import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { getUserContextApi } from "../../../lib/getUserContextApi";
import { canUser } from "../../../lib/permissions";

import {
  updateCategory,
  deleteCategory,
} from "../../../lib/services/categoryService";

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

    // ---------------------------
    // PUT → Update Category
    // ---------------------------
    if (req.method === "PUT") {
      if (!canUser(user, "categories.update")) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const { name, parent_id } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      const data = await updateCategory(
        id,
        user.client_id,
        name,
        parent_id
      );

      return res.status(200).json({
        success: true,
        data,
      });
    }

    // ---------------------------
    // DELETE → Soft Delete Category
    // ---------------------------
    if (req.method === "DELETE") {
      if (!canUser(user, "categories.delete")) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const data = await deleteCategory(
        id,
        user.client_id
      );

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
    if (error.message === "INVALID_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }
  
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
  
    return res.status(500).json({
      success: false,
      message:
        error.message || "Server error",
    });
  }
}