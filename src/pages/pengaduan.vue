<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-dashboard-text">Form Pengaduan</h1>
        <p class="text-dashboard-text-light mt-1">
          Kelola pengaduan dan keluhan dari pengguna
        </p>
      </div>
      <button
        @click="loadData"
        :disabled="loading"
        class="flex items-center px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        <RotateCcw class="h-4 w-4 mr-2" :class="{ 'animate-spin': loading }" />
        Refresh
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">Total</p>
          <p class="text-xl font-bold text-dashboard-text">{{ data.length }}</p>
          <MessageSquare class="h-6 w-6 text-red-600 mx-auto mt-1" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">Terkirim</p>
          <p class="text-xl font-bold text-gray-600">{{ terkirimCount }}</p>
          <Clock class="h-6 w-6 text-gray-600 mx-auto mt-1" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">In Review</p>
          <p class="text-xl font-bold text-yellow-600">{{ inReviewCount }}</p>
          <Eye class="h-6 w-6 text-yellow-600 mx-auto mt-1" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">Diterima</p>
          <p class="text-xl font-bold text-green-600">{{ diterimaCount }}</p>
          <CheckCircle class="h-6 w-6 text-green-600 mx-auto mt-1" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">Proses</p>
          <p class="text-xl font-bold text-purple-600">{{ prosesCount }}</p>
          <Settings class="h-6 w-6 text-purple-600 mx-auto mt-1" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">Selesai</p>
          <p class="text-xl font-bold text-success-600">{{ selesaiCount }}</p>
          <Badge class="h-6 w-6 text-success-600 mx-auto mt-1" />
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div
      class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
      >
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400"
          />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Cari judul, email, layanan..."
            class="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Semua Status</option>
          <option value="terkirim">Terkirim</option>
          <option value="in review">In Review</option>
          <option value="diterima">Diterima</option>
          <option value="proses pengerjaan">Proses Pengerjaan</option>
          <option value="ditolak">Ditolak</option>
          <option value="selesai">Selesai</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div
      class="bg-white rounded-xl shadow-card border border-dashboard-border overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-neutral-200">
          <thead class="bg-neutral-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Pengaduan
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Layanan
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Kontak
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-200">
            <tr
              v-for="item in filteredData"
              :key="item.id"
              class="hover:bg-neutral-50"
            >
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-neutral-900">
                    {{ item.judul }}
                  </div>
                  <div class="text-sm text-neutral-500 mt-1 line-clamp-2">
                    {{ item.keluhan }}
                  </div>
                  <div class="text-xs text-neutral-400 mt-1">
                    {{ item.userEmail }}
                  </div>
                  <div class="text-xs text-neutral-400 mt-1">
                    {{ formatDate(item.tanggalPengajuan || item.timestamp) }}
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 text-sm text-neutral-900">
                {{ item.layanan }}
              </td>

              <td class="px-6 py-4 text-sm text-neutral-900">
                {{ item.kontak }}
              </td>

              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusColor(item.status)"
                >
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>

              <td class="px-6 py-4 text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="viewDetail(item)"
                    class="text-primary-600 hover:text-primary-900 transition-colors"
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                  <button
                    @click="updateStatus(item)"
                    class="text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    <Edit class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredData.length === 0" class="text-center py-12">
        <MessageSquare class="mx-auto h-12 w-12 text-neutral-400" />
        <h3 class="mt-2 text-sm font-medium text-neutral-900">
          Tidak ada data
        </h3>
        <p class="mt-1 text-sm text-neutral-500">
          Belum ada pengaduan atau coba ubah filter pencarian.
        </p>
      </div>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="selectedItem"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeDetail"
    >
      <div
        class="bg-white rounded-lg max-w-lg w-full max-h-screen overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-neutral-900">
              Detail Pengaduan
            </h3>
            <button
              @click="closeDetail"
              class="text-neutral-400 hover:text-neutral-600"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700"
                >Judul</label
              >
              <p class="mt-1 text-sm text-neutral-900">
                {{ selectedItem.judul }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700"
                >Keluhan</label
              >
              <p class="mt-1 text-sm text-neutral-900 whitespace-pre-wrap">
                {{ selectedItem.keluhan }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700"
                  >Email</label
                >
                <p class="mt-1 text-sm text-neutral-900">
                  {{ selectedItem.userEmail }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700"
                  >Kontak</label
                >
                <p class="mt-1 text-sm text-neutral-900">
                  {{ selectedItem.kontak }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700"
                >Layanan</label
              >
              <p class="mt-1 text-sm text-neutral-900">
                {{ selectedItem.layanan }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700"
                >Status</label
              >
              <span
                class="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="getStatusColor(selectedItem.status)"
              >
                {{ getStatusLabel(selectedItem.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Update Modal -->
    <div
      v-if="statusUpdateItem"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeStatusUpdate"
    >
      <div class="bg-white rounded-lg p-6 m-4 max-w-md w-full" @click.stop>
        <h3 class="text-lg font-semibold text-neutral-900 mb-4">
          Update Status Pengaduan
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">
              Status untuk: {{ statusUpdateItem.judul }}
            </label>
            <select
              v-model="newStatus"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="terkirim">Terkirim</option>
              <option value="in review">In Review</option>
              <option value="diterima">Diterima</option>
              <option value="proses pengerjaan">Proses Pengerjaan</option>
              <option value="ditolak">Ditolak</option>
              <option value="selesai">Selesai</option>
            </select>

            <!-- Status Flow Helper -->
            <div class="mt-2 p-3 bg-blue-50 rounded-lg">
              <p class="text-xs text-blue-800 font-medium mb-1">Alur Status:</p>
              <div class="space-y-1">
                <div class="flex items-center space-x-1 text-xs text-blue-600">
                  <span class="px-1 py-0.5 bg-gray-100 text-gray-800 rounded"
                    >Terkirim</span
                  >
                  <span>→</span>
                  <span
                    class="px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded"
                    >In Review</span
                  >
                  <span>→</span>
                  <span class="px-1 py-0.5 bg-green-100 text-green-800 rounded"
                    >Diterima</span
                  >
                </div>
                <div class="flex items-center space-x-1 text-xs text-blue-600">
                  <span>→</span>
                  <span
                    class="px-1 py-0.5 bg-purple-100 text-purple-800 rounded"
                    >Proses Pengerjaan</span
                  >
                  <span>→</span>
                  <span
                    class="px-1 py-0.5 bg-success-100 text-success-800 rounded"
                    >Selesai</span
                  >
                </div>
                <p class="text-xs text-blue-600 mt-1">
                  atau
                  <span class="px-1 py-0.5 bg-error-100 text-error-800 rounded"
                    >Ditolak</span
                  >
                  kapan saja
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3 mt-6">
          <button
            @click="closeStatusUpdate"
            class="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Batal
          </button>
          <button
            @click="confirmStatusUpdate"
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
  MessageSquare,
  Clock,
  CheckCircle,
  Eye,
  Settings,
  Badge,
  Search,
  RotateCcw,
  Edit,
  X,
} from "lucide-vue-next";
import { firestoreService, type FormPengaduan } from "../services/firestore";
import { useNotification } from "../composables/useNotification";

// Composables
const { success, error } = useNotification();

// State
const loading = ref(false);
const data = ref<FormPengaduan[]>([]);
const searchTerm = ref("");
const statusFilter = ref("");
const selectedItem = ref<FormPengaduan | null>(null);
const statusUpdateItem = ref<FormPengaduan | null>(null);
const newStatus = ref("");
const updating = ref(false);

// Computed
const filteredData = computed(() => {
  let filtered = data.value;

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.judul?.toLowerCase().includes(term) ||
        item.keluhan?.toLowerCase().includes(term) ||
        item.userEmail?.toLowerCase().includes(term) ||
        item.layanan?.toLowerCase().includes(term)
    );
  }

  if (statusFilter.value) {
    filtered = filtered.filter((item) => item.status === statusFilter.value);
  }

  return filtered;
});

const terkirimCount = computed(
  () => data.value.filter((item) => item.status === "terkirim").length
);

const inReviewCount = computed(
  () => data.value.filter((item) => item.status === "in review").length
);

const diterimaCount = computed(
  () => data.value.filter((item) => item.status === "diterima").length
);

const prosesCount = computed(
  () => data.value.filter((item) => item.status === "proses pengerjaan").length
);

const selesaiCount = computed(
  () => data.value.filter((item) => item.status === "selesai").length
);

const formatDate = (date: string | number | Date) => {
  // implement your date formatting logic here
  // for example:
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};
// Methods
const getStatusColor = (status: string) => {
  return firestoreService.getStatusColor(status);
};

const getStatusLabel = (status: string) => {
  return firestoreService.getStatusLabel(status);
};

const loadData = async () => {
  try {
    loading.value = true;
    data.value = await firestoreService.getPengaduan();
  } catch (err) {
    console.error("Error loading pengaduan data:", err);
    error("Gagal memuat data pengaduan");
  } finally {
    loading.value = false;
  }
};

const viewDetail = (item: FormPengaduan) => {
  selectedItem.value = item;
};

const closeDetail = () => {
  selectedItem.value = null;
};

const updateStatus = (item: FormPengaduan) => {
  statusUpdateItem.value = item;
  newStatus.value = item.status;
};

const closeStatusUpdate = () => {
  statusUpdateItem.value = null;
  newStatus.value = "";
};

const confirmStatusUpdate = async () => {
  if (!statusUpdateItem.value) return;

  try {
    updating.value = true;

    await firestoreService.updateStatus(
      "form_pengaduan",
      statusUpdateItem.value.id!,
      newStatus.value
    );

    success("Status berhasil diperbarui");
    closeStatusUpdate();
    loadData();
  } catch (err) {
    console.error("Error updating status:", err);
    error("Gagal memperbarui status");
  } finally {
    updating.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
