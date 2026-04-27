importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// This config MUST match your firebase.ts config
// Since this is a static file in public/, we can't easily use Vite env vars here
// You should replace these placeholders with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD57s2gllyXC_SY4XlckYS93munF0dby_U",
  authDomain: "nexgro-4fde7.firebaseapp.com",
  projectId: "nexgro-4fde7",
  storageBucket: "nexgro-4fde7.firebasestorage.app",
  messagingSenderId: "766881040235",
  appId: "1:766881040235:web:a17cdb276862d6e092ee2e",
  measurementId: "G-S5QT62PKF1"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || "NeXgro Update";
  const notificationOptions = {
    body: payload.notification.body || "You have a new update.",
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
