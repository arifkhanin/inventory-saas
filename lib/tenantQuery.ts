export function applyTenantFilter(query, user) {
  // always enforce client isolation
  query = query.eq('client_id', user.client_id);

  // branch-level restriction
  if (user.role === 'branch_user') {
    query = query.eq('branch_id', user.branch_id);
  }

  return query;
}