// Firebase Configuration
// Replace these values with your Firebase project config
// Get this from: Firebase Console > Project Settings > Your apps > SDK setup and configuration

const firebaseConfig = {
  apiKey: "AIzaSyD5hUXQWbfI_g7HlAOoXckU_8lTTYQ5ZhY",
  authDomain: "golden-triangle-da065.firebaseapp.com",
  databaseURL: "https://golden-triangle-da065-default-rtdb.firebaseio.com",
  projectId: "golden-triangle-da065",
  storageBucket: "golden-triangle-da065.firebasestorage.app",
  messagingSenderId: "986118922942",
  appId: "1:986118922942:web:e50d5a36ec17860a5274ef"
};


// Initialize Firebase (will be used by index.html)
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.database();
}
