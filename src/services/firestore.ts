import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { db, firebaseApp } from "../configs/firebase";
import type { FormPeminjaman } from "@/types/FormPeminjaman";
import type { FormPengaduan } from "@/types/FormPengaduan";
import type { FormPemeliharaan } from "@/types/FormPemeliharaan";
import type { FormPembuatan } from "@/types/FormPembuatan";
import type { FormPemasangan } from "@/types/FormPemasangan";
import type { FormLaporKerusakan } from "@/types/FormLaporKerusakan";
import type { FormBantuan } from "@/types/FormBantuan";
import type { DaftarBarang } from "@/types/DaftarBarang";

interface NotificationData {
  id?: string;
  title: string;
  body: string;
  type: "status_update" | "new_entry";
  collectionName: string;
  documentId: string;
  timestamp: Date;
  read: boolean;
  userEmail?: string;
}

class FirestoreService {
  private messaging: any;
  private notificationCallbacks: Set<(notification: NotificationData) => void> =
    new Set();

  constructor() {
    this.initializeMessaging();
  }
  // Initialize Firebase Cloud Messaging
  private async initializeMessaging() {
    try {
      this.messaging = getMessaging(firebaseApp);

      // Listen for foreground messages
      onMessage(this.messaging, (payload) => {
        console.log("Message received in foreground: ", payload);
        this.handleForegroundMessage(payload);
      });
    } catch (error) {
      console.error("Error initializing messaging:", error);
    }
  }

  // Request notification permission and get FCM token
  async requestNotificationPermission(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const token = await getToken(this.messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // Add this to your .env
        });
        console.log("FCM Token:", token);
        return token;
      } else {
        console.log("Notification permission denied");
        return null;
      }
    } catch (error) {
      console.error("Error getting notification permission:", error);
      return null;
    }
  }

  // Handle foreground messages
  private handleForegroundMessage(payload: any) {
    const notification: NotificationData = {
      title: payload.notification?.title || "New Notification",
      body: payload.notification?.body || "You have a new update",
      type: payload.data?.type || "status_update",
      collectionName: payload.data?.collectionName || "",
      documentId: payload.data?.documentId || "",
      timestamp: new Date(),
      read: false,
      userEmail: payload.data?.userEmail || "admin@example.com",
    };

    // Show browser notification
    this.showBrowserNotification(notification);

    // Store in Firestore
    this.storeNotification(notification);

    // Notify all registered callbacks
    this.notificationCallbacks.forEach((callback) => callback(notification));
  }

  // Show browser notification
  private showBrowserNotification(notification: NotificationData) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.body,
        icon: "/favicon.ico", // Add your app icon
        badge: "/badge-icon.png", // Add badge icon
        tag: notification.documentId, // Prevent duplicate notifications
        requireInteraction: true,
      });
    }
  }

  // Store notification in Firestore
  private async storeNotification(notification: NotificationData) {
    try {
      if (!notification.userEmail) {
        notification.userEmail = "admin@example.com";
      }

      await addDoc(collection(db, "notifications"), {
        ...notification,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error storing notification:", error);
    }
  }

  // Subscribe to notification updates
  subscribeToNotifications(
    callback: (notification: NotificationData) => void
  ): () => void {
    this.notificationCallbacks.add(callback);

    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  // Get notifications for a user
  async getNotifications(userEmail?: string): Promise<NotificationData[]> {
    try {
      const q = userEmail
        ? query(collection(db, "notifications"), orderBy("timestamp", "desc"))
        : query(collection(db, "notifications"), orderBy("timestamp", "desc"));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationData[];
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, "notifications", notificationId);
      await updateDoc(docRef, {
        read: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  // Send notification (this would typically be called from your backend)
  private async sendNotification(
    title: string,
    body: string,
    type: "status_update" | "new_entry",
    collectionName: string,
    documentId: string,
    userEmail?: string
  ) {
    const notification: NotificationData = {
      title,
      body,
      type,
      collectionName,
      documentId,
      timestamp: new Date(),
      read: false,
      userEmail,
    };

    // Store notification
    await this.storeNotification(notification);

    // If you have a backend service, you would call it here to send FCM messages
    // For now, we'll just trigger local notifications
    this.notificationCallbacks.forEach((callback) => callback(notification));
  }

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

  // Get display name for collection
  private getCollectionDisplayName(collectionName: string): string {
    const displayNames: { [key: string]: string } = {
      form_peminjaman: "Peminjaman",
      form_pengaduan: "Pengaduan",
      form_pemeliharaan: "Pemeliharaan",
      form_pembuatan: "Pembuatan",
      form_pemasangan: "Pemasangan",
      form_lapor_kerusakan: "Laporan Kerusakan",
      form_bantuan: "Bantuan",
    };
    return displayNames[collectionName] || collectionName;
  }

  // Update status
  async updateStatus(
    collectionName: string,
    docId: string,
    newStatus: string,
    userEmail?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        status: newStatus,
        statusPeminjaman: newStatus, // untuk form_peminjaman
        updatedAt: new Date(),
      });

      // Send notification for status update
      const title = this.getCollectionDisplayName(collectionName);
      const body = `Status ${title.toLowerCase()} telah diubah menjadi: ${this.getStatusLabel(
        newStatus
      )}`;

      await this.sendNotification(
        `${title} - Update Status`,
        body,
        "status_update",
        collectionName,
        docId,
        userEmail
      );
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

  async getDaftarBarang(): Promise<DaftarBarang[]> {
    return this.getCollection<DaftarBarang>("daftar_barang");
  }

  // Enhanced create daftar barang (no notification for barang as requested)
  async createDaftarBarang(barang: DaftarBarang): Promise<void> {
    if (!barang.serial_number) {
      throw new Error("serial_number diperlukan sebagai ID dokumen.");
    }

    try {
      const docRef = doc(db, "daftar_barang", barang.serial_number);
      await setDoc(docRef, {
        ...barang,
        tanggal_masuk: barang.tanggal_masuk || new Date(),
        status: barang.status || "tersedia",
      });
    } catch (error) {
      console.error("Gagal menambahkan barang:", error);
      throw error;
    }
  }

  async updateDaftarBarang(
    serial_number: string,
    data: Partial<DaftarBarang>
  ): Promise<void> {
    try {
      const docRef = doc(db, "daftar_barang", serial_number);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Gagal mengupdate barang:", error);
      throw error;
    }
  }

  async deleteDaftarBarang(serial_number: string): Promise<void> {
    try {
      const docRef = doc(db, "daftar_barang", serial_number);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Gagal menghapus barang:", error);
      throw error;
    }
  }

  // Enhanced real-time listener with notifications
  subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    enableNotifications: boolean = true
  ): () => void {
    let q;
    let isFirstLoad = true;
    let previousDataMap = new Map<string, any>();

    try {
      q = query(
        collection(db, collectionName),
        orderBy("tanggalPengajuan", "desc")
      );
    } catch (error) {
      try {
        q = query(collection(db, collectionName), orderBy("timestamp", "desc"));
      } catch (error) {
        q = collection(db, collectionName);
      }
    }

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      callback(data);

      // Handle notifications for changes (skip barang collection)
      if (enableNotifications && collectionName !== "daftar_barang") {
        snapshot.docChanges().forEach((change) => {
          const docData = { id: change.doc.id, ...change.doc.data() } as any;

          if (change.type === "added" && !isFirstLoad) {
            // New document added
            const title = this.getCollectionDisplayName(collectionName);
            this.sendNotification(
              `${title} Baru`,
              `${title} baru telah ditambahkan: ${
                docData.judul || docData.namaBarang || "Item baru"
              }`,
              "new_entry",
              collectionName,
              change.doc.id,
              docData.userEmail
            );
          } else if (change.type === "modified" && !isFirstLoad) {
            // Document modified - check if status changed
            const previousData = previousDataMap.get(change.doc.id);
            const currentStatus = docData.status || docData.statusPeminjaman;
            const previousStatus =
              previousData?.status || previousData?.statusPeminjaman;

            if (previousStatus && currentStatus !== previousStatus) {
              const title = this.getCollectionDisplayName(collectionName);
              this.sendNotification(
                `${title} - Update Status`,
                `Status telah diubah dari "${this.getStatusLabel(
                  previousStatus
                )}" menjadi "${this.getStatusLabel(currentStatus)}"`,
                "status_update",
                collectionName,
                change.doc.id,
                docData.userEmail
              );
            }
          }

          // Update previous data map
          previousDataMap.set(change.doc.id, docData);
        });

        isFirstLoad = false;
      }
    });
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
        daftarBarang,
      ] = await Promise.all([
        this.getPeminjaman(),
        this.getPengaduan(),
        this.getPemeliharaan(),
        this.getPembuatan(),
        this.getPemasangan(),
        this.getLaporKerusakan(),
        this.getBantuan(),
        this.getDaftarBarang(),
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
        daftarBarang: {
          total: daftarBarang.length,
          tersedia: daftarBarang.filter((item) => item.status === "tersedia")
            .length,
          dipinjam: daftarBarang.filter((item) => item.status === "dipinjam")
            .length,
        },
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw error;
    }
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
