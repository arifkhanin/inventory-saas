export const applyRoleFilter = (req: any, user: any) => {
  if (!user) return req;

  if (user.role === 'branch_user') {
    return req.eq('branch_id', user.branch_id);
  }

  if (user.role === 'super_user') {
    return req.eq('client_id', user.client_id);
  }

  // admin → no filter
  return req;
};