import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../configs/firebase";

// Types
export interface Barang {
  jenis: string;
  namaBarang: string;
  tanggalPinjam: string;
}

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

export interface FormPengaduan {
  id?: string;
  judul: string;
  keluhan: string;
  kontak: string;
  layanan: string;
  status: string;
  userEmail: string;
  timestamp?: any; // Added for compatibility
  tanggalPengajuan?: any; // Keep for backward compatibility
}

export interface FormPemeliharaan {
  id?: string;
  akun: string;
  alasan: string;
  jenis: string;
  judul: string;
  layanan: string;
  status: string;
  userEmail: string;
}

export interface FormPembuatan {
  id?: string;
  judul: string;
  kontak: string;
  layanan: string;
  namaLayanan: string;
  status: string;
  tujuan: string;
  userEmail: string;
}

export interface FormPemasangan {
  id?: string;
  jenis: string;
  judul: string;
  kontak: string;
  status: string;
  tujuan: string;
  userEmail: string;
}

export interface FormLaporKerusakan {
  id?: string;
  judul: string;
  keterangan: string;
  kontak: string;
  namaPerangkat: string;
  serialNumber: string;
  status: string;
  userEmail: string;
}

export interface FormBantuan {
  id?: string;
  judul: string;
  jumlah: string;
  kontak: string;
  status: string;
  tujuan: string;
}

class FirestoreService {
  // Get all data from a collection
  async getCollection<T>(collectionName: string): Promise<T[]> {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      throw error;
    }
  }

  // Update status
  async updateStatus(
    collectionName: string,
    docId: string,
    newStatus: string
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        status: newStatus,
        statusPeminjaman: newStatus, // untuk form_peminjaman
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error(`Error updating status:`, error);
      throw error;
    }
  }

  // Get specific collections
  async getPeminjaman(): Promise<FormPeminjaman[]> {
    return this.getCollection<FormPeminjaman>("form_peminjaman");
  }

  async getPengaduan(): Promise<FormPengaduan[]> {
    return this.getCollection<FormPengaduan>("form_pengaduan");
  }

  async getPemeliharaan(): Promise<FormPemeliharaan[]> {
    return this.getCollection<FormPemeliharaan>("form_pemeliharaan");
  }

  async getPembuatan(): Promise<FormPembuatan[]> {
    return this.getCollection<FormPembuatan>("form_pembuatan");
  }

  async getPemasangan(): Promise<FormPemasangan[]> {
    return this.getCollection<FormPemasangan>("form_pemasangan");
  }

  async getLaporKerusakan(): Promise<FormLaporKerusakan[]> {
    return this.getCollection<FormLaporKerusakan>("form_lapor_kerusakan");
  }

  async getBantuan(): Promise<FormBantuan[]> {
    return this.getCollection<FormBantuan>("form_bantuan");
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const [
        peminjaman,
        pengaduan,
        pemeliharaan,
        pembuatan,
        pemasangan,
        laporKerusakan,
        bantuan,
      ] = await Promise.all([
        this.getPeminjaman(),
        this.getPengaduan(),
        this.getPemeliharaan(),
        this.getPembuatan(),
        this.getPemasangan(),
        this.getLaporKerusakan(),
        this.getBantuan(),
      ]);

      return {
        peminjaman: {
          total: peminjaman.length,
          diajukan: peminjaman.filter(
            (item) => item.statusPeminjaman === "diajukan"
          ).length,
          disetujui: peminjaman.filter(
            (item) => item.statusPeminjaman === "disetujui"
          ).length,
          diambil: peminjaman.filter(
            (item) => item.statusPeminjaman === "diambil"
          ).length,
          ditolak: peminjaman.filter(
            (item) => item.statusPeminjaman === "ditolak"
          ).length,
          selesai: peminjaman.filter(
            (item) => item.statusPeminjaman === "selesai"
          ).length,
        },
        pengaduan: {
          total: pengaduan.length,
          terkirim: pengaduan.filter((item) => item.status === "terkirim")
            .length,
          selesai: pengaduan.filter((item) => item.status === "selesai").length,
        },
        pemeliharaan: {
          total: pemeliharaan.length,
          terkirim: pemeliharaan.filter((item) => item.status === "terkirim")
            .length,
          selesai: pemeliharaan.filter((item) => item.status === "selesai")
            .length,
        },
        pembuatan: {
          total: pembuatan.length,
          terkirim: pembuatan.filter((item) => item.status === "terkirim")
            .length,
          selesai: pembuatan.filter((item) => item.status === "selesai").length,
        },
        pemasangan: {
          total: pemasangan.length,
          terkirim: pemasangan.filter((item) => item.status === "terkirim")
            .length,
          selesai: pemasangan.filter((item) => item.status === "selesai")
            .length,
        },
        laporKerusakan: {
          total: laporKerusakan.length,
          terkirim: laporKerusakan.filter((item) => item.status === "terkirim")
            .length,
          selesai: laporKerusakan.filter((item) => item.status === "selesai")
            .length,
        },
        bantuan: {
          total: bantuan.length,
          terkirim: bantuan.filter((item) => item.status === "terkirim").length,
          selesai: bantuan.filter((item) => item.status === "selesai").length,
        },
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw error;
    }
  }

  // Real-time listener for a collection
  subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void
  ): () => void {
    // Try different field names for ordering
    let q;

    try {
      q = query(
        collection(db, collectionName),
        orderBy("tanggalPengajuan", "desc")
      );
    } catch (error) {
      try {
        q = query(collection(db, collectionName), orderBy("timestamp", "desc"));
      } catch (error) {
        // Fallback: no ordering
        q = collection(db, collectionName);
      }
    }

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      callback(data);
    });
  }

  // Format date helper
  formatDate(date: any): string {
    if (!date) return "-";

    try {
      // Handle Firestore Timestamp
      if (date.toDate) {
        return date.toDate().toLocaleDateString("id-ID");
      }

      // Handle string timestamps like "26/05/2025 09:42"
      if (typeof date === "string") {
        // Check if it's already in DD/MM/YYYY format
        if (date.includes("/") && date.length >= 10) {
          return date.split(" ")[0]; // Return just the date part
        }

        // Try to parse as regular date string
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString("id-ID");
        }

        // Return as is if it looks like a date
        return date;
      }

      // Handle regular Date object
      if (date instanceof Date) {
        return date.toLocaleDateString("id-ID");
      }

      // Try to create Date from timestamp
      return new Date(date).toLocaleDateString("id-ID");
    } catch (error) {
      console.log("Date parsing error:", error);
      return date.toString();
    }
  }

  // Get status color helper
  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case "pending":
      case "diajukan":
        return "bg-warning-100 text-warning-800";
      case "approved":
      case "disetujui":
        return "bg-blue-100 text-blue-800";
      case "diambil":
        return "bg-indigo-100 text-indigo-800";
      case "rejected":
      case "ditolak":
        return "bg-error-100 text-error-800";
      case "completed":
      case "resolved":
      case "selesai":
        return "bg-success-100 text-success-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "scheduled":
        return "bg-cyan-100 text-cyan-800";
      case "diagnosed":
        return "bg-orange-100 text-orange-800";
      case "in-repair":
        return "bg-red-100 text-red-800";
      case "assigned":
        return "bg-teal-100 text-teal-800";
      case "cancelled":
        return "bg-neutral-100 text-neutral-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  }

  // Get status label helper
  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Menunggu";
      case "diajukan":
        return "Diajukan";
      case "approved":
        return "Disetujui";
      case "disetujui":
        return "Disetujui";
      case "diambil":
        return "Diambil";
      case "rejected":
        return "Ditolak";
      case "ditolak":
        return "Ditolak";
      case "completed":
        return "Selesai";
      case "resolved":
        return "Selesai";
      case "selesai":
        return "Selesai";
      case "in-progress":
        return "Sedang Proses";
      case "scheduled":
        return "Terjadwal";
      case "diagnosed":
        return "Didiagnosa";
      case "in-repair":
        return "Sedang Diperbaiki";
      case "assigned":
        return "Ditugaskan";
      case "cancelled":
        return "Dibatalkan";
      case "irreparable":
        return "Tidak Dapat Diperbaiki";
      case "closed":
        return "Ditutup";
      default:
        return status || "Tidak Diketahui";
    }
  }
}

export const firestoreService = new FirestoreService();
export default firestoreService;
