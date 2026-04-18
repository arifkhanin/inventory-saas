import { getUserContext } from '../lib/getUserContext';
import { supabase } from '../lib/supabase';

export const canUser = async (permission: string) => {
    const user = await getUserContext();
    if (!user) return false;
  
    // 1. Get group ids
    const { data: userGroups } = await supabase
      .from('user_groups')
      .select('group_id')
      .eq('user_id', user.id);
  
    const groupIds = userGroups?.map(g => g.group_id) || [];
  
    if (groupIds.length === 0) return false;
  
    // 2. Get permission ids
    const { data: groupPerms } = await supabase
      .from('group_permissions')
      .select('permission_id')
      .in('group_id', groupIds);
  
    const permIds = groupPerms?.map(p => p.permission_id) || [];
  
    if (permIds.length === 0) return false;
  
    // 3. Match permission name
    const { data: perms } = await supabase
      .from('permissions')
      .select('name')
      .in('id', permIds);
  
    return perms?.some(p => p.name === permission);
  };