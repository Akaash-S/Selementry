import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || "Failed to sign in" };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || "Failed to sign up" };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Configure Google provider with additional scopes and settings if needed
    googleProvider.setCustomParameters({
      prompt: 'select_account', // Force account selection even if one account is available
    });
    
    // Choose between popup and redirect methods
    // Redirect method is more reliable across browsers and mobile devices
    // Change to true to use redirect method instead of popup
    const useRedirect = true; // Using redirect method for better reliability

    if (useRedirect) {
      console.log("Starting Google Sign-In with redirect...");
      await signInWithRedirect(auth, googleProvider);
      // The result will be handled when the page reloads through getRedirectResult
      return { 
        user: null, 
        token: null,
        error: null,
        redirectStarted: true 
      };
    } else {
      console.log("Starting Google Sign-In with popup...");
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get credential from the result
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      console.log("Google Sign-In successful, user email:", result.user.email);
      
      return { 
        user: result.user, 
        token,
        error: null 
      };
    }
  } catch (error: any) {
    console.error("Google Sign-In error:", error);
    
    // Parse Firebase error codes into user-friendly messages
    let errorMessage = "Failed to sign in with Google";
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Sign-in popup was closed before authentication was complete";
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = "Sign-in popup was blocked by the browser. Please allow popups for this site";
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = "Multiple popup requests were triggered. Please try again";
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = "This domain is not authorized for Firebase Authentication. Please add it to the Firebase console under Authentication > Sign-in methods > Authorized domains.";
    } else if (error.code) {
      errorMessage = `Authentication error (${error.code}): ${error.message}`;
    }
    
    return { 
      user: null, 
      token: null,
      error: errorMessage 
    };
  }
};

// Handle redirect result (call this on initial page load)
export const handleRedirectResult = async () => {
  try {
    console.log("Checking for Google Sign-In redirect result...");
    const result = await getRedirectResult(auth);
    if (result) {
      // This means we have a successful sign-in from a redirect
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      console.log("Google Sign-In redirect result successful, user:", result.user.email);
      
      return {
        user: result.user,
        token,
        error: null
      };
    }
    return { user: null, token: null, error: null };
  } catch (error: any) {
    console.error("Error handling Google Sign-In redirect:", error);
    let errorMessage = "Failed to complete Google sign-in";
    
    if (error.code) {
      errorMessage = `Authentication error (${error.code}): ${error.message}`;
    }
    
    return { 
      user: null, 
      token: null, 
      error: errorMessage 
    };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message || "Failed to sign out" };
  }
};

// Auth state listener
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };