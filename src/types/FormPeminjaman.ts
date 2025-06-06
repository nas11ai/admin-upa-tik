import type { Barang } from "./Barang";

export interface FormPeminjaman {
  id?: string;
  barangDipinjam: Barang[];
  harapanAnda: string;
  judul: string;
  kontakPenanggungJawab: string;
  namaPenanggungJawab: string;
  namaPerangkat: string;
  rentangTanggal: string;
  statusPeminjaman: string;
  tanggalMulai: string;
  tanggalPengajuan: any;
  tanggalPengambilan: string;
  tanggalSelesai: string;
  tujuanPeminjaman: string;
  userEmail: string;
}
