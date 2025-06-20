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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import NavbarLayout from "./components/layouts/NavbarLayout.vue";
import LoadingComponent from "./components/ui/LoadingComponent.vue";
import { useAuth } from "./composables/useAuth";

// Composables
const route = useRoute();
const router = useRouter();
const { isAuthenticated, isAdmin, initializeAuth } = useAuth();

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

    // Initialize Firebase Auth FIRST and wait for it to complete
    loadingProgress.value = 30;
    await initializeAuth();

    loadingProgress.value = 60;

    // THEN setup router guards after auth is ready
    setupRouterGuards();

    loadingProgress.value = 80;

    // Setup global error handlers
    setupErrorHandlers();

    loadingProgress.value = 95;

    // Small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 300));

    loadingProgress.value = 100;
  } catch (error) {
    console.error("App initialization error:", error);
  } finally {
    // Delay to show 100% progress
    setTimeout(() => {
      isInitializing.value = false;
    }, 200);
  }
};

const setupRouterGuards = () => {
  let isSetupComplete = false;

  router.beforeEach(async (to, _from, next) => {
    // Wait for auth initialization to complete
    if (!isSetupComplete) {
      try {
        await initializeAuth();
        isSetupComplete = true;
      } catch (error) {
        console.error("Auth initialization failed:", error);
      }
    }

    // Routes yang tidak memerlukan authentication
    const publicRoutes = ["/login", "/unauthorized"];

    // Prevent infinite loops by checking if we're already on the target route
    if (publicRoutes.includes(to.path)) {
      // Jika sudah login dan admin, redirect ke dashboard (kecuali sudah di dashboard)
      if (isAuthenticated.value && isAdmin.value && to.path !== "/") {
        return next("/");
      } else {
        return next();
      }
    } else {
      // Routes yang memerlukan authentication dan role admin
      if (!isAuthenticated.value) {
        // Belum login, redirect ke login (kecuali sudah di login)
        if (to.path !== "/login") {
          return next("/login");
        }
        return next();
      } else if (!isAdmin.value) {
        // Login tapi bukan admin, redirect ke unauthorized (kecuali sudah di unauthorized)
        if (to.path !== "/unauthorized") {
          return next("/unauthorized");
        }
        return next();
      } else {
        // Admin yang valid
        return next();
      }
    }
  });

  // Handle route errors
  router.onError((error) => {
    console.error("Router error:", error);
    // Don't show networkError for router issues to avoid confusion
  });
};

const setupErrorHandlers = () => {
  // Global error handler untuk unhandled promises
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
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
    // Only react to meaningful changes, not initial setup
    if (oldAuth === undefined || oldAdmin === undefined) return;

    const currentRoute = router.currentRoute.value.path;

    if (oldAuth === true && newAuth === false) {
      // User logged out - redirect to login if not already there
      if (currentRoute !== "/login") {
        router.push("/login");
      }
    } else if (newAuth === true && oldAuth === false && newAdmin === true) {
      // User just logged in and is admin - redirect to dashboard if on public page
      if (["/login", "/unauthorized"].includes(currentRoute)) {
        router.push("/");
      }
    } else if (newAuth === true && oldAdmin === true && newAdmin === false) {
      // User role changed from admin to non-admin - redirect to unauthorized if not already there
      if (currentRoute !== "/unauthorized" && currentRoute !== "/login") {
        router.push("/unauthorized");
      }
    }
  },
  {
    // Don't run immediately to avoid conflicts with router guards
    immediate: false,
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
