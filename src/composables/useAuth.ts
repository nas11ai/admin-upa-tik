import { ref, computed, watch } from "vue";
import {
  getAuth,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { useCurrentUser } from "vuefire";
import { router } from "../router";
import { useNotification } from "@/composables/useNotification";
import firebaseService from "@/services/firebaseAuth";
import type { UserRole } from "@/types/UserRole";

export interface AuthState {
  loading: boolean;
  error: string | null;
  checkingRole: boolean;
}

export const useAuth = () => {
  const auth = getAuth();
  const user = useCurrentUser();
  const { authSuccess, authError, roleError, updateSuccess } =
    useNotification();

  const authState = ref<AuthState>({
    loading: false,
    error: null,
    checkingRole: false,
  });

  const userRole = ref<UserRole | null>(null);
  const unsubscribeUserChanges = ref<(() => void) | null>(null);

  // Computed properties
  const isAuthenticated = computed(() => !!user.value);
  const isLoading = computed(
    () => authState.value.loading || authState.value.checkingRole
  );
  const error = computed(() => authState.value.error);
  const isAdmin = computed(() => userRole.value?.role === "admin");
  const userDisplayInfo = computed(() => {
    if (!user.value || !userRole.value) return null;

    return {
      uid: user.value.uid,
      email: user.value.email,
      displayName: user.value.displayName || userRole.value.displayName,
      photoURL: user.value.photoURL,
      role: userRole.value.role,
      department: userRole.value.department,
      permissions: userRole.value.permissions || [],
    };
  });

  // Clear error
  const clearError = () => {
    authState.value.error = null;
  };

  // Google Sign-in
  const loginWithGoogle = async () => {
    try {
      authState.value.loading = true;
      authState.value.error = null;
      clearError();

      const { user: firebaseUser, isNewUser } =
        await firebaseService.signInWithGoogle();

      if (firebaseUser) {
        console.log("firebaseUser:", firebaseUser);
        // Get user role from Firestore
        authState.value.checkingRole = true;
        const roleData = await firebaseService.getUserById(firebaseUser.uid);

        if (!roleData) {
          await firebaseSignOut(auth);
          throw new Error("Gagal mendapatkan data user");
        }

        userRole.value = roleData;

        // Check if user is admin and active
        if (roleData.role !== "admin") {
          await firebaseSignOut(auth);
          roleError(roleData.role);
          throw new Error(
            `Akses ditolak. Hanya admin yang dapat mengakses sistem ini. Role Anda: ${roleData.role}`
          );
        }

        // Setup real-time user data listener
        setupUserListener(firebaseUser.uid);

        // Success - show notification and redirect
        const welcomeMessage = isNewUser
          ? "Selamat datang! Akun Anda telah dibuat."
          : `Selamat datang kembali, ${roleData.displayName}!`;

        authSuccess(welcomeMessage);

        // Small delay for better UX
        setTimeout(() => {
          router.push("/");
        }, 500);

        return { success: true, user: firebaseUser, role: roleData };
      }
    } catch (error: any) {
      console.error("Google login error:", error);

      // Handle different error types
      if (error.code === "auth/popup-closed-by-user") {
        authState.value.error = "Login dibatalkan";
      } else if (error.code === "auth/popup-blocked") {
        authState.value.error =
          "Pop-up diblokir browser. Izinkan pop-up untuk login.";
      } else if (error.code === "auth/network-request-failed") {
        authState.value.error = "Koneksi internet bermasalah";
      } else if (error.message.includes("Akses ditolak")) {
        authState.value.error = error.message;
      } else if (error.message.includes("belum diaktivasi")) {
        authState.value.error = error.message;
      } else {
        authState.value.error = "Terjadi kesalahan saat login dengan Google";
        authError(authState.value.error);
      }

      return { success: false, error: authState.value.error };
    } finally {
      authState.value.loading = false;
      authState.value.checkingRole = false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      authState.value.loading = true;
      authState.value.error = null;

      // Cleanup user listener
      if (unsubscribeUserChanges.value) {
        unsubscribeUserChanges.value();
        unsubscribeUserChanges.value = null;
      }

      await firebaseService.signOut();
      userRole.value = null;

      // Redirect and show success message
      await router.push("/login");

      return { success: true };
    } catch (error: any) {
      console.error("Logout error:", error);
      authState.value.error = "Terjadi kesalahan saat logout";
      return { success: false, error: authState.value.error };
    } finally {
      authState.value.loading = false;
    }
  };

  // Setup real-time user data listener
  const setupUserListener = (userId: string) => {
    if (unsubscribeUserChanges.value) {
      unsubscribeUserChanges.value();
    }

    unsubscribeUserChanges.value = firebaseService.subscribeToUserChanges(
      userId,
      (updatedUser) => {
        if (updatedUser) {
          const oldRole = userRole.value?.role;

          console.log("oldRole:", oldRole);
          console.log("updatedUser:", updatedUser);
          console.log(
            "updatedUser.role !== oldRole:",
            updatedUser.role !== oldRole
          );

          userRole.value = updatedUser;

          // Check for role or status changes
          if (oldRole && oldRole !== updatedUser.role) {
            updateSuccess("Role Anda telah diperbarui");
            // If role changed from admin to non-admin, redirect
            if (oldRole === "admin" && updatedUser.role !== "admin") {
              router.push("/unauthorized");
            }
          }
        } else {
          // User document deleted or not found
          userRole.value = null;
          router.push("/login");
        }
      }
    );
  };

  // Check if user has specific role
  const hasRole = (requiredRole: "admin" | "user" | "viewer") => {
    if (!userRole.value) return false;

    const roleHierarchy = {
      admin: 3,
      user: 2,
      viewer: 1,
    };

    return roleHierarchy[userRole.value.role] >= roleHierarchy[requiredRole];
  };

  // Check if user has specific permission
  const hasPermission = (permission: string) => {
    if (!userRole.value) return false;
    if (userRole.value.role === "admin") return true; // Admin has all permissions

    return userRole.value.permissions?.includes(permission) || false;
  };

  // Initialize auth state listener
  const initializeAuth = () => {
    return new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // User is logged in, get their role
          authState.value.checkingRole = true;
          try {
            const roleData = await firebaseService.getUserById(user.uid);
            userRole.value = roleData;

            if (roleData) {
              // Setup real-time listener
              setupUserListener(user.uid);
            }
          } catch (error) {
            console.error("Error getting user role:", error);
          } finally {
            authState.value.checkingRole = false;
          }
        } else {
          // User is logged out
          userRole.value = null;
          if (unsubscribeUserChanges.value) {
            unsubscribeUserChanges.value();
            unsubscribeUserChanges.value = null;
          }
        }
        resolve(user);
        unsubscribe();
      });
    });
  };

  // Watch for auth state changes
  watch(user, async (newUser) => {
    if (newUser && !userRole.value) {
      // User logged in but no role data yet
      try {
        authState.value.checkingRole = true;
        const roleData = await firebaseService.getUserById(newUser.uid);
        userRole.value = roleData;

        if (roleData) {
          setupUserListener(newUser.uid);
        }
      } catch (error) {
        console.error("Error getting user role:", error);
      } finally {
        authState.value.checkingRole = false;
      }
    } else if (!newUser) {
      // User logged out
      userRole.value = null;
      if (unsubscribeUserChanges.value) {
        unsubscribeUserChanges.value();
        unsubscribeUserChanges.value = null;
      }
    }
  });

  // Get audit logs
  const getAuditLogs = async (userId?: string, limit?: number) => {
    try {
      return await firebaseService.getAuditLogs(userId, limit);
    } catch (error) {
      console.error("Error getting audit logs:", error);
      throw error;
    }
  };

  return {
    // State
    user,
    userRole,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    userDisplayInfo,

    // Actions
    loginWithGoogle,
    logout,
    clearError,
    hasRole,
    hasPermission,
    initializeAuth,
    getAuditLogs,

    // Utils
    auth,
  };
};
