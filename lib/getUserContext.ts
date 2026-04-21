// lib/getUserContext.ts

import { supabase } from './supabase';

export const getUserContext = async () => {
  // 1. Get logged-in auth user
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    console.error("No auth user");
    return null;
  }

  const authUserId = authData.user.id;

  // 2. Fetch user profile
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  if (userError || !user) {
    console.error("User profile missing", userError);
    return null;
  }

  // 3. Fetch groups + permissions
  const { data: groupData, error: groupError } = await supabase
    .from('user_groups')
    .select(`
      group_id,
      groups (
        group_permissions (
          permissions (module, action)
        )
      )
    `)
    .eq('user_id', user.id);

  if (groupError) {
    console.error("Error fetching groups", groupError);
  }

  // 4. Flatten permissions
  const permissions: any[] = [];

  groupData?.forEach((g) => {
    g.groups?.group_permissions?.forEach((gp: any) => {
      if (gp.permissions) {
        permissions.push(gp.permissions);
      }
    });
  });

  // 5. Remove duplicates
  const uniquePermissions = Array.from(
    new Map(
      permissions.map((p) => [`${p.module}-${p.action}`, p])
    ).values()
  );

  // 6. Return full context
  return {
    ...user,
    permissions: uniquePermissions,
  };
};