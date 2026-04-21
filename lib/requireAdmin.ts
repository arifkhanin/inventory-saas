import { getUserContext } from "./getUserContext";

export async function requireAdmin(router: any) {
  const u = await getUserContext();

  console.log("USER CONTEXT:", u);

  if (!u) {
    router.push("/login");
    return null;
  }

  if (!["admin", "super_user"].includes(u.role)) {
    alert("Unauthorized");
    router.push("/");
    return null;
  }

  return u;
}