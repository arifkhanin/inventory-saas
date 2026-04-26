export function canUser(
  user: any,
  permissionCode: string
) {
  if (!user || !Array.isArray(user.permissions)) {
    return false;
  }

  return user.permissions.some((p: any) => {
    // Old string style
    if (typeof p === "string") {
      return p === permissionCode;
    }

    // New object style with code
    if (p?.code) {
      return p.code === permissionCode;
    }

    // Legacy object style module/action
    if (p?.module && p?.action) {
      return `${p.module}.${p.action}` === permissionCode;
    }

    return false;
  });
}