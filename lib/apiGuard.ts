import { supabase } from "./supabase";
import { canUser } from "./permissions";

export async function apiGuard(
  req: any,
  res: any,
  module: string,
  action: string
) {
  const { user } = req.body;

  console.log("User Context api guard:", user);

  if (!user || !user.id) {
    res.status(401).send("Unauthorized");
    return null;
  }

  const { data: dbUser, error } = await supabase
    .from("users")
    .select(`
      *,
      user_groups (
        groups (
          group_permissions (
            permission_id,
            permission_definitions (
              code
            )
          )
        )
      )
    `)
    .eq("id", user.id)
    .single();

  if (error || !dbUser) {
    res.status(401).send("Invalid user");
    return null;
  }

  // Flatten permissions
  const permissions: string[] = [];

  dbUser.user_groups?.forEach((ug: any) => {
    ug.groups?.group_permissions?.forEach((gp: any) => {
      const code =
        gp.permission_definitions?.code;

      if (code) {
        permissions.push(code);
      }
    });
  });

  dbUser.permissions = [...new Set(permissions)];

  const permissionCode = `${module}.${action}`;

  if (!canUser(dbUser, permissionCode)) {
    res.status(403).send("Forbidden");
    return null;
  }

  return dbUser;
}