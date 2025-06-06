<template>
  <GenericFormPage
    title="Form Lapor Kerusakan"
    subtitle="Kelola laporan kerusakan perangkat dan sistem"
    :icon="AlertTriangle"
    icon-color="text-orange-600"
    collection-name="form_lapor_kerusakan"
    :load-data-function="loadDataFunction"
    search-placeholder="Cari judul, perangkat, serial number..."
    :table-headers="[
      'Laporan',
      'Perangkat',
      'Serial Number',
      'Kontak',
      'Status',
    ]"
    :display-fields="[
      'judul',
      'namaPerangkat',
      'serialNumber',
      'kontak',
      'status',
    ]"
    :detail-fields="[
      { key: 'judul', label: 'Judul' },
      { key: 'namaPerangkat', label: 'Nama Perangkat' },
      { key: 'serialNumber', label: 'Serial Number' },
      { key: 'keterangan', label: 'Keterangan Kerusakan', multiline: true },
      { key: 'kontak', label: 'Kontak' },
      { key: 'userEmail', label: 'Email Pelapor' },
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
    detail-title="Detail Laporan Kerusakan"
    empty-message="Belum ada laporan kerusakan atau coba ubah filter pencarian."
  />
</template>

<script setup lang="ts">
import { AlertTriangle } from "lucide-vue-next";
import GenericFormPage from "../components/GenericFormPage.vue";
import { firestoreService } from "../services/firestore";

const loadDataFunction = () => {
  return firestoreService.getLaporKerusakan();
};
</script>
