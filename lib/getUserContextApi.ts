import type { NextApiRequest } from "next";
import { createClient } from "@supabase/supabase-js";

export async function getUserContextApi(
  req: NextApiRequest
) {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const token =
      authHeader.replace("Bearer ", "");

    if (!token) {
      return null;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    /* -------------------------
       Get logged-in auth user
    ------------------------- */
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return null;
    }

    const authUserId =
      authData.user.id;

    /* -------------------------
       Load app user profile
    ------------------------- */
    const {
      data: user,
      error: userError,
    } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();

    if (userError || !user) {
      return null;
    }

    /* -------------------------
       Load permissions
    ------------------------- */
    const {
      data: groupData,
      error: groupError,
    } = await supabase
      .from("user_groups")
      .select(`
        groups (
          group_permissions (
            permission_definitions (
              code
            )
          )
        )
      `)
      .eq("user_id", user.id);

    if (groupError) {
      return null;
    }

    const permissions: string[] = [];

    groupData?.forEach((g: any) => {
      g.groups?.group_permissions?.forEach(
        (gp: any) => {
          const code =
            gp.permission_definitions
              ?.code;

          if (code) {
            permissions.push(code);
          }
        }
      );
    });

    const uniquePermissions = [
      ...new Set(permissions),
    ];

    return {
      ...user,
      permissions:
        uniquePermissions,
    };
  } catch (error) {
    console.error(
      "getUserContextApi error:",
      error
    );

    return null;
  }
}