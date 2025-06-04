<template>
  <div
    class="min-h-screen bg-linear-to-br from-error-50 to-warning-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-lg w-full text-center">
      <!-- Unauthorized Illustration -->
      <div class="mb-8">
        <div
          class="mx-auto w-32 h-32 bg-linear-to-br from-error-500 to-warning-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <ShieldAlert class="h-16 w-16 text-white" />
        </div>
      </div>

      <!-- Error Message -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 mb-4">Akses Ditolak</h1>
        <p class="text-lg text-neutral-600 mb-4">
          Anda tidak memiliki izin untuk mengakses halaman admin.
        </p>
        <div
          class="bg-white rounded-lg p-6 shadow-card border border-neutral-200 text-left"
        >
          <h3
            class="text-sm font-semibold text-neutral-900 mb-3 flex items-center"
          >
            <Info class="h-4 w-4 mr-2 text-primary-500" />
            Informasi Akun Anda
          </h3>

          <div v-if="userDisplayInfo" class="space-y-3">
            <div class="flex items-center space-x-3">
              <img
                v-if="userDisplayInfo.photoURL"
                :src="userDisplayInfo.photoURL"
                :alt="userDisplayInfo.displayName"
                class="w-10 h-10 rounded-full"
              />
              <div
                class="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center"
                v-else
              >
                <User class="h-5 w-5 text-neutral-500" />
              </div>
              <div>
                <p class="text-sm font-medium text-neutral-900">
                  {{ userDisplayInfo.displayName }}
                </p>
                <p class="text-xs text-neutral-500">
                  {{ userDisplayInfo.email }}
                </p>
              </div>
            </div>

            <div class="border-t border-neutral-200 pt-3 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-neutral-600">Role:</span>
                <span
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  :class="getRoleColor(userDisplayInfo.role)"
                >
                  {{ getRoleLabel(userDisplayInfo.role) }}
                </span>
              </div>

              <div
                v-if="userDisplayInfo.department"
                class="flex justify-between items-center"
              >
                <span class="text-xs text-neutral-600">Departemen:</span>
                <span class="text-xs text-neutral-900">{{
                  userDisplayInfo.department
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Requirements -->
      <div
        class="mb-8 bg-white rounded-lg p-6 shadow-card border border-neutral-200 text-left"
      >
        <h3
          class="text-sm font-semibold text-neutral-900 mb-3 flex items-center"
        >
          <AlertTriangle class="h-4 w-4 mr-2 text-warning-500" />
          Persyaratan Akses Admin
        </h3>
        <ul class="text-sm text-neutral-600 space-y-2">
          <li class="flex items-start">
            <div
              class="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"
            ></div>
            <span
              >Role harus diatur sebagai <strong>"Admin"</strong> oleh
              administrator sistem</span
            >
          </li>
          <li class="flex items-start">
            <div
              class="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"
            ></div>
            <span>Akun harus dalam status <strong>"Aktif"</strong></span>
          </li>
          <li class="flex items-start">
            <div
              class="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"
            ></div>
            <span>Menggunakan akun Google yang terdaftar di sistem</span>
          </li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <button
          @click="handleLogout"
          :disabled="isLoading"
          class="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-error-600 hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500 disabled:opacity-50 transition-colors"
        >
          <LogOut class="w-5 h-5 mr-2" />
          {{ isLoading ? "Keluar..." : "Keluar dan Login Ulang" }}
        </button>

        <button
          @click="refreshPage"
          class="w-full flex items-center justify-center px-6 py-3 border border-neutral-300 text-base font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <RotateCcw class="w-5 h-5 mr-2" />
          Refresh Halaman
        </button>
      </div>

      <!-- Contact Support -->
      <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start">
          <HelpCircle class="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div class="text-left">
            <h4 class="text-sm font-medium text-blue-900 mb-1">
              Butuh Akses Admin?
            </h4>
            <p class="text-xs text-blue-700 mb-2">
              Hubungi administrator IT untuk mengaktifkan akun atau mengubah
              role Anda.
            </p>
            <div class="space-y-1 text-xs text-blue-600">
              <div class="flex items-center">
                <Mail class="h-3 w-3 mr-1" />
                <span>admin-it@upatik.example.com</span>
              </div>
              <div class="flex items-center">
                <Phone class="h-3 w-3 mr-1" />
                <span>+62 21 1234 5678</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-xs text-neutral-500">
          © 2024 UPA TIK. Sistem Inventaris Barang Elektronik.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ShieldAlert,
  Info,
  User,
  AlertTriangle,
  LogOut,
  RotateCcw,
  HelpCircle,
  Mail,
  Phone,
} from "lucide-vue-next";
import { useAuth } from "../composables/useAuth";

// Composables
const { logout, userDisplayInfo, isLoading } = useAuth();

// Methods
const handleLogout = async () => {
  const result = await logout();
  if (!result.success) {
    console.error("Logout failed:", result.error);
  }
};

const refreshPage = () => {
  window.location.reload();
};

const getRoleLabel = (role: string) => {
  const labels = {
    admin: "Administrator",
    user: "Pengguna",
    viewer: "Peninjau",
  };
  return labels[role as keyof typeof labels] || role;
};

const getRoleColor = (role: string) => {
  const colors = {
    admin: "bg-success-100 text-success-800",
    user: "bg-warning-100 text-warning-800",
    viewer: "bg-neutral-100 text-neutral-800",
  };
  return (
    colors[role as keyof typeof colors] || "bg-neutral-100 text-neutral-800"
  );
};
</script>
