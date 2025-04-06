import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useLocation } from "wouter";

type PortalContainerProps = {
  children: React.ReactNode;
};

export function PortalContainer({ children }: PortalContainerProps) {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [portalMode, setPortalMode] = useState<"candidate" | "recruiter">("candidate");

  // Set initial portal mode based on user role and current path
  useEffect(() => {
    if (user) {
      if (location.startsWith("/recruiter")) {
        setPortalMode("recruiter");
      } else if (location.startsWith("/candidate")) {
        setPortalMode("candidate");
      } else {
        // Default based on user role
        setPortalMode(user.role as "candidate" | "recruiter");
      }
    }
  }, [user, location]);

  // Handle portal mode toggle
  const handlePortalToggle = (mode: "candidate" | "recruiter") => {
    setPortalMode(mode);
    
    // Navigate to the corresponding dashboard
    if (mode === "candidate") {
      navigate("/candidate/dashboard");
    } else {
      navigate("/recruiter/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header portalMode={portalMode} onPortalToggle={handlePortalToggle} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop only */}
        <div className="hidden md:block">
          <Sidebar mode={portalMode} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
