import { ref } from "vue";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  createdAt: Date;
}

const notifications = ref<Notification[]>([]);
let notificationId = 0;

export const useNotification = () => {
  // Add notification
  const addNotification = (
    type: NotificationType,
    title: string,
    message?: string,
    options?: {
      duration?: number;
      persistent?: boolean;
      action?: {
        label: string;
        handler: () => void;
      };
    }
  ): string => {
    const id = `notification-${++notificationId}`;
    const duration = options?.persistent
      ? 0
      : options?.duration ?? getDefaultDuration(type);

    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      persistent: options?.persistent || false,
      action: options?.action,
      createdAt: new Date(),
    };

    notifications.value.push(notification);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  // Remove notification
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  // Clear all notifications
  const clearAll = () => {
    notifications.value = [];
  };

  // Specific notification methods
  const success = (
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: { label: string; handler: () => void };
    }
  ) => {
    return addNotification("success", title, message, options);
  };

  const error = (
    title: string,
    message?: string,
    options?: {
      duration?: number;
      persistent?: boolean;
      action?: { label: string; handler: () => void };
    }
  ) => {
    return addNotification("error", title, message, {
      persistent: true,
      ...options,
    });
  };

  const warning = (
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: { label: string; handler: () => void };
    }
  ) => {
    return addNotification("warning", title, message, options);
  };

  const info = (
    title: string,
    message?: string,
    options?: {
      duration?: number;
      action?: { label: string; handler: () => void };
    }
  ) => {
    return addNotification("info", title, message, options);
  };

  // Auth specific notifications
  const authSuccess = (message: string = "Login berhasil") => {
    return success("Selamat datang!", message, { duration: 3000 });
  };

  const authError = (message: string) => {
    return error("Login gagal", message, {
      persistent: true,
      action: {
        label: "Coba lagi",
        handler: () => window.location.reload(),
      },
    });
  };

  const roleError = (currentRole: string) => {
    return error(
      "Akses ditolak",
      `Role Anda (${currentRole}) tidak memiliki akses ke halaman admin.`,
      {
        persistent: true,
        action: {
          label: "Logout",
          handler: () => {
            // This will be handled by the component using this notification
          },
        },
      }
    );
  };

  const updateSuccess = (entity: string = "Data") => {
    return success(`${entity} berhasil diperbarui`, undefined, {
      duration: 2000,
    });
  };

  const updateError = (entity: string = "Data", errorMessage?: string) => {
    return error(`Gagal memperbarui ${entity.toLowerCase()}`, errorMessage, {
      duration: 5000,
    });
  };

  const deleteSuccess = (entity: string = "Data") => {
    return success(`${entity} berhasil dihapus`, undefined, { duration: 2000 });
  };

  const deleteError = (entity: string = "Data", errorMessage?: string) => {
    return error(`Gagal menghapus ${entity.toLowerCase()}`, errorMessage, {
      duration: 5000,
    });
  };

  const networkError = () => {
    return error(
      "Koneksi bermasalah",
      "Periksa koneksi internet Anda dan coba lagi.",
      {
        action: {
          label: "Refresh",
          handler: () => window.location.reload(),
        },
      }
    );
  };

  const maintenanceMode = () => {
    return warning(
      "Sistem dalam maintenance",
      "Beberapa fitur mungkin tidak tersedia sementara waktu."
    );
  };

  // Helper functions
  const getDefaultDuration = (type: NotificationType): number => {
    switch (type) {
      case "success":
        return 3000;
      case "info":
        return 4000;
      case "warning":
        return 5000;
      case "error":
        return 0; // Persistent by default
      default:
        return 4000;
    }
  };

  const getNotificationCount = (type?: NotificationType) => {
    if (!type) return notifications.value.length;
    return notifications.value.filter((n) => n.type === type).length;
  };

  const hasNotifications = (type?: NotificationType) => {
    return getNotificationCount(type) > 0;
  };

  return {
    // State
    notifications: notifications.value,

    // Basic methods
    addNotification,
    removeNotification,
    clearAll,

    // Type-specific methods
    success,
    error,
    warning,
    info,

    // Domain-specific methods
    authSuccess,
    authError,
    roleError,
    updateSuccess,
    updateError,
    deleteSuccess,
    deleteError,
    networkError,
    maintenanceMode,

    // Utility methods
    getNotificationCount,
    hasNotifications,
  };
};
