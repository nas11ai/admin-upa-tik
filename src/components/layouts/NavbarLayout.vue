<template>
  <div class="min-h-screen bg-dashboard-bg">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0"
      :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full']"
    >
      <div class="flex h-full flex-col bg-sidebar-bg shadow-sidebar">
        <!-- Logo Section -->
        <div
          class="flex h-16 items-center justify-between px-6 border-b border-neutral-700"
        >
          <div class="flex items-center space-x-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500"
            >
              <Package class="h-5 w-5 text-white" />
            </div>
            <div class="text-sidebar-text">
              <h1 class="text-lg font-semibold">Admin UPA TIK</h1>
              <p class="text-xs text-neutral-400">Inventaris Elektronik</p>
            </div>
          </div>

          <!-- Close button untuk mobile -->
          <button
            @click="toggleSidebar"
            class="lg:hidden p-1 rounded-md hover:bg-sidebar-hover text-sidebar-text"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.path"
            class="flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors group"
            :class="[
              $route.path === item.path
                ? 'bg-primary-500 text-white'
                : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white',
            ]"
          >
            <component :is="item.icon" class="mr-3 h-5 w-5 flex-shrink-0" />
            {{ item.name }}
            <span
              v-if="item.badge"
              class="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
            >
              {{ item.badge }}
            </span>
          </router-link>
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-neutral-700">
          <div
            class="flex items-center space-x-3 rounded-lg bg-sidebar-hover p-3"
          >
            <div
              class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center"
            >
              <User class="h-4 w-4 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-sidebar-text truncate">
                {{ userDisplayName }}
              </p>
              <p class="text-xs text-neutral-400 truncate">
                {{ userEmail }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="lg:pl-64">
      <!-- Top Header -->
      <header
        class="sticky top-0 z-40 bg-white border-b border-dashboard-border"
      >
        <div
          class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <!-- Mobile menu button -->
          <button
            @click="toggleSidebar"
            class="lg:hidden -ml-2 p-2 rounded-md hover:bg-neutral-100 text-neutral-600"
          >
            <Menu class="h-6 w-6" />
          </button>

          <!-- Page Title -->
          <div class="flex-1 lg:flex-none">
            <h1 class="text-xl font-semibold text-dashboard-text">
              {{ pageTitle }}
            </h1>
          </div>

          <!-- Header Actions -->
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button
              class="relative p-2 rounded-full hover:bg-neutral-100 text-neutral-600"
            >
              <Bell class="h-5 w-5" />
              <span
                class="absolute -top-1 -right-1 h-4 w-4 bg-error-500 rounded-full flex items-center justify-center"
              >
                <span class="text-xs font-bold text-white">3</span>
              </span>
            </button>

            <!-- User Menu -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="toggleUserMenu"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
              >
                <div
                  class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center"
                >
                  <User class="h-4 w-4 text-white" />
                </div>
                <ChevronDown class="h-4 w-4" />
              </button>

              <!-- User Dropdown -->
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-dashboard-border py-1 z-50"
              >
                <div class="px-4 py-2 border-b border-dashboard-border">
                  <p class="text-sm font-medium text-dashboard-text">
                    {{ userDisplayName }}
                  </p>
                  <p class="text-xs text-dashboard-text-light">
                    {{ userEmail }}
                  </p>
                </div>

                <router-link
                  to="/profile"
                  class="flex items-center px-4 py-2 text-sm text-dashboard-text hover:bg-neutral-50"
                  @click="closeUserMenu"
                >
                  <Settings class="mr-3 h-4 w-4" />
                  Pengaturan
                </router-link>

                <button
                  @click="handleLogout"
                  class="flex w-full items-center px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                >
                  <LogOut class="mr-3 h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 bg-dashboard-bg">
        <router-view />
      </main>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      @click="closeSidebar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import {
  Package,
  X,
  Menu,
  User,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  Home,
  Package2,
  Users,
  FileText,
  BarChart3,
  Wrench,
} from "lucide-vue-next";
import { useAuth } from "../../composables/useAuth";

// Navigation items
const navigationItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Inventaris", path: "/inventory", icon: Package2, badge: "24" },
  { name: "Penggunaan", path: "/usage", icon: Users },
  { name: "Laporan", path: "/reports", icon: FileText },
  { name: "Statistik", path: "/analytics", icon: BarChart3 },
  { name: "Maintenance", path: "/maintenance", icon: Wrench },
];

// State
const isSidebarOpen = ref(false);
const isUserMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement>();

// Composables
const route = useRoute();
const { logout, getUserDisplayInfo } = useAuth();

// Computed
const pageTitle = computed(() => {
  const currentItem = navigationItems.find((item) => item.path === route.path);
  return currentItem?.name || "Dashboard";
});

const userInfo = computed(() => getUserDisplayInfo());
const userDisplayName = computed(() => userInfo.value?.displayName || "Admin");
const userEmail = computed(() => userInfo.value?.email || "admin@example.com");

// Methods
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const handleLogout = async () => {
  closeUserMenu();
  const result = await logout();
  if (!result.success) {
    console.error("Logout failed:", result.error);
  }
};

// Close user menu when clicking outside
const handleClickOutside = (event: Event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    closeUserMenu();
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
