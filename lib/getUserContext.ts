import { supabase } from "./supabase";

export const getUserContext = async () => {
  const { data: authData } =
    await supabase.auth.getUser();

  if (!authData.user) {
    console.error("No auth user");
    return null;
  }

  const authUserId = authData.user.id;

  /* ----------------------------------
     Load user profile
  -----------------------------------*/
  const { data: user, error: userError } =
    await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();

  if (userError || !user) {
    console.error(
      "User profile missing",
      userError
    );
    return null;
  }

  /* ----------------------------------
     Load group permissions
     user_groups
       -> groups
       -> group_permissions
       -> permission_definitions
  -----------------------------------*/
  const {
    data: groupData,
    error: groupError,
  } = await supabase
    .from("user_groups")
    .select(`
      group_id,
      groups (
        group_permissions (
          permission_id,
          permission_definitions (
            code
          )
        )
      )
    `)
    .eq("user_id", user.id);

  if (groupError) {
    console.error(
      "Error fetching groups",
      groupError
    )
    return null;
  };

  /* ----------------------------------
     Flatten permissions
  -----------------------------------*/
  const permissions: string[] = [];

  groupData?.forEach((g: any) => {
    g.groups?.group_permissions?.forEach((gp: any) => {
      if (gp.permission_definitions?.code) {
        permissions.push(gp.permission_definitions.code);
      }
    });
  });
  /* ----------------------------------
     Remove duplicates
  -----------------------------------*/
  const uniquePermissions = [
    ...new Set(permissions),
  ];

  console.log("User Context:", {
    userId: user.id,
    client_id: user.client_id,
    role: user.role,
    permissions: uniquePermissions,
  });
  
  /* ----------------------------------
     Return full context
  -----------------------------------*/
  return {
    ...user,
    permissions: uniquePermissions,
  };
};