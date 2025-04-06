import { useAuth } from "@/hooks/use-auth";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const { currentUser, loading: firebaseLoading } = useFirebaseAuth();
  const [, setLocation] = useLocation();

  // Log auth state changes for debugging
  useEffect(() => {
    if (!isLoading && !firebaseLoading) {
      console.log("Protected route auth state:", { 
        path,
        backendAuth: !!user, 
        firebaseAuth: !!currentUser,
        backendRole: user?.role || 'none',
        firebaseEmail: currentUser?.email || 'none'
      });
    }
  }, [path, user, currentUser, isLoading, firebaseLoading]);

  // Show loading state if either auth system is still loading
  if (isLoading || firebaseLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Check authentication from either system
  // This allows users to authenticate with either the backend session or Firebase
  if (!user && !currentUser) {
    console.log("No authentication found, redirecting to auth page");
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If we only have Firebase authentication but no backend user yet,
  // we should still allow access but might want to sync with backend later
  if (currentUser && !user) {
    console.log("User authenticated with Firebase but not with backend:", currentUser.email);
    // For now, we'll redirect to auth to complete registration
    // In a future version, we could implement automatic backend registration
    if (path !== "/auth") {
      return (
        <Route path={path}>
          <Redirect to="/auth" />
        </Route>
      );
    }
  }

  // If we have a backend user, handle role-based routing
  if (user) {
    // Redirect based on user role if trying to access the wrong portal
    if (path.startsWith("/candidate") && user.role !== "candidate") {
      console.log("User with recruiter role trying to access candidate area, redirecting");
      return (
        <Route path={path}>
          <Redirect to="/recruiter/dashboard" />
        </Route>
      );
    }

    if (path.startsWith("/recruiter") && user.role !== "recruiter") {
      console.log("User with candidate role trying to access recruiter area, redirecting");
      return (
        <Route path={path}>
          <Redirect to="/candidate/dashboard" />
        </Route>
      );
    }

    // If at root path, redirect to appropriate dashboard based on role
    if (path === "/" && user.role === "candidate") {
      console.log("Candidate at root path, redirecting to candidate dashboard");
      return (
        <Route path={path}>
          <Redirect to="/candidate/dashboard" />
        </Route>
      );
    }

    if (path === "/" && user.role === "recruiter") {
      console.log("Recruiter at root path, redirecting to recruiter dashboard");
      return (
        <Route path={path}>
          <Redirect to="/recruiter/dashboard" />
        </Route>
      );
    }
  } else if (currentUser && path === "/") {
    // If we only have Firebase auth but no role info, send to auth page to complete registration
    console.log("Firebase authenticated user with no role, redirecting to complete registration");
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If all checks pass, render the protected component
  return <Route path={path} component={Component} />;
}
