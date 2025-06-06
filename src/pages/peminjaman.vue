<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-dashboard-text">Form Peminjaman</h1>
        <p class="text-dashboard-text-light mt-1">
          Kelola pengajuan peminjaman perangkat dan barang
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          @click="loadData"
          :disabled="loading"
          class="flex items-center px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <RotateCcw
            class="h-4 w-4 mr-2"
            :class="{ 'animate-spin': loading }"
          />
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">Total</p>
          <p class="text-xl font-bold text-dashboard-text">{{ data.length }}</p>
          <Package class="h-6 w-6 text-blue-600 mx-auto mt-1" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">Diajukan</p>
          <p class="text-xl font-bold text-warning-600">{{ diajukanCount }}</p>
          <Clock class="h-6 w-6 text-warning-600 mx-auto mt-1" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">Disetujui</p>
          <p class="text-xl font-bold text-blue-600">{{ disetujuiCount }}</p>
          <CheckCircle class="h-6 w-6 text-blue-600 mx-auto mt-1" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">Diambil</p>
          <p class="text-xl font-bold text-indigo-600">{{ diambilCount }}</p>
          <Archive class="h-6 w-6 text-indigo-600 mx-auto mt-1" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-4 shadow-card border border-dashboard-border"
      >
        <div class="text-center">
          <p class="text-xs text-dashboard-text-light">Ditolak</p>
          <p class="text-xl font-bold text-error-600">{{ ditolakCount }}</p>
          <XCircle class="h-6 w-6 text-error-600 mx-auto mt-1" />
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
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0"
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
              placeholder="Cari judul, nama, email..."
              class="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="diajukan">Diajukan</option>
            <option value="disetujui">Disetujui</option>
            <option value="diambil">Diambil</option>
            <option value="ditolak">Ditolak</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
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
                Pengajuan
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Penanggung Jawab
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Perangkat
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Tanggal
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
                  <div class="text-sm text-neutral-500">
                    {{ item.userEmail }}
                  </div>
                  <div class="text-xs text-neutral-400 mt-1">
                    {{ formatDate(item.tanggalPengajuan) }}
                  </div>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="text-sm text-neutral-900">
                  {{ item.namaPenanggungJawab }}
                </div>
                <div class="text-sm text-neutral-500">
                  {{ item.kontakPenanggungJawab }}
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="text-sm text-neutral-900">
                  {{ item.namaPerangkat }}
                </div>
                <div
                  v-if="item.barangDipinjam && item.barangDipinjam.length"
                  class="text-xs text-neutral-500 mt-1"
                >
                  {{ item.barangDipinjam.length }} barang dipinjam
                </div>
              </td>

              <td class="px-6 py-4 text-sm text-neutral-500">
                <div>Mulai: {{ item.tanggalMulai || "-" }}</div>
                <div>Selesai: {{ item.tanggalSelesai || "-" }}</div>
              </td>

              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusColor(item.statusPeminjaman)"
                >
                  {{ getStatusLabel(item.statusPeminjaman) }}
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
        <Package class="mx-auto h-12 w-12 text-neutral-400" />
        <h3 class="mt-2 text-sm font-medium text-neutral-900">
          Tidak ada data
        </h3>
        <p class="mt-1 text-sm text-neutral-500">
          Belum ada pengajuan peminjaman atau coba ubah filter pencarian.
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
        class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-neutral-900">
              Detail Peminjaman
            </h3>
            <button
              @click="closeDetail"
              class="text-neutral-400 hover:text-neutral-600"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  >Status</label
                >
                <span
                  class="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusColor(selectedItem.statusPeminjaman)"
                >
                  {{ getStatusLabel(selectedItem.statusPeminjaman) }}
                </span>
              </div>
            </div>

            <!-- Responsible Person -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700"
                  >Penanggung Jawab</label
                >
                <p class="mt-1 text-sm text-neutral-900">
                  {{ selectedItem.namaPenanggungJawab }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700"
                  >Kontak</label
                >
                <p class="mt-1 text-sm text-neutral-900">
                  {{ selectedItem.kontakPenanggungJawab }}
                </p>
              </div>
            </div>

            <!-- Equipment -->
            <div>
              <label class="block text-sm font-medium text-neutral-700"
                >Perangkat</label
              >
              <p class="mt-1 text-sm text-neutral-900">
                {{ selectedItem.namaPerangkat }}
              </p>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700"
                  >Tanggal Mulai</label
                >
                <p class="mt-1 text-sm text-neutral-900">
                  {{ selectedItem.tanggalMulai || "-" }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700"
                  >Tanggal Selesai</label
                >
                <p class="mt-1 text-sm text-neutral-900">
                  {{ selectedItem.tanggalSelesai || "-" }}
                </p>
              </div>
            </div>

            <!-- Purpose -->
            <div>
              <label class="block text-sm font-medium text-neutral-700"
                >Tujuan Peminjaman</label
              >
              <p class="mt-1 text-sm text-neutral-900">
                {{ selectedItem.tujuanPeminjaman || "-" }}
              </p>
            </div>

            <!-- Hope -->
            <div>
              <label class="block text-sm font-medium text-neutral-700"
                >Harapan</label
              >
              <p class="mt-1 text-sm text-neutral-900">
                {{ selectedItem.harapanAnda || "-" }}
              </p>
            </div>

            <!-- Borrowed Items -->
            <div
              v-if="
                selectedItem.barangDipinjam &&
                selectedItem.barangDipinjam.length
              "
            >
              <label class="block text-sm font-medium text-neutral-700 mb-2"
                >Barang Dipinjam</label
              >
              <div class="space-y-2">
                <div
                  v-for="(barang, index) in selectedItem.barangDipinjam"
                  :key="index"
                  class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div>
                    <p class="text-sm font-medium text-neutral-900">
                      {{ barang.namaBarang }}
                    </p>
                    <p class="text-xs text-neutral-500">{{ barang.jenis }}</p>
                  </div>
                  <div class="text-xs text-neutral-500">
                    {{ barang.tanggalPinjam }}
                  </div>
                </div>
              </div>
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
          Update Status Peminjaman
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
              <option value="diajukan">Diajukan</option>
              <option value="disetujui">Disetujui</option>
              <option value="diambil">Diambil</option>
              <option value="ditolak">Ditolak</option>
              <option value="selesai">Selesai</option>
            </select>

            <!-- Status Flow Helper -->
            <div class="mt-2 p-3 bg-blue-50 rounded-lg">
              <p class="text-xs text-blue-800 font-medium mb-1">Alur Status:</p>
              <div class="flex items-center space-x-1 text-xs text-blue-600">
                <span
                  class="px-1 py-0.5 bg-warning-100 text-warning-800 rounded"
                  >Diajukan</span
                >
                <span>→</span>
                <span class="px-1 py-0.5 bg-blue-100 text-blue-800 rounded"
                  >Disetujui</span
                >
                <span>→</span>
                <span class="px-1 py-0.5 bg-indigo-100 text-indigo-800 rounded"
                  >Diambil</span
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
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  Badge,
  Search,
  RotateCcw,
  Eye,
  Edit,
  X,
} from "lucide-vue-next";
import { firestoreService } from "../services/firestore";
import { useNotification } from "../composables/useNotification";
import type { FormPeminjaman } from "@/types/FormPeminjaman";

// Composables
const { success, error } = useNotification();

// State
const loading = ref(false);
const data = ref<FormPeminjaman[]>([]);
const searchTerm = ref("");
const statusFilter = ref("");
const selectedItem = ref<FormPeminjaman | null>(null);
const statusUpdateItem = ref<FormPeminjaman | null>(null);
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
        item.namaPenanggungJawab?.toLowerCase().includes(term) ||
        item.userEmail?.toLowerCase().includes(term) ||
        item.namaPerangkat?.toLowerCase().includes(term)
    );
  }

  if (statusFilter.value) {
    filtered = filtered.filter(
      (item) => item.statusPeminjaman === statusFilter.value
    );
  }

  return filtered;
});

const diajukanCount = computed(
  () => data.value.filter((item) => item.statusPeminjaman === "diajukan").length
);

const disetujuiCount = computed(
  () =>
    data.value.filter((item) => item.statusPeminjaman === "disetujui").length
);

const diambilCount = computed(
  () => data.value.filter((item) => item.statusPeminjaman === "diambil").length
);

const ditolakCount = computed(
  () => data.value.filter((item) => item.statusPeminjaman === "ditolak").length
);

const selesaiCount = computed(
  () => data.value.filter((item) => item.statusPeminjaman === "selesai").length
);

// Methods
const formatDate = (date: any) => {
  return firestoreService.formatDate(date);
};

const getStatusColor = (status: string) => {
  return firestoreService.getStatusColor(status);
};

const getStatusLabel = (status: string) => {
  return firestoreService.getStatusLabel(status);
};

const loadData = async () => {
  try {
    loading.value = true;
    data.value = await firestoreService.getPeminjaman();
  } catch (err) {
    console.error("Error loading peminjaman data:", err);
    error("Gagal memuat data peminjaman");
  } finally {
    loading.value = false;
  }
};

const viewDetail = (item: FormPeminjaman) => {
  selectedItem.value = item;
};

const closeDetail = () => {
  selectedItem.value = null;
};

const updateStatus = (item: FormPeminjaman) => {
  statusUpdateItem.value = item;
  newStatus.value = item.statusPeminjaman;
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
      "form_peminjaman",
      statusUpdateItem.value.id!,
      newStatus.value
    );

    success("Status berhasil diperbarui");
    closeStatusUpdate();
    loadData(); // Refresh data
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
