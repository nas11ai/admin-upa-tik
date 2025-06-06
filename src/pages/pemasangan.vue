<template>
  <GenericFormPage
    title="Form Pemasangan"
    subtitle="Kelola permintaan pemasangan perangkat dan sistem"
    :icon="Zap"
    icon-color="text-yellow-600"
    collection-name="form_pemasangan"
    :load-data-function="loadDataFunction"
    search-placeholder="Cari judul, jenis, kontak..."
    :table-headers="['Permintaan', 'Jenis', 'Kontak', 'Tujuan', 'Status']"
    :display-fields="['judul', 'jenis', 'kontak', 'tujuan', 'status']"
    :detail-fields="[
      { key: 'judul', label: 'Judul' },
      { key: 'jenis', label: 'Jenis Pemasangan' },
      { key: 'tujuan', label: 'Tujuan', multiline: true },
      { key: 'kontak', label: 'Kontak' },
      { key: 'userEmail', label: 'Email Pengaju' },
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
    detail-title="Detail Pemasangan"
    empty-message="Belum ada permintaan pemasangan atau coba ubah filter pencarian."
  />
</template>

<script setup lang="ts">
import { Zap } from "lucide-vue-next";
import GenericFormPage from "../components/GenericFormPage.vue";
import { firestoreService } from "../services/firestore";

const loadDataFunction = () => {
  return firestoreService.getPemasangan();
};
</script>
