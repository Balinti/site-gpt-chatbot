// Client-safe constants - can be imported in both client and server components

export const LOCAL_STORAGE_KEYS = {
  TICKETS: 'sitegpt_tickets',
  AUDIT_LOG: 'sitegpt_audit_log',
  USAGE: 'sitegpt_usage',
  CONTAINED_COUNT: 'sitegpt_contained_count',
  POLICY: 'sitegpt_policy',
}

export const PLAN_LIMITS = {
  free: {
    generatedPerMonth: 50,
    containedPerMonth: 50,
  },
  starter: {
    generatedPerMonth: 500,
    containedPerMonth: 500,
  },
  growth: {
    generatedPerMonth: 2000,
    containedPerMonth: 2000,
  },
}
