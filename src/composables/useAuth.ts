import { ref, computed } from "vue";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { useCurrentUser } from "vuefire";
import { router } from "../router";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const auth = getAuth();
  const user = useCurrentUser();

  const authState = ref<AuthState>({
    loading: false,
    error: null,
  });

  // Computed properties
  const isAuthenticated = computed(() => !!user.value);
  const isLoading = computed(() => authState.value.loading);
  const error = computed(() => authState.value.error);

  // Clear error
  const clearError = () => {
    authState.value.error = null;
  };

  // Login function
  const login = async ({ email, password }: LoginCredentials) => {
    try {
      authState.value.loading = true;
      authState.value.error = null;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user) {
        // Redirect ke dashboard setelah login berhasil
        await router.push("/dashboard");
        return { success: true, user: userCredential.user };
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle different error codes
      switch (error.code) {
        case "auth/user-not-found":
          authState.value.error = "Email tidak ditemukan";
          break;
        case "auth/wrong-password":
          authState.value.error = "Password salah";
          break;
        case "auth/invalid-email":
          authState.value.error = "Format email tidak valid";
          break;
        case "auth/user-disabled":
          authState.value.error = "Akun telah dinonaktifkan";
          break;
        case "auth/too-many-requests":
          authState.value.error =
            "Terlalu banyak percobaan login. Coba lagi nanti";
          break;
        case "auth/network-request-failed":
          authState.value.error = "Koneksi internet bermasalah";
          break;
        default:
          authState.value.error = "Terjadi kesalahan saat login";
      }

      return { success: false, error: authState.value.error };
    } finally {
      authState.value.loading = false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      authState.value.loading = true;
      authState.value.error = null;

      await firebaseSignOut(auth);
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

  // Get user display info
  const getUserDisplayInfo = () => {
    if (!user.value) return null;

    return {
      uid: user.value.uid,
      email: user.value.email,
      displayName:
        user.value.displayName || user.value.email?.split("@")[0] || "User",
      photoURL: user.value.photoURL,
      emailVerified: user.value.emailVerified,
    };
  };

  // Check if user has specific role (untuk future enhancement)
  const hasRole = (_role: string) => {
    // Implementasi role checking bisa ditambahkan nanti
    // Misalnya dengan menyimpan role di Firestore
    return true; // sementara return true untuk admin
  };

  // Initialize auth state listener
  const initializeAuth = () => {
    return new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        resolve(user);
        unsubscribe();
      });
    });
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    logout,
    clearError,
    getUserDisplayInfo,
    hasRole,
    initializeAuth,

    // Utils
    auth,
  };
};
