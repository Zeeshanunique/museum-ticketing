/**
 * This script creates an admin user in Firebase.
 * Run this script once to create your admin account.
 * 
 * To run this script:
 * 1. Replace the email and password with your desired admin credentials
 * 2. Run with: npx ts-node src/scripts/create-admin.ts
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLw7zHzcz5XhNbrmXle7j3GvqAeRi0ifs",
  authDomain: "museum-f0caf.firebaseapp.com",
  projectId: "museum-f0caf",
  storageBucket: "museum-f0caf.firebasestorage.app",
  messagingSenderId: "486287173947",
  appId: "1:486287173947:web:f6425f411ada27974aef1e",
  measurementId: "G-TGZ3TC0RSL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);
const db = getFirestore(app);
const usersCollection = collection(db, "users");

// Admin credentials - CHANGE THESE!
const adminEmail = "admin@example.com";
const adminPassword = "admin123456"; // Use a strong password in production

async function createAdminUser() {
  try {
    console.log(`Creating admin user with email: ${adminEmail}`);
    
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, adminEmail, adminPassword);
    console.log('User account created successfully');
    
    // Set admin role in Firestore
    await setDoc(doc(usersCollection, userCredential.user.uid), {
      email: adminEmail,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    
    console.log('Admin role assigned successfully');
    console.log(`Admin user created with email: ${adminEmail}`);
    console.log('You can now log in with these credentials');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser(); 