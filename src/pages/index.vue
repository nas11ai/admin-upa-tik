<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div
      class="bg-linear-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 text-white"
    >
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold mb-2">
            Selamat datang, {{ userDisplayName }}! 👋
          </h1>
          <p class="text-primary-100 mb-4">
            Kelola inventaris barang elektronik UPA TIK dengan mudah dan efisien
          </p>
          <div class="flex items-center text-sm text-primary-100">
            <Calendar class="h-4 w-4 mr-2" />
            {{ currentDate }}
          </div>
        </div>
        <div class="hidden md:block">
          <div
            class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Package class="h-12 w-12 text-white" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in quickStats"
        :key="stat.title"
        class="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer group"
        @click="navigateTo(stat.link)"
      >
        <div class="flex items-center justify-between mb-4">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-lg"
            :class="stat.iconBg"
          >
            <component
              :is="stat.icon"
              class="h-6 w-6"
              :class="stat.iconColor"
            />
          </div>
          <div class="text-right">
            <div
              class="text-2xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors"
            >
              {{ stat.value }}
            </div>
            <div class="text-sm text-neutral-500">{{ stat.label }}</div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-neutral-700">
            {{ stat.title }}
          </h3>
          <div class="flex items-center text-sm" :class="stat.trend.color">
            <component :is="stat.trend.icon" class="h-4 w-4 mr-1" />
            {{ stat.trend.value }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Activities -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-neutral-900">
            Aktivitas Terkini
          </h2>
          <button
            class="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            Lihat Semua
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <div
              class="flex items-center justify-center w-8 h-8 rounded-full"
              :class="activity.iconBg"
            >
              <component
                :is="activity.icon"
                class="h-4 w-4"
                :class="activity.iconColor"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-neutral-900">
                <span class="font-medium">{{ activity.user }}</span>
                {{ activity.action }}
                <span class="font-medium text-primary-600">{{
                  activity.item
                }}</span>
              </p>
              <div class="flex items-center mt-1 text-xs text-neutral-500">
                <Clock class="h-3 w-3 mr-1" />
                {{ activity.time }}
              </div>
            </div>
            <div class="flex-shrink-0">
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="activity.statusColor"
              >
                {{ activity.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Notifications -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <h3 class="text-lg font-semibold text-neutral-900 mb-4">
            Aksi Cepat
          </h3>
          <div class="space-y-3">
            <button
              v-for="action in quickActions"
              :key="action.title"
              @click="navigateTo(action.link)"
              class="w-full flex items-center p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <component
                :is="action.icon"
                class="h-5 w-5 text-neutral-600 group-hover:text-primary-600 mr-3"
              />
              <span
                class="text-sm font-medium text-neutral-700 group-hover:text-primary-700"
              >
                {{ action.title }}
              </span>
              <ChevronRight
                class="h-4 w-4 text-neutral-400 group-hover:text-primary-600 ml-auto"
              />
            </button>
          </div>
        </div>

        <!-- Notifications -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-neutral-900">Notifikasi</h3>
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800"
            >
              {{ notifications.length }} Baru
            </span>
          </div>
          <div class="space-y-3">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="flex items-start space-x-3 p-3 rounded-lg"
              :class="notification.bgColor"
            >
              <component
                :is="notification.icon"
                class="h-4 w-4 mt-0.5"
                :class="notification.iconColor"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium" :class="notification.textColor">
                  {{ notification.title }}
                </p>
                <p class="text-xs mt-1" :class="notification.subtextColor">
                  {{ notification.message }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Inventory Status Chart -->
      <div class="bg-white rounded-xl shadow-card p-6">
        <h3 class="text-lg font-semibold text-neutral-900 mb-4">
          Status Inventaris
        </h3>
        <div class="space-y-4">
          <div
            v-for="status in inventoryStatus"
            :key="status.label"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 rounded-full" :class="status.color"></div>
              <span class="text-sm text-neutral-700">{{ status.label }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-neutral-900">{{
                status.count
              }}</span>
              <div class="w-20 bg-neutral-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="status.color"
                  :style="{ width: status.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Maintenance -->
      <div class="bg-white rounded-xl shadow-card p-6">
        <h3 class="text-lg font-semibold text-neutral-900 mb-4">
          Maintenance Mendatang
        </h3>
        <div class="space-y-4">
          <div
            v-for="maintenance in upcomingMaintenance"
            :key="maintenance.id"
            class="flex items-center justify-between p-3 rounded-lg border border-neutral-200"
          >
            <div class="flex items-center space-x-3">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full bg-warning-100"
              >
                <Wrench class="h-4 w-4 text-warning-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-neutral-900">
                  {{ maintenance.item }}
                </p>
                <p class="text-xs text-neutral-500">{{ maintenance.type }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-neutral-900">
                {{ maintenance.date }}
              </p>
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="maintenance.priorityColor"
              >
                {{ maintenance.priority }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  BarChart3,
  Clock,
  ChevronRight,
  Plus,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  Package2,
  Activity,
} from "lucide-vue-next";
import { useAuth } from "../composables/useAuth";

// Router
const router = useRouter();

// Composables
const { userDisplayInfo } = useAuth();

// Computed
const userDisplayName = computed(
  () => userDisplayInfo.value?.displayName || "Admin"
);

const currentDate = computed(() => {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
});

// Data
const quickStats = ref([
  {
    title: "Total Barang",
    value: "1,247",
    label: "items",
    icon: Package2,
    iconColor: "text-primary-600",
    iconBg: "bg-primary-100",
    trend: {
      value: "+12%",
      icon: TrendingUp,
      color: "text-success-600",
    },
    link: "/inventory",
  },
  {
    title: "Sedang Digunakan",
    value: "892",
    label: "items",
    icon: Users,
    iconColor: "text-success-600",
    iconBg: "bg-success-100",
    trend: {
      value: "+5%",
      icon: TrendingUp,
      color: "text-success-600",
    },
    link: "/usage",
  },
  {
    title: "Perlu Maintenance",
    value: "23",
    label: "items",
    icon: AlertTriangle,
    iconColor: "text-warning-600",
    iconBg: "bg-warning-100",
    trend: {
      value: "-8%",
      icon: TrendingDown,
      color: "text-success-600",
    },
    link: "/maintenance",
  },
  {
    title: "Nilai Aset",
    value: "2.4M",
    label: "IDR",
    icon: BarChart3,
    iconColor: "text-secondary-600",
    iconBg: "bg-secondary-100",
    trend: {
      value: "+18%",
      icon: TrendingUp,
      color: "text-success-600",
    },
    link: "/analytics",
  },
]);

const recentActivities = ref([
  {
    id: 1,
    user: "John Doe",
    action: "menambahkan",
    item: "Laptop Dell XPS 13",
    time: "2 jam yang lalu",
    status: "Selesai",
    statusColor: "bg-success-100 text-success-800",
    icon: Plus,
    iconColor: "text-success-600",
    iconBg: "bg-success-100",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "memperbarui status",
    item: "Printer HP LaserJet",
    time: "4 jam yang lalu",
    status: "Proses",
    statusColor: "bg-warning-100 text-warning-800",
    icon: Activity,
    iconColor: "text-warning-600",
    iconBg: "bg-warning-100",
  },
  {
    id: 3,
    user: "Admin",
    action: "menghapus",
    item: "Mouse Lama",
    time: "6 jam yang lalu",
    status: "Selesai",
    statusColor: "bg-error-100 text-error-800",
    icon: XCircle,
    iconColor: "text-error-600",
    iconBg: "bg-error-100",
  },
  {
    id: 4,
    user: "Tech Support",
    action: "maintenance",
    item: "Server Utama",
    time: "1 hari yang lalu",
    status: "Selesai",
    statusColor: "bg-success-100 text-success-800",
    icon: Wrench,
    iconColor: "text-primary-600",
    iconBg: "bg-primary-100",
  },
]);

const quickActions = ref([
  {
    title: "Tambah Barang Baru",
    icon: Plus,
    link: "/inventory/add",
  },
  {
    title: "Cari Inventaris",
    icon: Search,
    link: "/inventory",
  },
  {
    title: "Generate Laporan",
    icon: FileText,
    link: "/reports",
  },
  {
    title: "Export Data",
    icon: Download,
    link: "/export",
  },
]);

const notifications = ref([
  {
    id: 1,
    title: "Maintenance Terjadwal",
    message: "5 perangkat perlu maintenance minggu ini",
    icon: AlertTriangle,
    iconColor: "text-warning-600",
    textColor: "text-warning-900",
    subtextColor: "text-warning-700",
    bgColor: "bg-warning-50",
  },
  {
    id: 2,
    title: "Stok Menipis",
    message: "Toner printer akan habis dalam 3 hari",
    icon: Package,
    iconColor: "text-error-600",
    textColor: "text-error-900",
    subtextColor: "text-error-700",
    bgColor: "bg-error-50",
  },
  {
    id: 3,
    title: "Backup Berhasil",
    message: "Data berhasil di-backup pada 00:00",
    icon: CheckCircle,
    iconColor: "text-success-600",
    textColor: "text-success-900",
    subtextColor: "text-success-700",
    bgColor: "bg-success-50",
  },
]);

const inventoryStatus = ref([
  {
    label: "Aktif Digunakan",
    count: 892,
    percentage: 71.5,
    color: "bg-success-500",
  },
  {
    label: "Tersedia",
    count: 332,
    percentage: 26.6,
    color: "bg-primary-500",
  },
  {
    label: "Maintenance",
    count: 23,
    percentage: 1.9,
    color: "bg-warning-500",
  },
]);

const upcomingMaintenance = ref([
  {
    id: 1,
    item: "Server Database",
    type: "Maintenance Rutin",
    date: "15 Jan",
    priority: "Tinggi",
    priorityColor: "bg-error-100 text-error-800",
  },
  {
    id: 2,
    item: "AC Ruangan Server",
    type: "Pengecekan Filter",
    date: "18 Jan",
    priority: "Sedang",
    priorityColor: "bg-warning-100 text-warning-800",
  },
  {
    id: 3,
    item: "UPS Backup",
    type: "Test Battery",
    date: "22 Jan",
    priority: "Rendah",
    priorityColor: "bg-neutral-100 text-neutral-800",
  },
]);

// Methods
const navigateTo = (path: string) => {
  router.push(path);
};

// Lifecycle
onMounted(() => {
  // Load dashboard data
  console.log("Dashboard loaded for:", userDisplayName.value);
});
</script>
