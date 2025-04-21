// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc } from "firebase/firestore";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// Analytics is only used in client components
const db = getFirestore(app);
const auth = getAuth(app);

// Database collections
export const museumsCollection = collection(db, "museums");
export const usersCollection = collection(db, "users");

// User roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Authentication functions
export const registerUser = async (email: string, password: string, role = ROLES.USER) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(usersCollection, userCredential.user.uid), {
      email,
      role,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, error };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false, error };
  }
};

export const getUserRole = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(usersCollection, userId));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

// Check if current user is admin
export const isAdmin = async (user: User | null) => {
  if (!user) return false;
  const role = await getUserRole(user.uid);
  return role === ROLES.ADMIN;
};

// Utility functions for database operations
export const addMuseumData = async (museumData: Record<string, unknown>) => {
  try {
    await setDoc(doc(museumsCollection, museumData.id as string), museumData);
    return { success: true };
  } catch (error) {
    console.error("Error adding museum data:", error);
    return { success: false, error };
  }
};

export const getAllMuseums = async () => {
  try {
    const querySnapshot = await getDocs(museumsCollection);
    const museums: Record<string, unknown>[] = [];
    querySnapshot.forEach((doc) => {
      museums.push(doc.data() as Record<string, unknown>);
    });
    return museums;
  } catch (error) {
    console.error("Error getting museums:", error);
    return [];
  }
};

export const getMuseumById = async (id: string) => {
  try {
    const docRef = doc(museumsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting museum:", error);
    return null;
  }
};

export { db, auth }; 