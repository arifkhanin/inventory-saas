import { supabase } from "../supabaseClient";

export type AuditAction =
  | "add"
  | "update"
  | "delete"
  | "bulk_delete"
  | "import"
  | "adjust";

export interface LogAuditParams {
  client_id: string;
  branch_id?: string | null;
  user_id: string;

  module: string;
  action: AuditAction;

  entity_id?: string | null;

  before?: any | null;
  after?: any | null;

  metadata?: Record<string, any> | null;
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  const {
    client_id,
    branch_id,
    user_id,
    module,
    action,
    entity_id = null,
    before = null,
    after = null,
    metadata = null,
  } = params;

  try {
    const { error } = await supabase.from("audit_logs").insert([
      {
        client_id,
        branch_id: branch_id ?? null,
        user_id,
        module,
        action,
        entity_id,
        before,
        after,
        metadata,
      },
    ]);

    if (error) {
      console.error("[AUDIT LOG ERROR]", error.message);
    }
  } catch (err) {
    console.error("[AUDIT LOG EXCEPTION]", err);
  }
}