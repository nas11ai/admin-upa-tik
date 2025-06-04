<template>
  <div class="loading-container" :class="containerClasses">
    <!-- Full Page Loading -->
    <div
      v-if="variant === 'page'"
      class="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <div class="text-center">
        <!-- Animated Logo -->
        <div class="w-20 h-20 mx-auto mb-6 relative">
          <div class="w-20 h-20 border-4 border-primary-200 rounded-full"></div>
          <div
            class="w-20 h-20 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <Package class="h-8 w-8 text-primary-600 animate-pulse" />
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-neutral-700">
            {{ title || "Memuat Dashboard" }}
          </h3>
          <p class="text-sm text-neutral-500">
            {{ message || "Mohon tunggu sebentar..." }}
          </p>

          <!-- Progress bar -->
          <div v-if="showProgress" class="w-64 mx-auto">
            <div class="bg-neutral-200 rounded-full h-2">
              <div
                class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
            <p class="text-xs text-neutral-400 mt-1">{{ progress }}%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay Loading -->
    <div
      v-else-if="variant === 'overlay'"
      class="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center"
    >
      <div class="text-center p-6">
        <div class="w-12 h-12 mx-auto mb-4 relative">
          <div class="w-12 h-12 border-3 border-primary-200 rounded-full"></div>
          <div
            class="w-12 h-12 border-3 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"
          ></div>
        </div>
        <p class="text-sm font-medium text-neutral-700">
          {{ title || "Memproses..." }}
        </p>
        <p v-if="message" class="text-xs text-neutral-500 mt-1">
          {{ message }}
        </p>
      </div>
    </div>

    <!-- Inline Loading -->
    <div
      v-else-if="variant === 'inline'"
      class="flex items-center space-x-3 p-4"
    >
      <div class="w-6 h-6 relative">
        <div class="w-6 h-6 border-2 border-primary-200 rounded-full"></div>
        <div
          class="w-6 h-6 border-2 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"
        ></div>
      </div>
      <div>
        <p class="text-sm font-medium text-neutral-700">
          {{ title || "Memuat..." }}
        </p>
        <p v-if="message" class="text-xs text-neutral-500">{{ message }}</p>
      </div>
    </div>

    <!-- Button Loading -->
    <span v-else-if="variant === 'button'" class="flex items-center">
      <div
        class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"
      ></div>
      {{ title || "Memproses..." }}
    </span>

    <!-- Card Loading -->
    <div
      v-else-if="variant === 'card'"
      class="bg-white rounded-xl shadow-card border border-dashboard-border p-6"
    >
      <div class="animate-pulse">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-12 h-12 bg-neutral-200 rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div class="h-3 bg-neutral-200 rounded w-1/2"></div>
          </div>
        </div>
        <div class="space-y-3">
          <div class="h-3 bg-neutral-200 rounded"></div>
          <div class="h-3 bg-neutral-200 rounded w-5/6"></div>
          <div class="h-3 bg-neutral-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>

    <!-- Table Loading -->
    <div
      v-else-if="variant === 'table'"
      class="bg-white rounded-xl shadow-card border border-dashboard-border overflow-hidden"
    >
      <div class="px-6 py-4 border-b border-dashboard-border">
        <div class="animate-pulse">
          <div class="h-6 bg-neutral-200 rounded w-1/4"></div>
        </div>
      </div>
      <div class="divide-y divide-neutral-200">
        <div v-for="i in rows || 5" :key="i" class="px-6 py-4">
          <div class="animate-pulse flex space-x-4">
            <div class="w-10 h-10 bg-neutral-200 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-neutral-200 rounded w-1/2"></div>
              <div class="h-3 bg-neutral-200 rounded w-1/3"></div>
            </div>
            <div class="space-y-2">
              <div class="h-4 bg-neutral-200 rounded w-16"></div>
              <div class="h-3 bg-neutral-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Spinner Only -->
    <div v-else class="flex items-center justify-center p-4">
      <div class="w-8 h-8 relative">
        <div class="w-8 h-8 border-2 border-primary-200 rounded-full"></div>
        <div
          class="w-8 h-8 border-2 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Package } from "lucide-vue-next";

interface Props {
  variant?:
    | "page"
    | "overlay"
    | "inline"
    | "button"
    | "card"
    | "table"
    | "spinner";
  title?: string;
  message?: string;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  progress?: number;
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "spinner",
  size: "md",
  showProgress: false,
  progress: 0,
  rows: 5,
});

const containerClasses = computed(() => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return [
    sizeClasses[props.size],
    {
      relative: props.variant === "overlay",
    },
  ];
});
</script>

<style scoped>
.border-3 {
  border-width: 3px;
}

/* Enhanced loading animations */
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
