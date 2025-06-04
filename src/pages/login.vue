<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-500 shadow-lg">
          <Package class="h-8 w-8 text-white" />
        </div>
        <h2 class="mt-6 text-3xl font-bold text-neutral-900">
          Admin Panel UPA TIK
        </h2>
        <p class="mt-2 text-sm text-neutral-600">
          Sistem Inventaris Barang Elektronik
        </p>
        <div class="mt-3 flex items-center justify-center">
          <div class="flex items-center px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-xs font-medium">
            <Shield class="h-3 w-3 mr-1" />
            Khusus Admin
          </div>
        </div>
      </div>

      <!-- Login Card -->
      <div class="mt-8 bg-white rounded-xl shadow-card-hover p-8">
        <!-- Access Requirements -->
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start">
            <Info class="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 class="text-sm font-medium text-blue-900 mb-1">
                Persyaratan Akses
              </h4>
              <ul class="text-xs text-blue-700 space-y-1">
                <li>• Hanya untuk pengguna dengan role <strong>Admin</strong></li>
                <li>• Akun harus sudah diaktivasi oleh administrator</li>
                <li>• Gunakan akun Google yang terdaftar di sistem</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Google Sign-in Button -->
        <div class="space-y-4">
          <button
            @click="handleGoogleLogin"
            :disabled="isLoading"
            class="w-full flex items-center justify-center px-6 py-3 border border-neutral-300 rounded-lg shadow-sm text-base font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
          >
            <div class="flex items-center">
              <Loader2 v-if="isLoading" class="animate-spin h-5 w-5 mr-3 text-neutral-500" />
              <svg v-else class="h-5 w-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {{ isLoading ? 'Memproses...' : 'Masuk dengan Google' }}
            </div>
          </button>

          <!-- Error Message -->
          <div
            v-if="error"
            class="flex items-start p-4 bg-error-50 border border-error-200 rounded-lg animate-fade-in"
          >
            <AlertCircle class="h-5 w-5 text-error-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-error-800">Login Gagal</p>
              <p class="text-sm text-error-700 mt-1">{{ error }}</p>
              <button
                @click="clearError"
                class="mt-2 text-xs text-error-600 hover:text-error-800 underline"
              >
                Tutup pesan
              </button>
            </div>
          </div>

          <!-- Success Message for Demo -->
          <div
            v-if="showDemoInfo"
            class="p-4 bg-success-50 border border-success-200 rounded-lg"
          >
            <div class="flex items-start">
              <CheckCircle class="h-5 w-5 text-success-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-success-800">Demo Mode</p>
                <p class="text-sm text-success-700 mt-1">
                  Untuk testing, gunakan akun Google yang sudah dikonfigurasi sebagai admin di Firestore.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="mt-6 space-y-4">
          <!-- Role Info -->
          <div class="border-t border-neutral-200 pt-4">
            <h4 class="text-sm font-medium text-neutral-700 mb-2">Role & Permissions</h4>
            <div class="space-y-2 text-xs text-neutral-600">
              <div class="flex items-center">
                <div class="w-2 h-2 bg-success-500 rounded-full mr-2"></div>
                <span><strong>Admin:</strong> Akses penuh ke semua fitur sistem</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-warning-500 rounded-full mr-2"></div>
                <span><strong>User:</strong> Akses terbatas (tidak bisa masuk dashboard admin)</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 bg-neutral-400 rounded-full mr-2"></div>
                <span><strong>Viewer:</strong> Hanya bisa melihat data</span>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="border-t border-neutral-200 pt-4">
            <h4 class="text-sm font-medium text-neutral-700 mb-2">Butuh Akses?</h4>
            <p class="text-xs text-neutral-600">
              Hubungi administrator IT untuk aktivasi akun atau perubahan role.
            </p>
            <div class="flex items-center mt-1 text-xs text-primary-600">
              <Mail class="h-3 w-3 mr-1" />
              <span>admin-it@upatik.example.com</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center">
        <p class="text-xs text-neutral-500">
          © 2024 UPA TIK. Sistem Inventaris Barang Elektronik.
        </p>
        <div class="mt-2 flex items-center justify-center space-x-4 text-xs text-neutral-400">
          <button @click="toggleDemoInfo" class="hover:text-neutral-600 transition-colors">
            {{ showDemoInfo ? 'Sembunyikan' : 'Info Demo' }}
          </button>
          <span>•</span>
          <a href="#" class="hover:text-neutral-600 transition-colors">Bantuan</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Package, 
  Shield,
  Info,
  Loader2, 
  AlertCircle,
  CheckCircle,
  Mail
} from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'

// Router
const router = useRouter()

// Composables
const { loginWithGoogle, isAuthenticated, isLoading, error, clearError, isAdmin } = useAuth()

// State
const showDemoInfo = ref(false)

// Methods
const handleGoogleLogin = async () => {
  clearError()
  
  try {
    const result = await loginWithGoogle()
    
    if (result?.success) {
      // Login berhasil, redirect akan ditangani oleh composable
      console.log('Google login successful')
    }
  } catch (err) {
    console.error('Google login error:', err)
  }
}

const toggleDemoInfo = () => {
  showDemoInfo.value = !showDemoInfo.value
}

// Watch for authentication changes
watch([isAuthenticated, isAdmin], ([auth, admin]) => {
  if (auth && admin) {
    // User is authenticated and is admin, redirect to dashboard
    router.push('/')
  }
})

// Lifecycle
onMounted(() => {
  // Clear any previous errors
  clearError()
  
  // Redirect if already authenticated and admin
  if (isAuthenticated.value && isAdmin.value) {
    router.push('/')
  }
})
</script>