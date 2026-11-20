// Firebase configuration for SigTrak (fieldcom-8159b project)
// These are the public Firebase SDK config values embedded in the SigTrak
// client bundle — safe to include in client-side code per Firebase's design.
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDkH3rGQ0UoH2a_fNFO7HaP2oOpazyH7rU',
  authDomain: 'fieldcom-8159b.firebaseapp.com',
  projectId: 'fieldcom-8159b',
  storageBucket: 'fieldcom-8159b.appspot.com',
  messagingSenderId: '548978360911',
  appId: '1:548978360911:web:0e05e3d0220d623edc203a',
}

// Singleton — avoids duplicate-app errors during HMR
let app: FirebaseApp
let db: Firestore

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

db = getFirestore(app)

export { app, db }
