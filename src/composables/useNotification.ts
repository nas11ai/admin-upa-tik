// composables/useNotifications.ts
import { ref, onMounted, onUnmounted } from "vue";
import { firestoreService } from "@/services/firestore";

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

export function useNotifications() {
  const notifications = ref<NotificationData[]>([]);
  const unreadCount = ref(0);
  const isPermissionGranted = ref(false);
  const fcmToken = ref<string | null>(null);

  let unsubscribeNotifications: (() => void) | null = null;

  // Initialize notifications
  const initializeNotifications = async () => {
    try {
      // Request permission and get FCM token
      const token = await firestoreService.requestNotificationPermission();
      if (token) {
        fcmToken.value = token;
        isPermissionGranted.value = true;
        console.log("FCM token obtained:", token);

        // Here you would typically send the token to your backend
        // to associate it with the current user
        await saveTokenToDatabase(token);
      }

      // Subscribe to notification updates
      unsubscribeNotifications = firestoreService.subscribeToNotifications(
        (notification) => {
          // Add new notification to the beginning of the array
          notifications.value.unshift(notification);

          // Update unread count
          updateUnreadCount();

          // Show toast notification if you have a toast system
          showToastNotification(notification);
        }
      );

      // Load existing notifications
      await loadNotifications();
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  };

  // Save FCM token to database (you might want to associate with user)
  const saveTokenToDatabase = async (token: string) => {
    try {
      // You can save the token to a user document or a separate tokens collection
      // This is a placeholder - implement according to your user management system
      console.log("Saving token to database:", token);

      // Example:
      // const userDoc = doc(db, 'users', currentUser.uid)
      // await updateDoc(userDoc, { fcmToken: token })
    } catch (error) {
      console.error("Error saving token:", error);
    }
  };

  // Load existing notifications
  const loadNotifications = async () => {
    try {
      const loadedNotifications = await firestoreService.getNotifications();
      notifications.value = loadedNotifications;
      updateUnreadCount();
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // Update unread count
  const updateUnreadCount = () => {
    unreadCount.value = notifications.value.filter((n) => !n.read).length;
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await firestoreService.markNotificationAsRead(notificationId);

      // Update local state
      const notification = notifications.value.find(
        (n) => n.id === notificationId
      );
      if (notification) {
        notification.read = true;
        updateUnreadCount();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.value.filter(
        (n) => !n.read && n.id
      );

      await Promise.all(
        unreadNotifications.map((n) =>
          firestoreService.markNotificationAsRead(n.id!)
        )
      );

      // Update local state
      notifications.value.forEach((n) => (n.read = true));
      updateUnreadCount();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Show toast notification (implement your toast system here)
  const showToastNotification = (notification: NotificationData) => {
    // Example using a toast library or custom toast component
    console.log("New notification:", notification);

    // You can dispatch a custom event or use a toast library
    // Example with a custom event:
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: {
          title: notification.title,
          message: notification.body,
          type: notification.type === "status_update" ? "info" : "success",
        },
      })
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    notifications.value = [];
    unreadCount.value = 0;
  };

  // Get notifications by type
  const getNotificationsByType = (type: "status_update" | "new_entry") => {
    return notifications.value.filter((n) => n.type === type);
  };

  // Get notifications by collection
  const getNotificationsByCollection = (collectionName: string) => {
    return notifications.value.filter(
      (n) => n.collectionName === collectionName
    );
  };

  // Format notification time
  const formatNotificationTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return timestamp.toLocaleDateString("id-ID");
  };

  // Setup real-time listeners for all collections
  const setupCollectionListeners = () => {
    const collections = [
      "form_peminjaman",
      "form_pengaduan",
      "form_pemeliharaan",
      "form_pembuatan",
      "form_pemasangan",
      "form_lapor_kerusakan",
      "form_bantuan",
    ];

    collections.forEach((collectionName) => {
      firestoreService.subscribeToCollection(
        collectionName,
        (data) => {
          // Data is already handled by the service,
          // notifications will be triggered automatically
          console.log(`${collectionName} updated:`, data.length, "items");
        },
        true // Enable notifications
      );
    });
  };

  // Lifecycle hooks
  onMounted(() => {
    initializeNotifications();
    setupCollectionListeners();
  });

  onUnmounted(() => {
    if (unsubscribeNotifications) {
      unsubscribeNotifications();
    }
  });

  return {
    // State
    notifications,
    unreadCount,
    isPermissionGranted,
    fcmToken,

    // Actions
    initializeNotifications,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,

    // Getters
    getNotificationsByType,
    getNotificationsByCollection,
    formatNotificationTime,
  };
}
