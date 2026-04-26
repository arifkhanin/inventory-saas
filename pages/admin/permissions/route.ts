import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/getUserContext";
import { canUser } from "@/lib/canUser";

export async function GET() {
  const supabase = await createClient();

  const user = await getUserContext();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!canUser(user, "permissions.view")){
    return new Response("Forbidden", { status: 403 });
  }

  const { data, error } = await supabase
    .from("permission_definitions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return Response.json(data || []);
}

export async function POST() {
  return new Response(
    "Permission definitions are system managed",
    { status: 405 }
  );
}