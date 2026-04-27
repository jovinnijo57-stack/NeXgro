import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "sonner";

// These should be set in your Render environment variables or .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const VAPID_KEY = "BLqJ64j-97wuzqkl5mtZn3H3vwfpaeIDon4z8ER_w8A4WM0JZHgpl4hbmPNkVRJeF2OFEg2rLx6P9N-SZqrEjAc";

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });
      if (currentToken) {
        console.log('--- FCM REGISTRATION TOKEN ---');
        console.log(currentToken);
        console.log('------------------------------');
        
        // Save to localStorage for debugging/finding easily
        localStorage.setItem("fcm_token", currentToken);
        
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Notification permission denied');
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground Message received: ", payload);
      resolve(payload);
    });
  });
