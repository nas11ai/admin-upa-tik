<template>
  <div id="app">
    <!-- Loading Screen -->
    <LoadingComponent
      v-if="isInitializing"
      variant="page"
      title="Loading Dashboard"
      message="Memuat sistem inventaris UPA TIK..."
      :show-progress="true"
      :progress="loadingProgress"
    />

    <!-- Main App Content -->
    <div v-else>
      <!-- Layout berdasarkan route -->
      <NavbarLayout v-if="shouldShowLayout">
        <router-view />
      </NavbarLayout>

      <!-- Halaman tanpa layout (login, dll) -->
      <router-view v-else />
    </div>

    <!-- Notification Container -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import NavbarLayout from "@/components/layouts/NavbarLayout.vue";
import LoadingComponent from "@/components/ui/LoadingComponent.vue";
import { useAuth } from "@/composables/useAuth";
import { useNotification } from "@/composables/useNotification";
import NotificationContainer from "@/components/ui/NotificationContainer.vue";

// Composables
const route = useRoute();
const router = useRouter();
const { isAuthenticated, isAdmin, initializeAuth } = useAuth();
const { networkError } = useNotification();

// State
const isInitializing = ref(true);
const loadingProgress = ref(0);

// Computed
const shouldShowLayout = computed(() => {
  // Tampilkan layout hanya untuk admin yang sudah login
  const noLayoutRoutes = ["/login", "/unauthorized"];
  return (
    !noLayoutRoutes.includes(route.path) &&
    isAuthenticated.value &&
    isAdmin.value
  );
});

// Methods
const initializeApp = async () => {
  try {
    // Simulate progressive loading for better UX
    loadingProgress.value = 10;

    // Initialize Firebase Auth
    loadingProgress.value = 30;
    await initializeAuth();

    loadingProgress.value = 60;

    // Setup router guards
    setupRouterGuards();

    loadingProgress.value = 80;

    // Setup global error handlers
    setupErrorHandlers();

    loadingProgress.value = 95;

    // Small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 500));

    loadingProgress.value = 100;
  } catch (error) {
    console.error("App initialization error:", error);
    networkError();
  } finally {
    // Delay to show 100% progress
    setTimeout(() => {
      isInitializing.value = false;
    }, 200);
  }
};

const setupRouterGuards = () => {
  router.beforeEach(async (to, _from, next) => {
    // Routes yang tidak memerlukan authentication
    const publicRoutes = ["/login", "/unauthorized"];

    if (publicRoutes.includes(to.path)) {
      // Jika sudah login dan admin, redirect ke dashboard
      if (isAuthenticated.value && isAdmin.value) {
        next("/");
      } else {
        next();
      }
    } else {
      // Routes yang memerlukan authentication dan role admin
      if (!isAuthenticated.value) {
        // Belum login, redirect ke login
        next("/login");
      } else if (!isAdmin.value) {
        // Login tapi bukan admin, redirect ke unauthorized
        next("/unauthorized");
      } else {
        // Admin yang valid
        next();
      }
    }
  });

  // Handle route errors
  router.onError((error) => {
    console.error("Router error:", error);
    networkError();
  });
};

const setupErrorHandlers = () => {
  // Global error handler untuk unhandled promises
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);

    // Check if it's a network error
    if (
      event.reason?.code === "auth/network-request-failed" ||
      event.reason?.message?.includes("network") ||
      event.reason?.message?.includes("fetch")
    ) {
      networkError();
    }
  });

  // Global error handler untuk JavaScript errors
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
  });
};

// Watch for auth state changes
watch(
  [isAuthenticated, isAdmin],
  ([newAuth, newAdmin], [oldAuth, oldAdmin]) => {
    if (oldAuth === true && newAuth === false) {
      // User logged out
      router.push("/login");
    } else if (newAuth === true && oldAuth === false) {
      // User just logged in, check admin status
      if (!newAdmin) {
        router.push("/unauthorized");
      }
    } else if (newAuth === true && oldAdmin === true && newAdmin === false) {
      // User role changed from admin to non-admin
      router.push("/unauthorized");
    }
  }
);

// Lifecycle
onMounted(() => {
  initializeApp();
});
</script>

<style>
/* Global styles */
#app {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Focus styles */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}

/* Route transition */
.router-transition-enter-active,
.router-transition-leave-active {
  transition: opacity 0.2s ease;
}

.router-transition-enter-from,
.router-transition-leave-to {
  opacity: 0;
}
</style>
