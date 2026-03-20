import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAzxMTCVsE7_khk3ZbKEZG1Dsf7qZujB-w",
  authDomain: "broadcast-send-flow.firebaseapp.com",
  projectId: "broadcast-send-flow",
  storageBucket: "broadcast-send-flow.firebasestorage.app",
  messagingSenderId: "165707011504",
  appId: "1:165707011504:web:547ee549edb44a60ca3275"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)