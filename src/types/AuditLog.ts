import type { FieldValue, Timestamp } from "firebase/firestore";

export interface AuditLog {
  id?: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  timestamp: FieldValue | Timestamp;
  ip?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
}
