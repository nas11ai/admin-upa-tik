<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <TransitionGroup name="notification" tag="div" class="space-y-2">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="relative overflow-hidden rounded-lg shadow-lg border animate-slide-in"
          :class="getNotificationClasses(notification.type)"
        >
          <!-- Progress bar for auto-dismiss -->
          <div
            v-if="notification.duration && notification.duration > 0"
            class="absolute top-0 left-0 h-1 bg-current opacity-50 transition-all ease-linear"
            :class="{ 'animate-countdown': !notification.persistent }"
            :style="{
              animationDuration: `${notification.duration}ms`,
              animationFillMode: 'forwards',
            }"
          ></div>

          <div class="p-4">
            <div class="flex items-start">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <component
                  :is="getNotificationIcon(notification.type)"
                  class="h-5 w-5"
                  :class="getIconClasses(notification.type)"
                />
              </div>

              <!-- Content -->
              <div class="ml-3 flex-1">
                <p
                  class="text-sm font-medium"
                  :class="getTitleClasses(notification.type)"
                >
                  {{ notification.title }}
                </p>
                <p
                  v-if="notification.message"
                  class="mt-1 text-sm"
                  :class="getMessageClasses(notification.type)"
                >
                  {{ notification.message }}
                </p>

                <!-- Action button -->
                <div v-if="notification.action" class="mt-3">
                  <button
                    @click="handleActionClick(notification)"
                    class="text-sm font-medium underline hover:no-underline transition-all"
                    :class="getActionClasses(notification.type)"
                  >
                    {{ notification.action.label }}
                  </button>
                </div>
              </div>

              <!-- Close button -->
              <div class="ml-4 flex-shrink-0">
                <button
                  @click="removeNotification(notification.id)"
                  class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                  :class="getCloseButtonClasses(notification.type)"
                >
                  <span class="sr-only">Close</span>
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-vue-next";
import {
  useNotification,
  type NotificationType,
  type Notification,
} from "../../composables/useNotification";

// Composables
const { notifications, removeNotification } = useNotification();

// Methods
const getNotificationIcon = (type: NotificationType) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };
  return icons[type] || Info;
};

const getNotificationClasses = (type: NotificationType) => {
  const classes = {
    success: "bg-success-50 border-success-200",
    error: "bg-error-50 border-error-200",
    warning: "bg-warning-50 border-warning-200",
    info: "bg-blue-50 border-blue-200",
  };
  return classes[type] || classes.info;
};

const getIconClasses = (type: NotificationType) => {
  const classes = {
    success: "text-success-500",
    error: "text-error-500",
    warning: "text-warning-500",
    info: "text-blue-500",
  };
  return classes[type] || classes.info;
};

const getTitleClasses = (type: NotificationType) => {
  const classes = {
    success: "text-success-900",
    error: "text-error-900",
    warning: "text-warning-900",
    info: "text-blue-900",
  };
  return classes[type] || classes.info;
};

const getMessageClasses = (type: NotificationType) => {
  const classes = {
    success: "text-success-700",
    error: "text-error-700",
    warning: "text-warning-700",
    info: "text-blue-700",
  };
  return classes[type] || classes.info;
};

const getActionClasses = (type: NotificationType) => {
  const classes = {
    success: "text-success-800 hover:text-success-900",
    error: "text-error-800 hover:text-error-900",
    warning: "text-warning-800 hover:text-warning-900",
    info: "text-blue-800 hover:text-blue-900",
  };
  return classes[type] || classes.info;
};

const getCloseButtonClasses = (type: NotificationType) => {
  const classes = {
    success: "text-success-400 hover:text-success-500 focus:ring-success-500",
    error: "text-error-400 hover:text-error-500 focus:ring-error-500",
    warning: "text-warning-400 hover:text-warning-500 focus:ring-warning-500",
    info: "text-blue-400 hover:text-blue-500 focus:ring-blue-500",
  };
  return classes[type] || classes.info;
};

const handleActionClick = (notification: Notification) => {
  if (notification.action?.handler) {
    notification.action.handler();
  }
  // Remove notification after action is clicked
  removeNotification(notification.id);
};
</script>

<style scoped>
/* Notification animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Progress bar countdown animation */
@keyframes countdown {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-countdown {
  animation: countdown linear forwards;
}

/* Slide in animation */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
