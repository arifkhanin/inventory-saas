import { supabase } from '../lib/supabase';

export const getUserContext = async () => {
  const { data } = await supabase.auth.getUser();
  const authUser = data.user;

  if (!authUser) return null;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser.id)   // ✅ THIS IS THE FIX
    .maybeSingle();                    // ✅ THIS AVOIDS 406

  if (error) {
    console.error("User fetch error:", error);
    return null;
  }

  return user;
};