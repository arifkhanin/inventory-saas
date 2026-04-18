import { supabase } from '../lib/supabase';

export const signUp = async (
  email: string,
  password: string,
  meta?: {
    name?: string;
    companyName?: string;
    branchName?: string;
  }
) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
  
    if (error) {
      console.error("SIGNUP ERROR:", error);
      throw error;
    }
  
    console.log("AUTH USER CREATED:", data.user);
  
    if (data.user) {
  
      // ✅ STEP 1: Create client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert([
          {
            name: meta?.companyName || 'Default Company'
          }
        ])
        .select()
        .single();
  
      if (clientError) {
        console.error("CLIENT ERROR:", clientError);
        return;
      }
  
      console.log("CLIENT CREATED:", client);
  
      // ✅ STEP 2: Create branch
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .insert([
          {
            name: meta?.branchName || 'Main Branch',
            client_id: client.id
          }
        ])
        .select()
        .single();
  
      if (branchError) {
        console.error("BRANCH ERROR:", branchError);
        return;
      }
  
      console.log("BRANCH CREATED:", branch);
  
      // ✅ STEP 3: Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();
  
      if (existingUser) {
        console.log("USER ALREADY EXISTS");
        return;
      }
  
      // ✅ STEP 4: Create user
      const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        {
          auth_user_id: data.user.id,
          email: email,
          name: meta?.name || 'User',
          client_id: client.id,
          branch_id: branch.id
        }
      ]);
  
      if (userError) {
        console.error("USER INSERT ERROR:", userError);
      } else {
        console.log("USER CONTEXT CREATED");
      }
    }
  
    return data;
  };
      
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return data;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getUserContext = async () => {
  const { data } = await supabase.auth.getUser();
  const authUser = data.user;

  if (!authUser) return null;

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', authUser.id)
    .single();

  return user;
};