import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  increment,
} from "firebase/firestore";
import {
  type User,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { db, firebaseApp } from "../configs/firebase";
import { getAuth } from "firebase/auth";
import type { UserRole } from "@/types/UserRole";
import type { AuditLog } from "@/types/AuditLog";

class FirebaseAuthService {
  private auth = getAuth(firebaseApp);
  private googleProvider = new GoogleAuthProvider();

  constructor() {
    // Configure Google provider
    this.googleProvider.addScope("email");
    this.googleProvider.addScope("profile");
    this.googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  }

  // Authentication Methods
  async signInWithGoogle(): Promise<{ user: User; isNewUser: boolean }> {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;

      // Check if user document exists
      const userDoc = await this.getUserById(user.uid);
      const isNewUser = !userDoc;

      // Create or update user document
      await this.createOrUpdateUser(user, isNewUser);

      // Log the login
      await this.logActivity(
        user.uid,
        user.email!,
        "login",
        "auth",
        undefined,
        {
          method: "google",
          isNewUser,
        }
      );

      return { user, isNewUser };
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (user) {
        await this.logActivity(user.uid, user.email!, "logout", "auth");
      }
      await signOut(this.auth);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  // User Management Methods
  async getUserById(uid: string): Promise<UserRole | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() } as UserRole;
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  async createOrUpdateUser(user: User, isNewUser: boolean): Promise<UserRole> {
    try {
      const userRef = doc(db, "users", user.uid);
      const now = serverTimestamp();

      if (isNewUser) {
        // Create new user
        const userData: Omit<UserRole, "uid"> = {
          email: user.email!,
          displayName: user.displayName || user.email!.split("@")[0],
          photoURL: user.photoURL ?? "",
          role: "user", // Default role
          createdAt: now,
          lastLogin: now,
          metadata: {
            loginCount: 1,
          },
        };

        await setDoc(userRef, userData);
        return { uid: user.uid, ...userData } as UserRole;
      } else {
        // Update existing user
        await updateDoc(userRef, {
          lastLogin: now,
          photoURL: user.photoURL,
          displayName: user.displayName || user.email!.split("@")[0],
          "metadata.loginCount": increment(1),
        });

        const updatedUser = await this.getUserById(user.uid);
        return updatedUser!;
      }
    } catch (error) {
      console.error("Error creating/updating user:", error);
      throw error;
    }
  }

  // Audit Log Methods
  async logActivity(
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>,
    success: boolean = true,
    error?: string
  ): Promise<void> {
    try {
      const logData: Omit<AuditLog, "id"> = {
        userId,
        userEmail,
        action,
        resource,
        resourceId,
        details,
        timestamp: serverTimestamp(),
        success,
        error,
      };

      await addDoc(collection(db, "audit_logs"), logData);
    } catch (error) {
      console.error("Error logging activity:", error);
      // Don't throw here to avoid breaking the main flow
    }
  }

  async getAuditLogs(
    userId?: string,
    limit_count: number = 50
  ): Promise<AuditLog[]> {
    try {
      let q = query(
        collection(db, "audit_logs"),
        orderBy("timestamp", "desc"),
        limit(limit_count)
      );

      if (userId) {
        q = query(
          collection(db, "audit_logs"),
          where("userId", "==", userId),
          orderBy("timestamp", "desc"),
          limit(limit_count)
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuditLog[];
    } catch (error) {
      console.error("Error getting audit logs:", error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToUserChanges(
    userId: string,
    callback: (user: UserRole | null) => void
  ): () => void {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback({ uid: doc.id, ...doc.data() } as UserRole);
      } else {
        callback(null);
      }
    });
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
