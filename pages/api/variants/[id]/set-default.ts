import type { NextApiRequest, NextApiResponse } from "next";

import { getUserContextApi } from "../../../../lib/getUserContextApi";

import { canUser } from "../../../../lib/permissions";

import {
  setDefaultVariant,
} from "../../../../lib/services/variantService";

// --------------------------------------------------
// PATCH /api/variants/[id]/set-default
// --------------------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let userContext: any = null;
  let variantId: string | null = null;

  if (req.method !== "PATCH") {
    return res.status(405).json({
      success: false,
      error: "METHOD_NOT_ALLOWED",
    });
  }

  try {
    // --------------------------------------------------
    // AUTH
    // --------------------------------------------------

    userContext = await getUserContextApi(req);

    if (!userContext) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
      });
    }

    // --------------------------------------------------
    // PARAMS
    // --------------------------------------------------

    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
      });
    }

    variantId = id;

    // --------------------------------------------------
    // PERMISSION
    // --------------------------------------------------

    if (!canUser(userContext, "variants.set_default")) {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
      });
    }

    // --------------------------------------------------
    // EXECUTE
    // --------------------------------------------------

    const data = await setDefaultVariant(
      variantId,
      userContext.client_id
    );

    return res.status(200).json({
      success: true,
      data,
    });

  } catch (error: any) {

    // --------------------------------------------------
    // DOMAIN ERRORS
    // --------------------------------------------------

    if (error?.message === "INVALID_ID") {
      return res.status(400).json({
        success: false,
        error: "INVALID_ID",
      });
    }

    if (error?.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "NOT_FOUND",
      });
    }

    // --------------------------------------------------
    // SUPABASE ERRORS
    // --------------------------------------------------

    if (error?.code || error?.details || error?.hint) {
      console.error("SUPABASE_ERROR_SET_DEFAULT_VARIANT", {
        variant_id: variantId,
        client_id: userContext?.client_id ?? null,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    } else {
      console.error("UNEXPECTED_SET_DEFAULT_VARIANT_ERROR", {
        variant_id: variantId,
        client_id: userContext?.client_id ?? null,
        error,
      });
    }

    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}