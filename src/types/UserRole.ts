import type { FieldValue, Timestamp } from "firebase/firestore";

export interface UserRole {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "admin" | "user" | "viewer";
  department?: string;
  createdAt: FieldValue | Timestamp;
  lastLogin: FieldValue | Timestamp;
  permissions?: string[];
  metadata?: {
    loginCount: number;
    lastIP?: string;
    lastUserAgent?: string;
  };
}