<template>
  <GenericFormPage
    title="Form Bantuan"
    subtitle="Kelola permintaan bantuan dan dukungan teknis"
    :icon="HelpCircle"
    icon-color="text-indigo-600"
    collection-name="form_bantuan"
    :load-data-function="loadDataFunction"
    search-placeholder="Cari judul, tujuan, kontak..."
    :table-headers="['Permintaan', 'Jumlah', 'Kontak', 'Tujuan', 'Status']"
    :display-fields="['judul', 'jumlah', 'kontak', 'tujuan', 'status']"
    :detail-fields="[
      { key: 'judul', label: 'Judul' },
      { key: 'jumlah', label: 'Jumlah' },
      { key: 'tujuan', label: 'Tujuan', multiline: true },
      { key: 'kontak', label: 'Kontak' },
    ]"
    :status-options="[
      { value: 'terkirim', label: 'Terkirim' },
      { value: 'in review', label: 'In Review' },
      { value: 'diterima', label: 'Diterima' },
      { value: 'proses pengerjaan', label: 'Proses Pengerjaan' },
      { value: 'ditolak', label: 'Ditolak' },
      { value: 'selesai', label: 'Selesai' },
    ]"
    completed-label="Selesai"
    completed-status="selesai"
    detail-title="Detail Bantuan"
    empty-message="Belum ada permintaan bantuan atau coba ubah filter pencarian."
  />
</template>

<script setup lang="ts">
import { HelpCircle } from "lucide-vue-next";
import GenericFormPage from "../components/GenericFormPage.vue";
import { firestoreService } from "../services/firestore";

const loadDataFunction = () => {
  return firestoreService.getBantuan();
};
</script>
