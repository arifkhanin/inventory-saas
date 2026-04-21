export const canUser = (user: any, module: string, action: string) => {
    if (!user) return false;
  
    // Admin override
    if (user.role === 'admin') return true;
  
    return user.permissions?.some(
      (p: any) => p.module === module && p.action === action
    );
  };