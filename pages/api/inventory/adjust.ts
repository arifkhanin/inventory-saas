import { createAdjustment } from "../../../lib/inventory/createAdjustment";
import { apiGuard } from "../../../lib/apiGuard";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await apiGuard(req, res, "inventory", "adjust");

    if (!user) return;

    const { variant_id, quantity, direction, reason } = req.body;

    const result = await createAdjustment({
      client_id: user.client_id,
      branch_id: user.branch_id,
      user_id: user.id,
      variant_id,
      quantity,
      direction,
      reason,
    });

    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
}