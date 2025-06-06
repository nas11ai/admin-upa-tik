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
