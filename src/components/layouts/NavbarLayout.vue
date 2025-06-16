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
          </router-link>
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-neutral-700">
          <div
            class="flex items-center space-x-3 rounded-lg bg-sidebar-hover p-3"
          >
            <div class="relative">
              <img
                v-if="userPhotoURL"
                :src="userPhotoURL"
                :alt="userDisplayName"
                class="h-8 w-8 rounded-full object-cover"
              />
              <div
                v-else
                class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center"
              >
                <User class="h-4 w-4 text-white" />
              </div>
              <!-- Role indicator -->
              <div
                class="absolute -bottom-1 -right-1 w-3 h-3 bg-success-500 border border-sidebar-hover rounded-full"
              ></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-sidebar-text truncate">
                {{ userDisplayName }}
              </p>
              <div class="flex items-center space-x-2">
                <p class="text-xs text-neutral-400 truncate">
                  {{ userEmail }}
                </p>
                <span
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800"
                >
                  {{ userRole.charAt(0).toUpperCase() + userRole.slice(1) }}
                </span>
              </div>
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
            <!-- Notification Bell -->
            <div class="relative" ref="notificationRef">
              <button
                @click="toggleNotifications"
                class="relative p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors"
              >
                <Bell class="h-5 w-5" />
                <!-- Notification Badge -->
                <span
                  v-if="unreadCount > 0"
                  class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white"
                >
                  {{ unreadCount > 9 ? "9+" : unreadCount }}
                </span>
                <!-- Notification Dot -->
                <span
                  v-else-if="unreadCount > 0"
                  class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"
                ></span>
              </button>

              <!-- Notification Dropdown -->
              <div
                v-if="isNotificationsOpen"
                class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-dashboard-border z-50"
              >
                <!-- Header -->
                <div
                  class="flex items-center justify-between px-4 py-3 border-b border-dashboard-border"
                >
                  <div class="flex items-center space-x-2">
                    <Bell class="h-5 w-5 text-neutral-600" />
                    <h3 class="text-sm font-semibold text-dashboard-text">
                      Notifikasi
                    </h3>
                    <span
                      v-if="unreadCount > 0"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {{ unreadCount }} baru
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="unreadCount > 0"
                      @click="markAllAsRead"
                      class="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Tandai semua dibaca
                    </button>
                    <button
                      @click="toggleNotifications"
                      class="p-1 rounded-md hover:bg-neutral-100 text-neutral-400"
                    >
                      <X class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <!-- Notification List -->
                <div class="max-h-96 overflow-y-auto">
                  <div
                    v-if="notifications.length === 0"
                    class="p-6 text-center"
                  >
                    <Bell class="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                    <p class="text-sm text-neutral-500">Tidak ada notifikasi</p>
                  </div>

                  <div v-else class="divide-y divide-neutral-100">
                    <div
                      v-for="notification in notifications.slice(0, 10)"
                      :key="notification.id"
                      class="p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                      :class="{ 'bg-blue-50': !notification.read }"
                      @click="handleNotificationClick(notification)"
                    >
                      <div class="flex items-start space-x-3">
                        <!-- Icon -->
                        <div class="flex-shrink-0 mt-1">
                          <div
                            class="h-8 w-8 rounded-full flex items-center justify-center"
                            :class="getNotificationIconColor(notification.type)"
                          >
                            <component
                              :is="getNotificationIcon(notification.type)"
                              class="h-4 w-4"
                            />
                          </div>
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center justify-between">
                            <p
                              class="text-sm font-medium text-dashboard-text truncate"
                            >
                              {{ notification.title }}
                            </p>
                            <div class="flex items-center space-x-2">
                              <span class="text-xs text-neutral-500">
                                {{
                                  formatNotificationTime(notification.timestamp)
                                }}
                              </span>
                              <div
                                v-if="!notification.read"
                                class="h-2 w-2 rounded-full bg-blue-500"
                              ></div>
                            </div>
                          </div>
                          <p class="text-sm text-neutral-600 mt-1 line-clamp-2">
                            {{ notification.body }}
                          </p>
                          <div class="flex items-center mt-2 space-x-2">
                            <span
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              :class="
                                getCollectionBadgeColor(
                                  notification.collectionName
                                )
                              "
                            >
                              {{
                                getCollectionDisplayName(
                                  notification.collectionName
                                )
                              }}
                            </span>
                            <span
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              :class="
                                getNotificationTypeColor(notification.type)
                              "
                            >
                              {{ getNotificationTypeLabel(notification.type) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div
                  class="px-4 py-3 border-t border-dashboard-border bg-neutral-50"
                >
                  <button
                    v-if="notifications.length > 10"
                    class="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                    @click="viewAllNotifications"
                  >
                    Lihat semua notifikasi ({{ notifications.length }})
                  </button>
                  <button
                    v-if="notifications.length > 0"
                    @click="clearAllNotifications"
                    class="w-full text-center text-sm text-red-600 hover:text-red-700 font-medium mt-2"
                  >
                    Hapus semua notifikasi
                  </button>
                </div>
              </div>
            </div>

            <!-- User Menu -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="toggleUserMenu"
                class="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
              >
                <img
                  v-if="userPhotoURL"
                  :src="userPhotoURL"
                  :alt="userDisplayName"
                  class="h-8 w-8 rounded-full object-cover"
                />
                <div
                  v-else
                  class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center"
                >
                  <User class="h-4 w-4 text-white" />
                </div>
                <ChevronDown class="h-4 w-4" />
              </button>

              <!-- User Dropdown -->
              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-dashboard-border py-1 z-50"
              >
                <div class="px-4 py-3 border-b border-dashboard-border">
                  <div class="flex items-center space-x-3">
                    <img
                      v-if="userPhotoURL"
                      :src="userPhotoURL"
                      :alt="userDisplayName"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                    <div
                      v-else
                      class="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center"
                    >
                      <User class="h-5 w-5 text-white" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-medium text-dashboard-text truncate"
                      >
                        {{ userDisplayName }}
                      </p>
                      <p class="text-xs text-dashboard-text-light truncate">
                        {{ userEmail }}
                      </p>
                      <div class="flex items-center mt-1 space-x-2">
                        <span
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800"
                        >
                          {{
                            userRole.charAt(0).toUpperCase() + userRole.slice(1)
                          }}
                        </span>
                        <span
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

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

    <!-- Toast Notifications -->
    <div
      v-if="showToast"
      class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-dashboard-border p-4 transform transition-all duration-300 ease-in-out"
      :class="{ 'translate-x-0': showToast, 'translate-x-full': !showToast }"
    >
      <div class="flex items-start space-x-3">
        <div
          class="flex-shrink-0 mt-0.5"
          :class="getToastIconColor(toastData.type)"
        >
          <component :is="getToastIcon(toastData.type)" class="h-5 w-5" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-dashboard-text">
            {{ toastData.title }}
          </p>
          <p class="text-sm text-neutral-600 mt-1">
            {{ toastData.message }}
          </p>
        </div>
        <button
          @click="hideToast"
          class="flex-shrink-0 text-neutral-400 hover:text-neutral-600"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Package,
  X,
  Menu,
  User,
  ChevronDown,
  LogOut,
  Home,
  Package2,
  MessageSquare,
  Wrench,
  Plus,
  Zap,
  AlertTriangle,
  HelpCircle,
  Bell,
  CheckCircle,
  Info,
  AlertCircle,
} from "lucide-vue-next";
import { useAuth } from "../../composables/useAuth";
import { useNotifications } from "../../composables/useNotification";

// Navigation items
const navigationItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Daftar Barang", path: "/daftar-barang", icon: Package },
  { name: "Peminjaman", path: "/peminjaman", icon: Package2 },
  { name: "Pengaduan", path: "/pengaduan", icon: MessageSquare },
  { name: "Pemeliharaan", path: "/pemeliharaan", icon: Wrench },
  { name: "Pembuatan", path: "/pembuatan", icon: Plus },
  { name: "Pemasangan", path: "/pemasangan", icon: Zap },
  { name: "Lapor Kerusakan", path: "/lapor-kerusakan", icon: AlertTriangle },
  { name: "Bantuan", path: "/bantuan", icon: HelpCircle },
];

// State
const isSidebarOpen = ref(false);
const isUserMenuOpen = ref(false);
const isNotificationsOpen = ref(false);
const userMenuRef = ref<HTMLElement>();
const notificationRef = ref<HTMLElement>();

// Toast state
const showToast = ref(false);
const toastData = ref({
  title: "",
  message: "",
  type: "info" as "info" | "success" | "warning" | "error",
});

// Composables
const route = useRoute();
const router = useRouter();
const { logout, userDisplayInfo } = useAuth();
const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  formatNotificationTime,
} = useNotifications();

// Computed
const pageTitle = computed(() => {
  const currentItem = navigationItems.find((item) => item.path === route.path);
  return currentItem?.name || "Dashboard";
});

const userDisplayName = computed(
  () => userDisplayInfo.value?.displayName || "Admin"
);
const userEmail = computed(
  () => userDisplayInfo.value?.email || "admin@example.com"
);
const userPhotoURL = computed(() => userDisplayInfo.value?.photoURL);
const userRole = computed(() => userDisplayInfo.value?.role || "admin");

// Methods
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
  if (isUserMenuOpen.value) {
    isNotificationsOpen.value = false;
  }
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
  if (isNotificationsOpen.value) {
    isUserMenuOpen.value = false;
  }
};

const closeNotifications = () => {
  isNotificationsOpen.value = false;
};

const handleLogout = async () => {
  closeUserMenu();
  const result = await logout();
  if (!result.success) {
    console.error("Logout failed:", result.error);
  }
};

// Notification methods
const handleNotificationClick = async (notification: any) => {
  if (!notification.read) {
    await markAsRead(notification.id);
  }

  // Navigate to related page if possible
  const pathMap: Record<string, string> = {
    form_peminjaman: "/peminjaman",
    form_pengaduan: "/pengaduan",
    form_pemeliharaan: "/pemeliharaan",
    form_pembuatan: "/pembuatan",
    form_pemasangan: "/pemasangan",
    form_lapor_kerusakan: "/lapor-kerusakan",
    form_bantuan: "/bantuan",
  };

  const targetPath = pathMap[notification.collectionName];
  if (targetPath && targetPath !== route.path) {
    router.push(targetPath);
  }

  closeNotifications();
};

const viewAllNotifications = () => {
  // Navigate to notifications page if you have one
  console.log("View all notifications");
  closeNotifications();
};

// Helper methods for notifications
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "status_update":
      return CheckCircle;
    case "new_entry":
      return Plus;
    default:
      return Info;
  }
};

const getNotificationIconColor = (type: string) => {
  switch (type) {
    case "status_update":
      return "bg-blue-100 text-blue-600";
    case "new_entry":
      return "bg-green-100 text-green-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getNotificationTypeColor = (type: string) => {
  switch (type) {
    case "status_update":
      return "bg-blue-100 text-blue-800";
    case "new_entry":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getNotificationTypeLabel = (type: string) => {
  switch (type) {
    case "status_update":
      return "Update Status";
    case "new_entry":
      return "Entry Baru";
    default:
      return "Notifikasi";
  }
};

const getCollectionDisplayName = (collectionName: string) => {
  const displayNames: Record<string, string> = {
    form_peminjaman: "Peminjaman",
    form_pengaduan: "Pengaduan",
    form_pemeliharaan: "Pemeliharaan",
    form_pembuatan: "Pembuatan",
    form_pemasangan: "Pemasangan",
    form_lapor_kerusakan: "Lapor Kerusakan",
    form_bantuan: "Bantuan",
  };
  return displayNames[collectionName] || collectionName;
};

const getCollectionBadgeColor = (collectionName: string) => {
  const colors: Record<string, string> = {
    form_peminjaman: "bg-purple-100 text-purple-800",
    form_pengaduan: "bg-orange-100 text-orange-800",
    form_pemeliharaan: "bg-blue-100 text-blue-800",
    form_pembuatan: "bg-green-100 text-green-800",
    form_pemasangan: "bg-yellow-100 text-yellow-800",
    form_lapor_kerusakan: "bg-red-100 text-red-800",
    form_bantuan: "bg-indigo-100 text-indigo-800",
  };
  return colors[collectionName] || "bg-gray-100 text-gray-800";
};

// Toast methods
const showToastNotification = (
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info"
) => {
  toastData.value = { title, message, type };
  showToast.value = true;

  setTimeout(() => {
    hideToast();
  }, 5000);
};

const hideToast = () => {
  showToast.value = false;
};

const getToastIcon = (type: string) => {
  switch (type) {
    case "success":
      return CheckCircle;
    case "warning":
      return AlertTriangle;
    case "error":
      return AlertCircle;
    default:
      return Info;
  }
};

const getToastIconColor = (type: string) => {
  switch (type) {
    case "success":
      return "text-green-600";
    case "warning":
      return "text-yellow-600";
    case "error":
      return "text-red-600";
    default:
      return "text-blue-600";
  }
};

// Close dropdowns when clicking outside
const handleClickOutside = (event: Event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    closeUserMenu();
  }
  if (
    notificationRef.value &&
    !notificationRef.value.contains(event.target as Node)
  ) {
    closeNotifications();
  }
};

// Listen for toast events
const handleToastEvent = (event: CustomEvent) => {
  const { title, message, type } = event.detail;
  showToastNotification(title, message, type);
};

// Lifecycle
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("show-toast", handleToastEvent as EventListener);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("show-toast", handleToastEvent as EventListener);
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
