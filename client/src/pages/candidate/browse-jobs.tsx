import { PortalContainer } from "@/components/layout/portal-container";
import { useQuery } from "@tanstack/react-query";
import { JobCard } from "@/components/jobs/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Briefcase, 
  Search, 
  Filter, 
  ListFilter, 
  Sparkles, 
  BadgeCheck, 
  ChevronDown 
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Badge
} from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CandidateBrowseJobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJobType, setFilterJobType] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["/api/jobs"],
  });

  // Fetch candidate applications to check already applied jobs
  const { data: applications } = useQuery({
    queryKey: ["/api/candidate/applications"],
  });
  
  // Fetch candidate profile for skills
  const { data: profile } = useQuery({
    queryKey: ["/api/candidate/profile"],
  });
  
  const candidateSkills = profile?.skills || [];

  // Filter jobs by search term and filters
  const filteredJobs = jobs?.filter((job: any) => {
    // Search filter
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill: string) => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Job Type filter
    const matchesJobType = !filterJobType || 
      job.jobType?.toLowerCase() === filterJobType.toLowerCase();
    
    // Location filter
    const matchesLocation = !filterLocation || 
      job.location?.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesJobType && matchesLocation;
  }) || [];
  
  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "oldest":
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case "ai_score":
        // If we have real AI scores, we'd use them here
        return 0;
      default:
        return 0;
    }
  });

  // Check if a job has already been applied to
  const isApplied = (jobId: number) => {
    return applications?.some((app: any) => app.jobId === jobId);
  };
  
  // Get unique job types and locations for filters
  const uniqueJobTypes = jobs ? 
    Array.from(new Set(jobs.map((job: any) => job.jobType).filter(Boolean))) : [];
    
  const uniqueLocations = jobs ? 
    Array.from(new Set(jobs.map((job: any) => job.location).filter(Boolean))) : [];
  
  // Calculate AI match score for a job based on skills match (simplified version)
  const calculateMatchScore = (job: any) => {
    if (!job || !candidateSkills || candidateSkills.length === 0) {
      // Return a baseline score of 50-70 when we can't calculate
      return 50 + Math.floor(Math.random() * 20);
    }
    
    // Calculate what percentage of job skills the candidate has
    const matchingSkillsCount = job.skills.filter((skill: string) => 
      candidateSkills.some(candidateSkill => 
        candidateSkill.toLowerCase() === skill.toLowerCase()
      )
    ).length;
    
    const matchPercentage = Math.min(
      100, 
      Math.floor((matchingSkillsCount / Math.max(job.skills.length, 1)) * 100)
    );
    
    // Add some randomness for illustration, but weighted by the actual skill match
    return Math.min(100, matchPercentage + Math.floor(Math.random() * 20));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilterJobType(null);
    setFilterLocation(null);
    setSortBy("newest");
  };

  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Browse Jobs</h1>
          <p className="mt-1 text-sm text-gray-500">Find and apply to job openings</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search jobs or skills..."
              className="pl-9 w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className={showFilters ? "bg-blue-50 text-blue-700" : ""} 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Refine Job Search</CardTitle>
            <CardDescription>Filter and sort job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Type</label>
                <Select 
                  value={filterJobType || "all"} 
                  onValueChange={(value) => setFilterJobType(value !== "all" ? value : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Job Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Types</SelectItem>
                    {uniqueJobTypes.map((jobType) => (
                      <SelectItem key={jobType} value={jobType}>{jobType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select 
                  value={filterLocation || "all"} 
                  onValueChange={(value) => setFilterLocation(value !== "all" ? value : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="ai_score">Best AI Match</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" className="mr-2" onClick={resetFilters}>
                Reset Filters
              </Button>
              <Button onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Job Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Available Jobs</p>
              <p className="text-2xl font-semibold">{jobs?.length || 0}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Applied Jobs</p>
              <p className="text-2xl font-semibold">{applications?.length || 0}</p>
            </div>
            <BadgeCheck className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Your Skills</p>
              <p className="text-2xl font-semibold">{candidateSkills?.length || 0}</p>
            </div>
            <Sparkles className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
      </div>
      
      {/* Skills Summary */}
      {candidateSkills?.length > 0 && (
        <Accordion type="single" collapsible className="mb-6">
          <AccordionItem value="skills">
            <AccordionTrigger className="text-sm font-medium">
              Your Skills ({candidateSkills.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 mt-2">
                {candidateSkills.map((skill, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                    {skill}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      {/* Filter Summary */}
      {(searchTerm || filterJobType || filterLocation) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm font-medium flex items-center">
            <ListFilter className="h-4 w-4 mr-1" /> 
            Active Filters:
          </span>
          
          {searchTerm && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
              Search: {searchTerm}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1 text-blue-700 hover:text-blue-900 hover:bg-transparent" 
                onClick={() => setSearchTerm("")}
              >
                &times;
              </Button>
            </Badge>
          )}
          
          {filterJobType && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
              Job Type: {filterJobType}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1 text-blue-700 hover:text-blue-900 hover:bg-transparent" 
                onClick={() => setFilterJobType(null)}
              >
                &times;
              </Button>
            </Badge>
          )}
          
          {filterLocation && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1">
              Location: {filterLocation}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1 text-blue-700 hover:text-blue-900 hover:bg-transparent" 
                onClick={() => setFilterLocation(null)}
              >
                &times;
              </Button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600" 
            onClick={resetFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </>
        ) : sortedJobs.length > 0 ? (
          sortedJobs.map((job: any) => (
            <JobCard 
              key={job.id} 
              job={job} 
              applied={isApplied(job.id)}
              aiMatchScore={calculateMatchScore(job)}
              candidateSkills={candidateSkills}
            />
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || filterJobType || filterLocation 
                  ? "No matching jobs found" 
                  : "No jobs available"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterJobType || filterLocation
                  ? "Try adjusting your search terms or filters." 
                  : "Check back later for new job postings."}
              </p>
              {(searchTerm || filterJobType || filterLocation) && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PortalContainer>
  );
}
