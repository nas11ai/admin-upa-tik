<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-dashboard-text">Daftar Barang</h1>
        <p class="text-dashboard-text-light mt-1">
          Kelola inventaris barang dan peralatan
        </p>
      </div>
      <button
        @click="handleCreate"
        class="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Plus class="h-4 w-4 mr-2" />
        Tambah Barang
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="bg-white rounded-xl p-6 shadow-card border border-dashboard-border"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-dashboard-text-light">Total Barang</p>
            <p class="text-2xl font-bold text-dashboard-text">
              {{ data.length }}
            </p>
          </div>
          <Package class="h-8 w-8 text-primary-600" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-6 shadow-card border border-dashboard-border"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-dashboard-text-light">Tersedia</p>
            <p class="text-2xl font-bold text-success-600">
              {{ tersediaCount }}
            </p>
          </div>
          <CheckCircle class="h-8 w-8 text-success-600" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-6 shadow-card border border-dashboard-border"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-dashboard-text-light">Dipinjam</p>
            <p class="text-2xl font-bold text-warning-600">
              {{ dipinjamCount }}
            </p>
          </div>
          <Clock class="h-8 w-8 text-warning-600" />
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
              placeholder="Cari nama, serial, jenis, lokasi..."
              class="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="dipinjam">Dipinjam</option>
          </select>

          <select
            v-model="jenisFilter"
            class="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua Jenis</option>
            <option v-for="jenis in jenisTypes" :key="jenis" :value="jenis">
              {{ jenis }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
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
                Barang
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Serial Number
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Lokasi
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Peminjam
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
              :key="item.serial_number"
              class="hover:bg-neutral-50"
            >
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <img
                    v-if="item.photoUrl"
                    :src="item.photoUrl"
                    :alt="item.namaBarang"
                    class="h-10 w-10 rounded-lg object-cover mr-3"
                  />
                  <div
                    v-else
                    class="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center mr-3"
                  >
                    <Package class="h-5 w-5 text-neutral-400" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-neutral-900">
                      {{ item.namaBarang }}
                    </div>
                    <div class="text-sm text-neutral-500">{{ item.jenis }}</div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 text-sm text-neutral-900">
                {{ item.serial_number }}
              </td>

              <td class="px-6 py-4 text-sm text-neutral-500">
                {{ item.letak_barang }}
              </td>

              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusColor(item.status)"
                >
                  {{ item.status === "tersedia" ? "Tersedia" : "Dipinjam" }}
                </span>
              </td>

              <td class="px-6 py-4 text-sm text-neutral-500">
                {{ item.peminjam || "-" }}
              </td>

              <td class="px-6 py-4 text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="handleDetail(item)"
                    class="text-primary-600 hover:text-primary-900 transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                  <button
                    @click="handleEdit(item)"
                    class="text-neutral-600 hover:text-neutral-900 transition-colors"
                    title="Edit"
                  >
                    <Edit class="h-4 w-4" />
                  </button>
                  <button
                    @click="handleDelete(item)"
                    class="text-error-600 hover:text-error-900 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 class="h-4 w-4" />
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
          Belum ada barang atau coba ubah filter pencarian.
        </p>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showFormModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeFormModal"
    >
      <div
        class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-neutral-900">
              {{ isEditing ? "Edit Barang" : "Tambah Barang Baru" }}
            </h3>
            <button
              @click="closeFormModal"
              class="text-neutral-400 hover:text-neutral-600"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <form @submit.prevent="submitForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1"
                  >Serial Number</label
                >
                <input
                  v-model="formData.serial_number"
                  type="text"
                  :disabled="isEditing"
                  :class="isEditing ? 'bg-neutral-100 text-neutral-500' : ''"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Contoh: LT001"
                  required
                />
                <p v-if="isEditing" class="text-xs text-neutral-500 mt-1">
                  Serial number tidak dapat diubah
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1"
                  >Nama Barang</label
                >
                <input
                  v-model="formData.namaBarang"
                  type="text"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Contoh: Laptop Dell Latitude"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1"
                  >Jenis</label
                >
                <input
                  v-model="formData.jenis"
                  type="text"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Contoh: Laptop, Printer, Monitor"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1"
                  >Pemilik</label
                >
                <input
                  v-model="formData.pemilik"
                  type="text"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Contoh: UPA TIK"
                  required
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1"
                >Letak Barang</label
              >
              <input
                v-model="formData.letak_barang"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Contoh: Ruang Server, Ruang Admin"
                required
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1"
                  >Status</label
                >
                <select
                  v-model="formData.status"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="tersedia">Tersedia</option>
                  <option value="dipinjam">Dipinjam</option>
                </select>
              </div>
              <div v-if="formData.status === 'dipinjam'">
                <label class="block text-sm font-medium text-neutral-700 mb-1"
                  >Peminjam</label
                >
                <input
                  v-model="formData.peminjam"
                  type="text"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nama peminjam"
                />
              </div>
            </div>

            <div v-if="formData.status === 'dipinjam'">
              <label class="block text-sm font-medium text-neutral-700 mb-1"
                >Tanggal Kembali</label
              >
              <input
                v-model="formData.tanggalKembali"
                type="date"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1"
                >URL Foto (Opsional)</label
              >
              <input
                v-model="formData.photoUrl"
                type="url"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div class="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="closeFormModal"
                class="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {{
                  submitting ? "Menyimpan..." : isEditing ? "Update" : "Simpan"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="selectedItem && showDetailModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeDetailModal"
    >
      <div
        class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-neutral-900">
              Detail Barang
            </h3>
            <button
              @click="closeDetailModal"
              class="text-neutral-400 hover:text-neutral-600"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-6">
            <!-- Photo -->
            <div v-if="selectedItem.photoUrl" class="text-center">
              <img
                :src="selectedItem.photoUrl"
                :alt="selectedItem.namaBarang"
                class="mx-auto h-32 w-32 object-cover rounded-lg shadow-sm"
              />
            </div>

            <!-- Basic Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700"
                  >Serial Number</label
                >
                <p class="mt-1 text-sm text-neutral-900 flex items-center">
                  <Hash class="h-4 w-4 mr-1 text-neutral-400" />
                  {{ selectedItem.serial_number }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700"
                  >Nama Barang</label
                >
                <p class="mt-1 text-sm text-neutral-900 flex items-center">
                  <Package class="h-4 w-4 mr-1 text-neutral-400" />
                  {{ selectedItem.namaBarang }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700"
                  >Jenis</label
                >
                <p class="mt-1 text-sm text-neutral-900 flex items-center">
                  <Tag class="h-4 w-4 mr-1 text-neutral-400" />
                  {{ selectedItem.jenis }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700"
                  >Pemilik</label
                >
                <p class="mt-1 text-sm text-neutral-900 flex items-center">
                  <User class="h-4 w-4 mr-1 text-neutral-400" />
                  {{ selectedItem.pemilik }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700"
                >Letak Barang</label
              >
              <p class="mt-1 text-sm text-neutral-900 flex items-center">
                <MapPin class="h-4 w-4 mr-1 text-neutral-400" />
                {{ selectedItem.letak_barang }}
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
                {{
                  selectedItem.status === "tersedia" ? "Tersedia" : "Dipinjam"
                }}
              </span>
            </div>

            <div v-if="selectedItem.status === 'dipinjam'">
              <div v-if="selectedItem.peminjam">
                <label class="block text-sm font-medium text-neutral-700"
                  >Peminjam</label
                >
                <p class="mt-1 text-sm text-neutral-900 flex items-center">
                  <User class="h-4 w-4 mr-1 text-neutral-400" />
                  {{ selectedItem.peminjam }}
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div v-if="selectedItem.tanggalPinjam">
                  <label class="block text-sm font-medium text-neutral-700"
                    >Tanggal Pinjam</label
                  >
                  <p class="mt-1 text-sm text-neutral-900 flex items-center">
                    <Calendar class="h-4 w-4 mr-1 text-neutral-400" />
                    {{ formatDate(selectedItem.tanggalPinjam) }}
                  </p>
                </div>
                <div v-if="selectedItem.tanggalKembali">
                  <label class="block text-sm font-medium text-neutral-700"
                    >Tanggal Kembali</label
                  >
                  <p class="mt-1 text-sm text-neutral-900 flex items-center">
                    <Calendar class="h-4 w-4 mr-1 text-neutral-400" />
                    {{ formatDate(selectedItem.tanggalKembali) }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="selectedItem.tanggal_masuk">
              <label class="block text-sm font-medium text-neutral-700"
                >Tanggal Masuk</label
              >
              <p class="mt-1 text-sm text-neutral-900 flex items-center">
                <Calendar class="h-4 w-4 mr-1 text-neutral-400" />
                {{ formatDate(selectedItem.tanggal_masuk) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="selectedItem && showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeDeleteModal"
    >
      <div class="bg-white rounded-lg p-6 m-4 max-w-md w-full" @click.stop>
        <div class="flex items-center mb-4">
          <AlertCircle class="h-6 w-6 text-error-600 mr-3" />
          <h3 class="text-lg font-semibold text-neutral-900">Hapus Barang</h3>
        </div>

        <p class="text-sm text-neutral-600 mb-6">
          Apakah Anda yakin ingin menghapus
          <strong>{{ selectedItem.namaBarang }}</strong> dengan serial number
          <strong>{{ selectedItem.serial_number }}</strong
          >? Tindakan ini tidak dapat dibatalkan.
        </p>

        <div class="flex items-center justify-end space-x-3">
          <button
            @click="closeDeleteModal"
            class="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Batal
          </button>
          <button
            @click="confirmDelete"
            :disabled="deleting"
            class="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors disabled:opacity-50"
          >
            {{ deleting ? "Menghapus..." : "Hapus" }}
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
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Calendar,
  MapPin,
  User,
  Hash,
  Tag,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-vue-next";
import { Timestamp } from "firebase/firestore";
import { firestoreService } from "../services/firestore";
import type { DaftarBarang } from "@/types/DaftarBarang";

// State
const loading = ref(false);
const data = ref<DaftarBarang[]>([]);
const searchTerm = ref("");
const statusFilter = ref("");
const jenisFilter = ref("");

// Modal states
const showFormModal = ref(false);
const showDetailModal = ref(false);
const showDeleteModal = ref(false);
const selectedItem = ref<DaftarBarang | null>(null);
const isEditing = ref(false);
const submitting = ref(false);
const deleting = ref(false);

// Form state
const formData = ref({
  serial_number: "",
  namaBarang: "",
  jenis: "",
  pemilik: "",
  letak_barang: "",
  status: "tersedia" as "tersedia" | "dipinjam",
  peminjam: "",
  tanggalKembali: "",
  photoUrl: "",
});

// Computed
const filteredData = computed(() => {
  let filtered = data.value;

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.namaBarang?.toLowerCase().includes(term) ||
        item.serial_number?.toLowerCase().includes(term) ||
        item.jenis?.toLowerCase().includes(term) ||
        item.letak_barang?.toLowerCase().includes(term)
    );
  }

  if (statusFilter.value) {
    filtered = filtered.filter((item) => item.status === statusFilter.value);
  }

  if (jenisFilter.value) {
    filtered = filtered.filter((item) => item.jenis === jenisFilter.value);
  }

  return filtered;
});

const tersediaCount = computed(
  () => data.value.filter((item) => item.status === "tersedia").length
);

const dipinjamCount = computed(
  () => data.value.filter((item) => item.status === "dipinjam").length
);

const jenisTypes = computed(() =>
  [...new Set(data.value.map((item) => item.jenis))].filter(Boolean)
);

// Methods
const formatDate = (date: any) => {
  return firestoreService.formatDate(date);
};

const getStatusColor = (status: string) => {
  return status === "tersedia"
    ? "bg-success-100 text-success-800"
    : "bg-warning-100 text-warning-800";
};

const loadData = async () => {
  try {
    loading.value = true;
    data.value = await firestoreService.getDaftarBarang();
  } catch (err) {
    console.error("Error loading daftar barang:", err);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    serial_number: "",
    namaBarang: "",
    jenis: "",
    pemilik: "",
    letak_barang: "",
    status: "tersedia",
    peminjam: "",
    tanggalKembali: "",
    photoUrl: "",
  };
};

const handleCreate = () => {
  resetForm();
  isEditing.value = false;
  showFormModal.value = true;
};

const handleEdit = (item: DaftarBarang) => {
  selectedItem.value = item;
  isEditing.value = true;
  formData.value = {
    serial_number: item.serial_number,
    namaBarang: item.namaBarang,
    jenis: item.jenis,
    pemilik: item.pemilik,
    letak_barang: item.letak_barang,
    status: item.status,
    peminjam: item.peminjam || "",
    tanggalKembali: item.tanggalKembali
      ? new Date(
          item.tanggalKembali instanceof Date
            ? item.tanggalKembali
            : item.tanggalKembali.toDate()
        )
          .toISOString()
          .split("T")[0]
      : "",
    photoUrl: item.photoUrl || "",
  };
  showFormModal.value = true;
};

const handleDetail = (item: DaftarBarang) => {
  selectedItem.value = item;
  showDetailModal.value = true;
};

const handleDelete = (item: DaftarBarang) => {
  selectedItem.value = item;
  showDeleteModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  selectedItem.value = null;
  resetForm();
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedItem.value = null;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedItem.value = null;
};

const submitForm = async () => {
  try {
    submitting.value = true;

    const submitData: any = {
      ...formData.value,
    };

    if (formData.value.tanggalKembali) {
      submitData.tanggalKembali = Timestamp.fromDate(
        new Date(formData.value.tanggalKembali)
      );
    } else {
      delete submitData.tanggalKembali;
    }

    if (isEditing.value && selectedItem.value) {
      await firestoreService.updateDaftarBarang(
        selectedItem.value.serial_number,
        submitData
      );
    } else {
      await firestoreService.createDaftarBarang(submitData);
    }

    closeFormModal();
    loadData();
  } catch (err) {
    console.error("Error submitting form:", err);
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async () => {
  if (!selectedItem.value) return;

  try {
    deleting.value = true;
    await firestoreService.deleteDaftarBarang(selectedItem.value.serial_number);
    closeDeleteModal();
    loadData();
  } catch (err) {
    console.error("Error deleting item:", err);
  } finally {
    deleting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>
