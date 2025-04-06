import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to the appropriate dashboard based on user role
    if (user) {
      if (user.role === "candidate") {
        setLocation("/candidate/dashboard");
      } else if (user.role === "recruiter") {
        setLocation("/recruiter/dashboard");
      }
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Redirecting...</h1>
        <p className="mt-2 text-gray-600">Taking you to your dashboard</p>
      </div>
    </div>
  );
}
