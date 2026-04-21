import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1. Get token from header
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // 2. Create Supabase client with user token
    const supabaseUser = createClient(
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

    // 3. Get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: "Invalid user" });
    }

    // 4. Fetch user role from DB
    const { data: dbUser } = await supabaseAdmin
      .from("users")
      .select("role, client_id")
      .eq("auth_user_id", user.id)
      .single();

    if (!dbUser) {
      return res.status(403).json({ error: "User not found" });
    }

    // 5. Check role
    if (dbUser.role !== "admin" && dbUser.role !== "super_user") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // 6. Get request body
    const { name, email, client_id, branch_id } = req.body;

    if (!name || !email || !client_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // 7. Enforce same client (VERY IMPORTANT)
    if (client_id !== dbUser.client_id) {
      return res.status(403).json({ error: "Invalid client access" });
    }

    // 8. Create auth user
    const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: "Default@1234",
      email_confirm: true,
      user_metadata: {
        temp_password: true,
      },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const authUserId = authData.user.id;

    // 9. Insert into users table
    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        auth_user_id: authUserId,
        name,
        email,
        client_id,
        branch_id,
        role: "branch_user",
      });

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}