import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { getUserContextApi } from "../../../lib/getUserContextApi";
import { canUser } from "../../../lib/permissions";

import {
  listCategories,
  createCategory,
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

    // ---------------------------
    // GET → List Categories
    // ---------------------------
    if (req.method === "GET") {
      if (!canUser(user, "categories.view")) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const data = await listCategories(
        user.client_id
      );

      return res.status(200).json({
        success: true,
        data,
      });
    }

    // ---------------------------
    // POST → Create Category
    // ---------------------------
    if (req.method === "POST") {
      if (!canUser(user, "categories.add")) {
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

      const data = await createCategory(
        user.client_id,
        name,
        parent_id
      );

      return res.status(201).json({
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

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error",
    });
  }
}