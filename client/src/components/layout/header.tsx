import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, User, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

type HeaderProps = {
  portalMode: "candidate" | "recruiter";
  onPortalToggle: (mode: "candidate" | "recruiter") => void;
};

export function Header({ portalMode, onPortalToggle }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/auth");
  };

  const togglePortal = (newMode: "candidate" | "recruiter") => {
    if (portalMode !== newMode) {
      onPortalToggle(newMode);
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-primary-600 text-2xl font-bold">SELEMENTRY</span>
            </div>
          </div>
          <div className="flex items-center">
            {/* Portal Toggle - Desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button 
                className={cn(
                  "border-b-2 py-4 px-1 text-sm font-medium",
                  portalMode === "candidate" 
                    ? "border-primary-600 text-primary-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
                onClick={() => togglePortal("candidate")}
              >
                Candidate Portal
              </button>
              <button 
                className={cn(
                  "border-b-2 py-4 px-1 text-sm font-medium",
                  portalMode === "recruiter" 
                    ? "border-primary-600 text-primary-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
                onClick={() => togglePortal("recruiter")}
              >
                Recruiter Portal
              </button>
            </div>

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-4 sm:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:max-w-none">
                <Sidebar mode={portalMode} />
              </SheetContent>
            </Sheet>

            {/* User Account Menu */}
            <div className="ml-4 flex items-center md:ml-6">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
                <span className="sr-only">View notifications</span>
              </Button>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-3 relative">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Open user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <div className="mt-1 text-xs font-medium text-primary-600 capitalize">{user?.role}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate(portalMode === "candidate" ? "/candidate/profile" : "/recruiter/profile")}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
