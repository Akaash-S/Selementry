import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  BarChart2, 
  Briefcase, 
  Calendar, 
  HelpCircle, 
  Home, 
  LogOut, 
  MessageSquare, 
  Search, 
  Settings, 
  User, 
  Users,
  Building,
} from "lucide-react";

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

type SidebarProps = {
  mode: "candidate" | "recruiter";
};

export function Sidebar({ mode }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const candidateMainItems: SidebarItem[] = [
    {
      title: "Overview",
      icon: <Home className="h-5 w-5" />,
      path: "/candidate/dashboard",
    },
    {
      title: "My Applications",
      icon: <Briefcase className="h-5 w-5" />,
      path: "/candidate/applications",
    },
    {
      title: "Browse Jobs",
      icon: <Search className="h-5 w-5" />,
      path: "/candidate/browse-jobs",
    },
    {
      title: "My Profile",
      icon: <User className="h-5 w-5" />,
      path: "/candidate/profile",
    },
    {
      title: "AI Insights",
      icon: <BarChart2 className="h-5 w-5" />,
      path: "/candidate/insights",
    },
    {
      title: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/candidate/messages",
    },
  ];

  const recruiterMainItems: SidebarItem[] = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      path: "/recruiter/dashboard",
    },
    {
      title: "Job Postings",
      icon: <Briefcase className="h-5 w-5" />,
      path: "/recruiter/job-postings",
    },
    {
      title: "Candidates",
      icon: <Users className="h-5 w-5" />,
      path: "/recruiter/candidates",
    },
    {
      title: "Interviews",
      icon: <Calendar className="h-5 w-5" />,
      path: "/recruiter/interviews",
    },
    {
      title: "Analytics",
      icon: <BarChart2 className="h-5 w-5" />,
      path: "/recruiter/analytics",
    },
    {
      title: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/recruiter/messages",
    },
  ];

  const candidateAccountItems: SidebarItem[] = [
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/candidate/settings",
    },
    {
      title: "Help & Support",
      icon: <HelpCircle className="h-5 w-5" />,
      path: "/candidate/help",
    },
  ];

  const recruiterAccountItems: SidebarItem[] = [
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/recruiter/settings",
    },
    {
      title: "Company Profile",
      icon: <Building className="h-5 w-5" />,
      path: "/recruiter/company",
    },
    {
      title: "Help & Support",
      icon: <HelpCircle className="h-5 w-5" />,
      path: "/recruiter/help",
    },
  ];

  const mainItems = mode === "candidate" ? candidateMainItems : recruiterMainItems;
  const accountItems = mode === "candidate" ? candidateAccountItems : recruiterAccountItems;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="h-full bg-white border-r w-64 flex-shrink-0 overflow-y-auto">
      <div className="px-6 pt-6 pb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {mode === "candidate" ? "Candidate Dashboard" : "Recruiter Tools"}
        </h2>
        <div className="mt-5 flex flex-col space-y-3">
          {mainItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                location === item.path
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className={cn(
                "mr-3 flex-shrink-0", 
                location === item.path ? "text-primary-500" : "text-gray-400"
              )}>
                {item.icon}
              </span>
              {item.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="px-6 pt-4 pb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Account</h2>
        <div className="mt-5 flex flex-col space-y-3">
          {accountItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                location === item.path
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className={cn(
                "mr-3 flex-shrink-0", 
                location === item.path ? "text-primary-500" : "text-gray-400"
              )}>
                {item.icon}
              </span>
              {item.title}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full text-left"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
