import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import CandidateDashboard from "@/pages/candidate/dashboard";
import CandidateApplications from "@/pages/candidate/applications";
import CandidateBrowseJobs from "@/pages/candidate/browse-jobs";
import CandidateProfile from "@/pages/candidate/profile";
import CandidateInsights from "@/pages/candidate/insights";
import CandidateMessages from "@/pages/candidate/messages";
import CandidateSettings from "@/pages/candidate/settings";
import CandidateHelp from "@/pages/candidate/help";
import RecruiterDashboard from "@/pages/recruiter/dashboard";
import RecruiterJobPostings from "@/pages/recruiter/job-postings";
import RecruiterCandidates from "@/pages/recruiter/candidates";
import RecruiterAnalytics from "@/pages/recruiter/analytics";
import RecruiterInterviews from "@/pages/recruiter/interviews";
import RecruiterMessages from "@/pages/recruiter/messages";
import RecruiterSettings from "@/pages/recruiter/settings";
import RecruiterCompanyProfile from "@/pages/recruiter/company-profile";
import RecruiterHelp from "@/pages/recruiter/help";
import NewJobPosting from "@/pages/recruiter/new-job-posting";
import EditJobPosting from "@/pages/recruiter/edit-job-posting";
import { AuthProvider } from "@/hooks/use-auth";
import { FirebaseAuthProvider } from "@/hooks/use-firebase-auth";
import { handleRedirectResult } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      
      {/* Candidate Routes */}
      <ProtectedRoute path="/candidate/dashboard" component={CandidateDashboard} />
      <ProtectedRoute path="/candidate/applications" component={CandidateApplications} />
      <ProtectedRoute path="/candidate/browse-jobs" component={CandidateBrowseJobs} />
      <ProtectedRoute path="/candidate/profile" component={CandidateProfile} />
      <ProtectedRoute path="/candidate/insights" component={CandidateInsights} />
      <ProtectedRoute path="/candidate/messages" component={CandidateMessages} />
      <ProtectedRoute path="/candidate/settings" component={CandidateSettings} />
      <ProtectedRoute path="/candidate/help" component={CandidateHelp} />
      
      {/* Recruiter Routes */}
      <ProtectedRoute path="/recruiter/dashboard" component={RecruiterDashboard} />
      <ProtectedRoute path="/recruiter/job-postings" component={RecruiterJobPostings} />
      <ProtectedRoute path="/recruiter/job-postings/new" component={NewJobPosting} />
      <ProtectedRoute path="/recruiter/job-postings/:id/edit" component={EditJobPosting} />
      <ProtectedRoute path="/recruiter/candidates" component={RecruiterCandidates} />
      <ProtectedRoute path="/recruiter/analytics" component={RecruiterAnalytics} />
      <ProtectedRoute path="/recruiter/interviews" component={RecruiterInterviews} />
      <ProtectedRoute path="/recruiter/messages" component={RecruiterMessages} />
      <ProtectedRoute path="/recruiter/settings" component={RecruiterSettings} />
      <ProtectedRoute path="/recruiter/company-profile" component={RecruiterCompanyProfile} />
      <ProtectedRoute path="/recruiter/help" component={RecruiterHelp} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function FirebaseRedirectHandler() {
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's a pending redirect result on component mount
    async function checkRedirectResult() {
      try {
        const result = await handleRedirectResult();
        if (result.user) {
          toast({
            title: "Sign-in successful",
            description: `Signed in with Google as ${result.user.email}`,
          });
        } else if (result.error) {
          toast({
            title: "Sign-in failed",
            description: result.error,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
      } finally {
        setIsChecking(false);
      }
    }

    checkRedirectResult();
  }, [toast]);

  // We don't need to render anything
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
        <AuthProvider>
          <FirebaseRedirectHandler />
          <Router />
          <Toaster />
        </AuthProvider>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
