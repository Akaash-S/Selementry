import { PortalContainer } from "@/components/layout/portal-container";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronRight, 
  Download, 
  Filter, 
  Search,
  Users,
  ListFilter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { CandidateCard } from "@/components/candidate/candidate-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define application status display information
const statusInfo = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-800 border-blue-200" },
  under_review: { label: "Under Review", color: "bg-amber-100 text-amber-800 border-amber-200" },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Not Selected", color: "bg-red-100 text-red-800 border-red-200" },
  accepted: { label: "Accepted", color: "bg-purple-100 text-purple-800 border-purple-200" }
};

export default function RecruiterCandidates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedJobs, setExpandedJobs] = useState<{ [key: number]: boolean }>({});
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterScore, setFilterScore] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  
  // Fetch job postings
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/recruiter/jobs"],
  });

  // Track applications from all jobs for searching
  const [allApplications, setAllApplications] = useState<any[]>([]);

  // Filtered applications based on search and filters
  const filteredApplications = allApplications.filter(app => {
    // Always apply search filter if present
    const matchesSearch = !searchTerm || 
      app.candidate?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.profile?.skills?.some((skill: string) => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Apply status filter if selected
    const matchesStatus = !filterStatus || app.status === filterStatus;
    
    // Apply score filter if selected
    let matchesScore = true;
    if (filterScore) {
      if (filterScore === "high" && app.aiScore < 80) matchesScore = false;
      if (filterScore === "medium" && (app.aiScore < 60 || app.aiScore >= 80)) matchesScore = false;
      if (filterScore === "low" && app.aiScore >= 60) matchesScore = false;
    }
    
    return matchesSearch && matchesStatus && matchesScore;
  });

  // Fetch applications for each job
  const applicationQueries = jobs?.map(job => {
    const jobId = job.id;
    const queryKey = [`/api/jobs/${jobId}/applications`];
    
    const { data: applications } = useQuery({
      queryKey,
      enabled: !!job,
    });
    
    // Process the applications data when it's available
    React.useEffect(() => {
      if (applications) {
        // Add job info to each application for filtering
        const applicationsWithJob = applications.map((app: any) => ({
          ...app,
          job: {
            id: jobId,
            title: job.title,
            company: job.company
          }
        }));
        
        // Update all applications
        setAllApplications(prev => {
          const filteredPrev = prev.filter(app => app.job?.id !== jobId);
          return [...filteredPrev, ...applicationsWithJob];
        });
      }
    }, [applications, jobId, job.title, job.company]);
    
    return { queryKey, data: applications };
  });

  const applicationsLoading = applicationQueries?.some(query => query.isLoading);

  // Toggle job expansion
  const toggleJobExpansion = (jobId: number) => {
    setExpandedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  // Group applications by status
  const applicationsByStatus = {
    applied: filteredApplications.filter(app => app.status === "applied"),
    under_review: filteredApplications.filter(app => app.status === "under_review"),
    interview_scheduled: filteredApplications.filter(app => app.status === "interview_scheduled"),
    accepted: filteredApplications.filter(app => app.status === "accepted"),
    rejected: filteredApplications.filter(app => app.status === "rejected")
  };

  // Initially expand all jobs
  useEffect(() => {
    if (jobs && !jobsLoading) {
      const initialExpanded: { [key: number]: boolean } = {};
      jobs.forEach((job: any) => {
        initialExpanded[job.id] = true;
      });
      setExpandedJobs(initialExpanded);
    }
  }, [jobs, jobsLoading]);
  
  // Handle status change
  const handleStatusChange = () => {
    // Refresh all job applications
    applicationQueries?.forEach(query => {
      queryClient.invalidateQueries({ queryKey: query.queryKey });
    });
  };

  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
          <p className="mt-1 text-sm text-gray-500">View and evaluate candidates across all job postings</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search candidates..."
              className="pl-9 w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}>
            {viewMode === "list" ? "Grid View" : "List View"}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center">
          <ListFilter className="mr-2 h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 mr-2">Filters:</span>
        </div>
        
        <div className="flex items-center">
          <Select value={filterStatus || ""} onValueChange={(value) => setFilterStatus(value || null)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center">
          <Select value={filterScore || ""} onValueChange={(value) => setFilterScore(value || null)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="AI Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Scores</SelectItem>
              <SelectItem value="high">High Match (80%+)</SelectItem>
              <SelectItem value="medium">Medium Match (60-79%)</SelectItem>
              <SelectItem value="low">Low Match (Below 60%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {(filterStatus || filterScore || searchTerm) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setFilterStatus(null);
              setFilterScore(null);
              setSearchTerm("");
            }}
            className="text-blue-600"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {(jobsLoading || applicationsLoading) ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Candidates <Badge className="ml-2 bg-gray-100 text-gray-800">{filteredApplications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="by_status">
              By Status
            </TabsTrigger>
            <TabsTrigger value="by_job">
              By Job Posting
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {filteredApplications.length > 0 ? (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {filteredApplications.map(application => (
                  <CandidateCard 
                    key={application.id} 
                    application={application} 
                    compact={viewMode === "list"}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterStatus || filterScore
                    ? "No candidates match your filter criteria. Try adjusting your filters."
                    : "You don't have any candidate applications yet."}
                </p>
                {(searchTerm || filterStatus || filterScore) && (
                  <div className="mt-6">
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus(null);
                        setFilterScore(null);
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="by_status">
            <div className="space-y-8">
              {Object.entries(applicationsByStatus).map(([status, applications]) => (
                <div key={status}>
                  <div className="flex items-center mb-4">
                    <Badge className={statusInfo[status as keyof typeof statusInfo]?.color || "bg-gray-100"}>
                      {statusInfo[status as keyof typeof statusInfo]?.label || status}
                    </Badge>
                    <span className="ml-2 text-sm text-gray-500">{applications.length} candidates</span>
                  </div>
                  
                  {applications.length > 0 ? (
                    <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                      {applications.map(application => (
                        <CandidateCard 
                          key={application.id} 
                          application={application} 
                          compact={viewMode === "list"}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                      No candidates in this status
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="by_job">
            <div className="space-y-6">
              {jobs && jobs.length > 0 ? (
                jobs.map((job: any) => {
                  const jobApplicationsQuery = applicationQueries?.find(query => 
                    query.queryKey[0] === `/api/jobs/${job.id}/applications`
                  );
                  
                  const applications = jobApplicationsQuery?.data || [];
                  const isExpanded = expandedJobs[job.id];
                  
                  // Apply filters to job-specific applications
                  const filteredJobApplications = applications.filter(app => {
                    // Apply status filter if selected
                    const matchesStatus = !filterStatus || app.status === filterStatus;
                    
                    // Apply score filter if selected
                    let matchesScore = true;
                    if (filterScore) {
                      if (filterScore === "high" && app.aiScore < 80) matchesScore = false;
                      if (filterScore === "medium" && (app.aiScore < 60 || app.aiScore >= 80)) matchesScore = false;
                      if (filterScore === "low" && app.aiScore >= 60) matchesScore = false;
                    }
                    
                    // Apply search filter if present
                    const matchesSearch = !searchTerm || 
                      app.candidate?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      app.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      app.profile?.skills?.some((skill: string) => 
                        skill.toLowerCase().includes(searchTerm.toLowerCase())
                      );
                    
                    return matchesStatus && matchesScore && matchesSearch;
                  });
                  
                  return (
                    <Card key={job.id}>
                      <CardHeader className="py-4 px-6 cursor-pointer" onClick={() => toggleJobExpansion(job.id)}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 mr-2 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 mr-2 text-gray-400" />
                            )}
                            <div>
                              <CardTitle className="text-lg">{job.title}</CardTitle>
                              <CardDescription>{filteredJobApplications.length} candidates</CardDescription>
                            </div>
                          </div>
                          <Badge className={job.isActive 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : "bg-gray-100 text-gray-800 border-gray-200"
                          }>
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="pb-6">
                          {filteredJobApplications.length > 0 ? (
                            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                              {filteredJobApplications.map(application => (
                                <CandidateCard 
                                  key={application.id} 
                                  application={{...application, job}} 
                                  compact={viewMode === "list"}
                                  hideJobInfo={true}
                                  onStatusChange={handleStatusChange}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Users className="mx-auto h-10 w-10 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates</h3>
                              <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || filterStatus || filterScore
                                  ? "No candidates match your filter criteria."
                                  : "No applications received for this job posting yet."}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-900">No job postings</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't created any job postings yet
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => window.location.href = "/recruiter/job-postings/new"}>
                      Create Job Posting
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </PortalContainer>
  );
}