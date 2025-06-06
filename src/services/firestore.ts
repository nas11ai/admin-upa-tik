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
      const q = query(
        collection(db, collectionName),
        orderBy("tanggalPengajuan", "desc")
      );
      const snapshot = await getDocs(q);
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
          pending: peminjaman.filter(
            (item) => item.statusPeminjaman === "pending"
          ).length,
          approved: peminjaman.filter(
            (item) => item.statusPeminjaman === "approved"
          ).length,
          rejected: peminjaman.filter(
            (item) => item.statusPeminjaman === "rejected"
          ).length,
        },
        pengaduan: {
          total: pengaduan.length,
          pending: pengaduan.filter((item) => item.status === "pending").length,
          resolved: pengaduan.filter((item) => item.status === "resolved")
            .length,
        },
        pemeliharaan: {
          total: pemeliharaan.length,
          pending: pemeliharaan.filter((item) => item.status === "pending")
            .length,
          inProgress: pemeliharaan.filter(
            (item) => item.status === "in-progress"
          ).length,
          completed: pemeliharaan.filter((item) => item.status === "completed")
            .length,
        },
        pembuatan: {
          total: pembuatan.length,
          pending: pembuatan.filter((item) => item.status === "pending").length,
        },
        pemasangan: {
          total: pemasangan.length,
          pending: pemasangan.filter((item) => item.status === "pending")
            .length,
        },
        laporKerusakan: {
          total: laporKerusakan.length,
          pending: laporKerusakan.filter((item) => item.status === "pending")
            .length,
        },
        bantuan: {
          total: bantuan.length,
          pending: bantuan.filter((item) => item.status === "pending").length,
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
    const q = query(
      collection(db, collectionName),
      orderBy("tanggalPengajuan", "desc")
    );

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
      if (date.toDate) {
        return date.toDate().toLocaleDateString("id-ID");
      }
      return new Date(date).toLocaleDateString("id-ID");
    } catch {
      return date.toString();
    }
  }

  // Get status color helper
  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-warning-100 text-warning-800";
      case "approved":
      case "resolved":
      case "completed":
        return "bg-success-100 text-success-800";
      case "rejected":
      case "cancelled":
        return "bg-error-100 text-error-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  }

  // Get status label helper
  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Menunggu";
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      case "resolved":
        return "Selesai";
      case "completed":
        return "Selesai";
      case "in-progress":
        return "Sedang Proses";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status || "Tidak Diketahui";
    }
  }
}

export const firestoreService = new FirestoreService();
export default firestoreService;
