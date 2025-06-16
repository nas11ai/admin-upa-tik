// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDd8BbnVVCTlLIe_7OplhwOisUCjHkWLMg", // Replace with your actual config
  authDomain: "pelayananupa-tik.firebaseapp.com",
  projectId: "pelayananupa-tik",
  storageBucket: "pelayananupa-tik.firebasestorage.app",
  messagingSenderId: "991351593285",
  appId: "1:991351593285:web:b80ec0c7384af75b7a462c"
});

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/badge-icon.png',
    tag: payload.data?.documentId || 'general',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'Lihat',
        icon: '/icons/view.png'
      },
      {
        action: 'close',
        title: 'Tutup',
        icon: '/icons/close.png'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.');

  event.notification.close();

  if (event.action === 'view') {
    // Open the app and navigate to relevant page
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});