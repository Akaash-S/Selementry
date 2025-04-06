import { PortalContainer } from "@/components/layout/portal-container";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Briefcase, Edit, Eye, MoreHorizontal, Plus, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function RecruiterJobPostings() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [jobToToggle, setJobToToggle] = useState<any>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Fetch job postings
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["/api/recruiter/jobs"],
  });

  // Fetch analytics for application counts
  const { data: analytics } = useQuery({
    queryKey: ["/api/recruiter/analytics"],
  });

  // Toggle job active status mutation
  const toggleJobStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/jobs/${id}`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recruiter/jobs"] });
      toast({
        title: "Job status updated",
        description: `The job has been ${jobToToggle?.isActive ? "deactivated" : "activated"}.`,
      });
      setIsConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update job status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleJobStatus = (job: any) => {
    setJobToToggle(job);
    setIsConfirmDialogOpen(true);
  };

  const confirmToggleStatus = () => {
    if (jobToToggle) {
      toggleJobStatusMutation.mutate({
        id: jobToToggle.id,
        isActive: !jobToToggle.isActive
      });
    }
  };

  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Job Postings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your job listings and view applications</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/recruiter/job-postings/new">
            <Button className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Job Postings List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {jobs.map((job: any) => {
              const applicationsCount = analytics?.jobsWithApplications?.find(j => j.id === job.id)?.applications || 0;
              
              return (
                <li key={job.id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium text-gray-900 truncate">{job.title}</h3>
                            <Badge 
                              className={job.isActive 
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {job.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="truncate">{job.department} • {job.jobType}</span>
                            <span className="mx-2">•</span>
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex-shrink-0 flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{applicationsCount}</div>
                          <div className="text-xs text-gray-500">Applications</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: false }) : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">Age</div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/recruiter/job-postings/${job.id}/candidates`)}>
                              <Users className="mr-2 h-4 w-4" />
                              View Candidates
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/recruiter/job-postings/${job.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Job
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/recruiter/job-postings/${job.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleJobStatus(job)}>
                              <Briefcase className="mr-2 h-4 w-4" />
                              {job.isActive ? "Deactivate Job" : "Activate Job"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No job postings yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create your first job posting to start receiving applications
              </p>
              <div className="mt-6">
                <Link href="/recruiter/job-postings/new">
                  <Button>Post a Job</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {jobToToggle?.isActive ? "Deactivate Job Posting?" : "Activate Job Posting?"}
            </DialogTitle>
            <DialogDescription>
              {jobToToggle?.isActive 
                ? "This job will no longer be visible to candidates. You can reactivate it at any time."
                : "This job will be made visible to candidates and they will be able to apply."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmToggleStatus}
              disabled={toggleJobStatusMutation.isPending}
              variant={jobToToggle?.isActive ? "destructive" : "default"}
            >
              {toggleJobStatusMutation.isPending 
                ? "Processing..." 
                : jobToToggle?.isActive 
                  ? "Deactivate" 
                  : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalContainer>
  );
}
