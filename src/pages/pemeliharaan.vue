<template>
  <GenericFormPage
    title="Form Pemeliharaan"
    subtitle="Kelola permintaan pemeliharaan sistem dan layanan"
    :icon="Wrench"
    icon-color="text-green-600"
    collection-name="form_pemeliharaan"
    :load-data-function="loadDataFunction"
    search-placeholder="Cari judul, akun, layanan..."
    :table-headers="['Permintaan', 'Akun', 'Layanan', 'Jenis', 'Status']"
    :display-fields="['judul', 'akun', 'layanan', 'jenis', 'status']"
    :detail-fields="[
      { key: 'judul', label: 'Judul' },
      { key: 'akun', label: 'Akun' },
      { key: 'layanan', label: 'Layanan' },
      { key: 'jenis', label: 'Jenis' },
      { key: 'alasan', label: 'Alasan', multiline: true },
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
    detail-title="Detail Pemeliharaan"
    empty-message="Belum ada permintaan pemeliharaan atau coba ubah filter pencarian."
  />
</template>

<script setup lang="ts">
import { Wrench } from "lucide-vue-next";
import GenericFormPage from "../components/GenericFormPage.vue";
import { firestoreService } from "../services/firestore";

const loadDataFunction = () => {
  return firestoreService.getPemeliharaan();
};
</script>
