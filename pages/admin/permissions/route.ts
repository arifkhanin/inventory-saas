import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/getUserContext";
import { canUser } from "@/lib/canUser";

export async function GET() {
  const supabase = await createClient();
  const user = await getUserContext();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .eq("client_id", user.client_id)
    .order("module");

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const user = await getUserContext();
  
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }
  
    if (!canUser(user, "permissions", "add")) {
      return new Response("Forbidden", { status: 403 });
    }
  
    const { module, action } = await req.json();
  
    const normalizedModule = module.trim().toLowerCase();
  
    if (!normalizedModule || !action) {
      return new Response("Invalid input", { status: 400 });
    }
  
    const { error } = await supabase
      .from("permissions")
      .insert({
        client_id: user.client_id,
        module: normalizedModule,
        action,
      });
  
    if (error) {
      if (error.code === "23505") {
        return new Response("Permission already exists", { status: 400 });
      }
      return new Response(error.message, { status: 500 });
    }
  
    return Response.json({ success: true });
  }