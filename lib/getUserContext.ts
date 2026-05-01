import { supabase } from "./supabase";

export const getUserContext = async () => {
  const { data: authData } =
    await supabase.auth.getUser();

  if (!authData.user) {
    return null;
  }

  const authUserId = authData.user.id;

  const { data: user, error } =
    await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();

  if (error || !user) {
    return null;
  }

  const { data: groupData } =
    await supabase
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

  const permissions: string[] = [];

  groupData?.forEach((g: any) => {
    g.groups?.group_permissions?.forEach(
      (gp: any) => {
        const code =
          gp.permission_definitions?.code;

        if (code) permissions.push(code);
      }
    );
  });

  return {
    ...user,
    permissions: [...new Set(permissions)],
  };
};