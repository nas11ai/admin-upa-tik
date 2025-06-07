import type { Timestamp } from "firebase/firestore";

export interface DaftarBarang {
  id?: string;
  jenis: string;
  letak_barang: string;
  namaBarang: string;
  pemilik: string;
  peminjam: string;
  serial_number: string;
  status: "tersedia" | "dipinjam";
  tanggalKembali?: Timestamp;
  tanggalPinjam?: Timestamp;
  tanggal_masuk?: Timestamp;
  photoUrl?: string;
}
