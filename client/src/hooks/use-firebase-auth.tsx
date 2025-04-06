import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthChange } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

// Define the Firebase Auth Context type
interface FirebaseAuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
}

// Create the context with default values
const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  currentUser: null,
  loading: true,
});

// Provide a named export for the Provider Component
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    console.log("Setting up Firebase auth listener");
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setLoading(false);
      
      if (user) {
        // For debugging purposes, log the user information
        console.log("Firebase auth state changed - user signed in:", user.email);
      } else {
        console.log("Firebase auth state changed - user signed out or no user");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up Firebase auth listener");
      unsubscribe();
    };
  }, []);

  // Create the context value object
  const value: FirebaseAuthContextType = {
    currentUser,
    loading,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

// Provide a named export for the hook that uses the context
export function useFirebaseAuth(): FirebaseAuthContextType {
  const context = useContext(FirebaseAuthContext);
  
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  
  return context;
}