<template>
  <GenericFormPage
    title="Form Pembuatan"
    subtitle="Kelola permintaan pembuatan layanan dan sistem baru"
    :icon="Plus"
    icon-color="text-purple-600"
    collection-name="form_pembuatan"
    :load-data-function="loadDataFunction"
    search-placeholder="Cari judul, layanan, kontak..."
    :table-headers="['Permintaan', 'Layanan', 'Kontak', 'Tujuan', 'Status']"
    :display-fields="['judul', 'layanan', 'kontak', 'tujuan', 'status']"
    :detail-fields="[
      { key: 'judul', label: 'Judul' },
      { key: 'layanan', label: 'Layanan' },
      { key: 'namaLayanan', label: 'Nama Layanan' },
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
    detail-title="Detail Pembuatan"
    empty-message="Belum ada permintaan pembuatan atau coba ubah filter pencarian."
  />
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import GenericFormPage from "../components/GenericFormPage.vue";
import { firestoreService } from "../services/firestore";

const loadDataFunction = () => {
  return firestoreService.getPembuatan();
};
</script>
