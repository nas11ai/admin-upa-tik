<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-dashboard-text">
          Dashboard Admin UPA TIK
        </h1>
        <p class="text-dashboard-text-light mt-1">
          Selamat datang, {{ userDisplayName }}! Kelola semua pengajuan dan
          permintaan layanan.
        </p>
      </div>
      <button
        @click="refreshData"
        :disabled="loading"
        class="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        <RotateCcw class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
        Refresh
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in statsCards"
        :key="stat.title"
        class="bg-white rounded-xl p-6 shadow-card border border-dashboard-border hover:shadow-card-hover transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-dashboard-text-light">{{ stat.title }}</p>
            <p class="text-2xl font-bold text-dashboard-text">
              {{ stat.total }}
            </p>
            <div class="flex items-center mt-2 space-x-2">
              <span
                v-if="stat.title === 'Peminjaman'"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800"
              >
                {{ stat.pending }} diajukan
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {{ stat.pending }} terkirim
              </span>
            </div>
          </div>
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="stat.iconBg"
          >
            <component
              :is="stat.icon"
              class="h-6 w-6"
              :class="stat.iconColor"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <router-link
        v-for="service in services"
        :key="service.name"
        :to="service.path"
        class="bg-white rounded-xl p-6 shadow-card border border-dashboard-border hover:shadow-card-hover transition-all group"
      >
        <div class="flex items-center justify-between mb-4">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="service.iconBg"
          >
            <component
              :is="service.icon"
              class="h-6 w-6"
              :class="service.iconColor"
            />
          </div>
          <span
            v-if="service.count > 0"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800"
          >
            {{ service.count }}
          </span>
        </div>

        <h3
          class="text-lg font-semibold text-dashboard-text group-hover:text-primary-600 transition-colors"
        >
          {{ service.name }}
        </h3>

        <div
          class="flex items-center mt-4 text-primary-600 group-hover:text-primary-700"
        >
          <span class="text-sm font-medium">Lihat semua</span>
          <ChevronRight
            class="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
          />
        </div>
      </router-link>
    </div>

    <!-- Recent Submissions -->
    <div class="bg-white rounded-xl shadow-card border border-dashboard-border">
      <div class="px-6 py-4 border-b border-dashboard-border">
        <h3 class="text-lg font-semibold text-dashboard-text">
          Pengajuan Terbaru
        </h3>
      </div>

      <div class="divide-y divide-neutral-200">
        <div
          v-for="item in recentSubmissions"
          :key="`${item.type}-${item.id}`"
          class="p-6 hover:bg-neutral-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-start space-x-4">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="getServiceConfig(item.type).iconBg"
              >
                <component
                  :is="getServiceConfig(item.type).icon"
                  class="h-5 w-5"
                  :class="getServiceConfig(item.type).iconColor"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-dashboard-text truncate">
                  {{ item.judul }}
                </h4>
                <p class="text-sm text-dashboard-text-light">
                  {{ getServiceConfig(item.type).name }} • {{ item.userEmail }}
                </p>
                <p class="text-xs text-dashboard-text-light mt-1">
                  {{ formatDate(item.tanggalPengajuan) }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="
                  firestoreService.getStatusColor(
                    item.status || item.statusPeminjaman
                  )
                "
              >
                {{
                  firestoreService.getStatusLabel(
                    item.status || item.statusPeminjaman
                  )
                }}
              </span>

              <button
                @click="
                  updateStatus(
                    item.type,
                    item.id!,
                    item.status || item.statusPeminjaman
                  )
                "
                class="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="recentSubmissions.length === 0" class="p-6 text-center">
        <FileX class="mx-auto h-12 w-12 text-neutral-400" />
        <h3 class="mt-2 text-sm font-medium text-neutral-900">
          Tidak ada pengajuan
        </h3>
        <p class="mt-1 text-sm text-neutral-500">
          Belum ada pengajuan yang masuk hari ini.
        </p>
      </div>
    </div>

    <!-- Status Update Modal -->
    <div
      v-if="showStatusModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeStatusModal"
    >
      <div class="bg-white rounded-lg p-6 m-4 max-w-md w-full" @click.stop>
        <h3 class="text-lg font-semibold text-neutral-900 mb-4">
          Update Status
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">
              Status Baru
            </label>
            <select
              v-model="selectedStatus"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="in-progress">Sedang Proses</option>
              <option value="completed">Selesai</option>
              <option value="resolved">Selesai</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 mt-6">
          <button
            @click="closeStatusModal"
            class="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Batal
          </button>
          <button
            @click="confirmUpdateStatus"
            :disabled="updating"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {{ updating ? "Memperbarui..." : "Update" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  RotateCcw,
  ChevronRight,
  FileX,
  Package,
  MessageSquare,
  Wrench,
  Plus,
  Zap,
  AlertTriangle,
  HelpCircle,
} from "lucide-vue-next";
import { useAuth } from "../composables/useAuth";
import { useNotification } from "../composables/useNotification";
import { firestoreService, type FormPeminjaman } from "../services/firestore";

// Composables
const { userDisplayInfo } = useAuth();
const { success, error } = useNotification();

// State
const loading = ref(false);
const stats = ref<any>({});
const recentSubmissions = ref<any[]>([]);
const showStatusModal = ref(false);
const selectedStatus = ref("");
const updating = ref(false);
const currentItem = ref<{
  type: string;
  id: string;
  currentStatus: string;
} | null>(null);

// Service configuration
const serviceConfigs = {
  form_peminjaman: {
    name: "Peminjaman",
    icon: Package,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    path: "/peminjaman",
  },
  form_pengaduan: {
    name: "Pengaduan",
    icon: MessageSquare,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    path: "/pengaduan",
  },
  form_pemeliharaan: {
    name: "Pemeliharaan",
    icon: Wrench,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    path: "/pemeliharaan",
  },
  form_pembuatan: {
    name: "Pembuatan",
    icon: Plus,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    path: "/pembuatan",
  },
  form_pemasangan: {
    name: "Pemasangan",
    icon: Zap,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
    path: "/pemasangan",
  },
  form_lapor_kerusakan: {
    name: "Lapor Kerusakan",
    icon: AlertTriangle,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    path: "/lapor-kerusakan",
  },
  form_bantuan: {
    name: "Bantuan",
    icon: HelpCircle,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
    path: "/bantuan",
  },
};

// Computed
const userDisplayName = computed(
  () => userDisplayInfo.value?.displayName || "Admin"
);

const statsCards = computed(() => [
  {
    title: "Peminjaman",
    total: stats.value.peminjaman?.total || 0,
    pending: stats.value.peminjaman?.diajukan || 0,
    icon: Package,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    title: "Pengaduan",
    total: stats.value.pengaduan?.total || 0,
    pending: stats.value.pengaduan?.terkirim || 0,
    icon: MessageSquare,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
  },
  {
    title: "Pemeliharaan",
    total: stats.value.pemeliharaan?.total || 0,
    pending: stats.value.pemeliharaan?.terkirim || 0,
    icon: Wrench,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    title: "Lainnya",
    total:
      (stats.value.pembuatan?.total || 0) +
      (stats.value.pemasangan?.total || 0) +
      (stats.value.laporKerusakan?.total || 0) +
      (stats.value.bantuan?.total || 0),
    pending:
      (stats.value.pembuatan?.terkirim || 0) +
      (stats.value.pemasangan?.terkirim || 0) +
      (stats.value.laporKerusakan?.terkirim || 0) +
      (stats.value.bantuan?.terkirim || 0),
    icon: HelpCircle,
    iconColor: "text-neutral-600",
    iconBg: "bg-neutral-100",
  },
]);

const services = computed(() =>
  Object.entries(serviceConfigs).map(([key, config]) => ({
    ...config,
    count: stats.value[key.replace("form_", "")]?.pending || 0,
  }))
);

// Methods
const getServiceConfig = (type: string) => {
  return (
    serviceConfigs[type as keyof typeof serviceConfigs] ||
    serviceConfigs["form_bantuan"]
  );
};

const formatDate = (date: any) => {
  return firestoreService.formatDate(date);
};

type SubmissionWithTanggalPengajuan = FormPeminjaman & { type: string };

function hasTanggalPengajuan(
  submission: any
): submission is SubmissionWithTanggalPengajuan {
  return "tanggalPengajuan" in submission && !!submission.tanggalPengajuan;
}

const loadDashboardData = async () => {
  try {
    loading.value = true;

    // Load stats
    stats.value = await firestoreService.getDashboardStats();

    // Load recent submissions (from all collections)
    const [
      peminjaman,
      pengaduan,
      pemeliharaan,
      pembuatan,
      pemasangan,
      laporKerusakan,
      bantuan,
    ] = await Promise.all([
      firestoreService.getPeminjaman(),
      firestoreService.getPengaduan(),
      firestoreService.getPemeliharaan(),
      firestoreService.getPembuatan(),
      firestoreService.getPemasangan(),
      firestoreService.getLaporKerusakan(),
      firestoreService.getBantuan(),
    ]);

    // Combine and sort by date
    const allSubmissions = [
      ...peminjaman.map((item) => ({ ...item, type: "form_peminjaman" })),
      ...pengaduan.map((item) => ({ ...item, type: "form_pengaduan" })),
      ...pemeliharaan.map((item) => ({ ...item, type: "form_pemeliharaan" })),
      ...pembuatan.map((item) => ({ ...item, type: "form_pembuatan" })),
      ...pemasangan.map((item) => ({ ...item, type: "form_pemasangan" })),
      ...laporKerusakan.map((item) => ({
        ...item,
        type: "form_lapor_kerusakan",
      })),
      ...bantuan.map((item) => ({ ...item, type: "form_bantuan" })),
    ];

    // Sort by date and take latest 10
    recentSubmissions.value = allSubmissions
      .filter(hasTanggalPengajuan)
      .sort((a, b) => {
        const dateA =
          a.tanggalPengajuan?.toDate?.() || new Date(a.tanggalPengajuan);
        const dateB =
          b.tanggalPengajuan?.toDate?.() || new Date(b.tanggalPengajuan);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);
  } catch (err) {
    console.error("Error loading dashboard data:", err);
    error("Gagal memuat data dashboard");
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  loadDashboardData();
};

const updateStatus = (type: string, id: string, currentStatus: string) => {
  currentItem.value = { type, id, currentStatus };
  selectedStatus.value = currentStatus;
  showStatusModal.value = true;
};

const closeStatusModal = () => {
  showStatusModal.value = false;
  currentItem.value = null;
  selectedStatus.value = "";
};

const confirmUpdateStatus = async () => {
  if (!currentItem.value) return;

  try {
    updating.value = true;

    await firestoreService.updateStatus(
      currentItem.value.type,
      currentItem.value.id,
      selectedStatus.value
    );

    success("Status berhasil diperbarui");
    closeStatusModal();
    loadDashboardData(); // Refresh data
  } catch (err) {
    console.error("Error updating status:", err);
    error("Gagal memperbarui status");
  } finally {
    updating.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadDashboardData();
});
</script>
