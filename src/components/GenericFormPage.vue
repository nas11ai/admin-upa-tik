<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-dashboard-text">{{ title }}</h1>
        <p class="text-dashboard-text-light mt-1">{{ subtitle }}</p>
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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="bg-white rounded-xl p-6 shadow-card border border-dashboard-border"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-dashboard-text-light">Total</p>
            <p class="text-2xl font-bold text-dashboard-text">
              {{ data.length }}
            </p>
          </div>
          <component :is="icon" class="h-8 w-8" :class="iconColor" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-6 shadow-card border border-dashboard-border"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-dashboard-text-light">Pending</p>
            <p class="text-2xl font-bold text-warning-600">
              {{ pendingCount }}
            </p>
          </div>
          <Clock class="h-8 w-8 text-warning-600" />
        </div>
      </div>

      <div
        class="bg-white rounded-xl p-6 shadow-card border border-dashboard-border"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-dashboard-text-light">
              {{ completedLabel }}
            </p>
            <p class="text-2xl font-bold text-success-600">
              {{ completedCount }}
            </p>
          </div>
          <CheckCircle class="h-8 w-8 text-success-600" />
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
            :placeholder="searchPlaceholder"
            class="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Semua Status</option>
          <option
            v-for="status in statusOptions"
            :key="status.value"
            :value="status.value"
          >
            {{ status.label }}
          </option>
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
                {{ tableHeaders[0] }}
              </th>
              <th
                v-for="header in tableHeaders.slice(1, -1)"
                :key="header"
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                {{ header }}
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
                    {{ getItemValue(item, "judul") }}
                  </div>
                  <div class="text-xs text-neutral-400 mt-1">
                    {{ getItemValue(item, "userEmail") }}
                  </div>
                </div>
              </td>

              <td
                v-for="field in displayFields.slice(1, -1)"
                :key="field"
                class="px-6 py-4 text-sm text-neutral-900"
              >
                {{ getItemValue(item, field) }}
              </td>

              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusColor(getItemValue(item, 'status'))"
                >
                  {{ getStatusLabel(getItemValue(item, "status")) }}
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
        <component :is="icon" class="mx-auto h-12 w-12 text-neutral-400" />
        <h3 class="mt-2 text-sm font-medium text-neutral-900">
          Tidak ada data
        </h3>
        <p class="mt-1 text-sm text-neutral-500">{{ emptyMessage }}</p>
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
              {{ detailTitle }}
            </h3>
            <button
              @click="closeDetail"
              class="text-neutral-400 hover:text-neutral-600"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-4">
            <div v-for="field in detailFields" :key="field.key">
              <label class="block text-sm font-medium text-neutral-700">{{
                field.label
              }}</label>
              <p
                class="mt-1 text-sm text-neutral-900"
                :class="{ 'whitespace-pre-wrap': field.multiline }"
              >
                {{ getItemValue(selectedItem, field.key) || "-" }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700"
                >Status</label
              >
              <span
                class="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="getStatusColor(getItemValue(selectedItem, 'status'))"
              >
                {{ getStatusLabel(getItemValue(selectedItem, "status")) }}
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
          Update Status
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">
              Status untuk: {{ getItemValue(statusUpdateItem, "judul") }}
            </label>
            <select
              v-model="newStatus"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option
                v-for="status in statusOptions"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
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
import { ref, computed, onMounted, defineProps } from "vue";
import {
  Clock,
  CheckCircle,
  Search,
  RotateCcw,
  Eye,
  Edit,
  X,
} from "lucide-vue-next";
import { firestoreService } from "../services/firestore";

// Props
interface Props {
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  collectionName: string;
  loadDataFunction: () => Promise<any[]>;
  searchPlaceholder: string;
  tableHeaders: string[];
  displayFields: string[];
  detailFields: Array<{ key: string; label: string; multiline?: boolean }>;
  statusOptions: Array<{ value: string; label: string }>;
  completedLabel: string;
  completedStatus: string;
  detailTitle: string;
  emptyMessage: string;
}

const props = defineProps<Props>();

// State
const loading = ref(false);
const data = ref<any[]>([]);
const searchTerm = ref("");
const statusFilter = ref("");
const selectedItem = ref<any>(null);
const statusUpdateItem = ref<any>(null);
const newStatus = ref("");
const updating = ref(false);

// Computed
const filteredData = computed(() => {
  let filtered = data.value;

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter((item) =>
      props.displayFields.some((field) => {
        const value = getItemValue(item, field);
        return value?.toString().toLowerCase().includes(term);
      })
    );
  }

  if (statusFilter.value) {
    filtered = filtered.filter(
      (item) => getItemValue(item, "status") === statusFilter.value
    );
  }

  return filtered;
});

const pendingCount = computed(
  () =>
    data.value.filter((item) => getItemValue(item, "status") === "pending")
      .length
);

const completedCount = computed(
  () =>
    data.value.filter(
      (item) => getItemValue(item, "status") === props.completedStatus
    ).length
);

// Methods
const getItemValue = (item: any, key: string) => {
  return item[key];
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
    data.value = await props.loadDataFunction();
  } catch (err) {
    console.error(`Error loading ${props.collectionName} data:`, err);
  } finally {
    loading.value = false;
  }
};

const viewDetail = (item: any) => {
  selectedItem.value = item;
};

const closeDetail = () => {
  selectedItem.value = null;
};

const updateStatus = (item: any) => {
  statusUpdateItem.value = item;
  newStatus.value = getItemValue(item, "status");
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
      props.collectionName,
      statusUpdateItem.value.id,
      newStatus.value
    );

    closeStatusUpdate();
    loadData();
  } catch (err) {
    console.error("Error updating status:", err);
  } finally {
    updating.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadData();
});
</script>
