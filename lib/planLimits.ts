export const PLAN_LIMITS: any = {
  basic: {
    max_users: 3,
    max_branches: 1,
  },
  pro: {
    max_users: 10,
    max_branches: 3,
  },
  enterprise: {
    max_users: Infinity,
    max_branches: Infinity,
  },
};

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.basic;
}