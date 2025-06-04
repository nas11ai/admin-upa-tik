<template>
  <div id="app">
    <!-- Loading Screen -->
    <div
      v-if="isInitializing"
      class="fixed inset-0 bg-white flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 relative">
          <div class="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
          <div
            class="w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"
          ></div>
        </div>
        <div class="text-lg font-semibold text-neutral-700 mb-2">
          Loading Dashboard
        </div>
        <div class="text-sm text-neutral-500">Memuat sistem inventaris...</div>
      </div>
    </div>

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
import { useAuth } from "./composables/useAuth";

// Composables
const route = useRoute();
const router = useRouter();
const { isAuthenticated, initializeAuth } = useAuth();

// State
const isInitializing = ref(true);

// Computed
const shouldShowLayout = computed(() => {
  // Tampilkan layout untuk semua halaman kecuali login
  const noLayoutRoutes = ["/login"];
  return !noLayoutRoutes.includes(route.path) && isAuthenticated.value;
});

// Methods
const initializeApp = async () => {
  try {
    // Initialize Firebase Auth
    await initializeAuth();

    // Setup router guards
    setupRouterGuards();

    // Simulate loading time untuk UX yang lebih baik
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error("App initialization error:", error);
  } finally {
    isInitializing.value = false;
  }
};

const setupRouterGuards = () => {
  router.beforeEach(async (to, _from, next) => {
    // Routes yang tidak memerlukan authentication
    const publicRoutes = ["/login"];

    if (publicRoutes.includes(to.path)) {
      // Jika sudah login dan mencoba akses halaman public, redirect ke dashboard
      if (isAuthenticated.value) {
        next("/");
      } else {
        next();
      }
    } else {
      // Routes yang memerlukan authentication
      if (isAuthenticated.value) {
        next();
      } else {
        // Redirect ke login jika belum login
        next("/login");
      }
    }
  });
};

// Watch for auth state changes
watch(isAuthenticated, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    // User logged out
    router.push("/login");
  }
});

// Lifecycle
onMounted(() => {
  initializeApp();
});
</script>

<style>
/* Global styles bisa ditambahkan di sini */
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
</style>
