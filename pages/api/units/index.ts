import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import { getUserContextApi } from "../../../lib/getUserContextApi";
import { canUser } from "../../../lib/permissions";

import {
  listUnits,
  createUnit,
} from "../../../lib/services/unitService";

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

    if (req.method === "GET") {
      if (!canUser(user, "units.view")) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const data = await listUnits(
        user.client_id
      );

      return res.status(200).json({
        success: true,
        data,
      });
    }

    if (req.method === "POST") {
      if (!canUser(user, "units.add")) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const { name, symbol } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      const data = await createUnit(
        user.client_id,
        name,
        symbol
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
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error",
    });
  }
}