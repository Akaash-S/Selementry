import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Briefcase, 
  Clock, 
  Users,
  Star, 
  ChevronDown,
  ChevronUp,
  Check,
  Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { JobPosting } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface JobCardProps {
  job: JobPosting;
  compact?: boolean;
  applied?: boolean;
  aiMatchScore?: number;
  candidateSkills?: string[];
}

export function JobCard({ 
  job, 
  compact = false, 
  applied = false, 
  aiMatchScore, 
  candidateSkills = []
}: JobCardProps) {
  const { toast } = useToast();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const applyMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const res = await apiRequest("POST", "/api/applications", { jobId });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidate/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      
      // Show success message with AI score if available
      if (data.aiScore) {
        toast({
          title: "Application submitted",
          description: `You've successfully applied to ${job.title}. Your AI match score is ${data.aiScore}%.`,
        });
      } else {
        toast({
          title: "Application submitted",
          description: `You've successfully applied to ${job.title} at ${job.company}.`,
        });
      }
      
      setConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
      setConfirmDialogOpen(false);
    },
  });

  const handleApply = () => {
    setConfirmDialogOpen(true);
  };
  
  const confirmApply = () => {
    applyMutation.mutate(job.id);
  };

  // Check if candidate skills match job requirements
  const matchingSkills = candidateSkills.filter(skill => 
    job.skills.some(jobSkill => 
      jobSkill.toLowerCase() === skill.toLowerCase()
    )
  );
  
  const missingSkills = job.skills.filter(skill => 
    !candidateSkills.some(candidateSkill => 
      candidateSkill.toLowerCase() === skill.toLowerCase()
    )
  );
  
  // Format job posting date
  const postedAt = job.createdAt 
    ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) 
    : "Unknown date";
    
  // Decide job type badge color
  const jobTypeBadgeColor = () => {
    switch(job.jobType?.toLowerCase()) {
      case 'full-time': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'part-time': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'contract': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'internship': return 'bg-green-100 text-green-800 border-green-200';
      case 'remote': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Truncate description for compact view
  const truncatedDescription = job.description && job.description.length > 150 
    ? `${job.description.slice(0, 150)}...` 
    : job.description;

  return (
    <>
      <Card className="w-full overflow-hidden hover:shadow-md transition-shadow duration-200">
        <CardContent className={compact ? "p-4" : "p-6"}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className={`${compact ? "text-sm" : "text-xl"} font-medium text-gray-900`}>{job.title}</h3>
              <p className={`${compact ? "mt-0.5" : "mt-1"} text-sm text-gray-500 flex items-center`}>
                <Building className="mr-1 h-3.5 w-3.5 text-gray-400" />
                {job.company}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {aiMatchScore !== undefined && (
                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className={`
                          ${aiMatchScore >= 80 ? 'bg-green-100 text-green-800 border-green-200' : 
                            aiMatchScore >= 60 ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                            'bg-red-100 text-red-800 border-red-200'}
                        `}>
                          {aiMatchScore}% Match
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>AI-based match score based on your skills and experience</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              {job.jobType && (
                <Badge variant="outline" className={jobTypeBadgeColor()}>
                  {job.jobType}
                </Badge>
              )}
              {applied && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <Check className="mr-1 h-3 w-3" /> Applied
                </Badge>
              )}
            </div>
          </div>
          
          <div className={`${compact ? "mt-2" : "mt-4"} space-y-2`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                {job.location || "Location not specified"}
              </div>
              {job.salary && (
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  {job.salary}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                Posted {postedAt}
              </div>
              {job.department && (
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  {job.department}
                </div>
              )}
            </div>
          </div>
          
          {!compact && (
            <>
              {/* Description */}
              {job.description && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {showFullDescription ? job.description : truncatedDescription}
                    {job.description.length > 150 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-1 h-auto p-0 text-blue-600 hover:text-blue-800"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                      >
                        {showFullDescription ? (
                          <span className="flex items-center">Show less <ChevronUp className="ml-1 h-3 w-3" /></span>
                        ) : (
                          <span className="flex items-center">Show more <ChevronDown className="ml-1 h-3 w-3" /></span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Skills */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => {
                    const isMatching = candidateSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                    return (
                      <TooltipProvider key={i}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={isMatching 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-blue-100 text-blue-800 border-blue-200"
                              }
                            >
                              {isMatching && <Check className="mr-1 h-3 w-3" />}
                              {skill}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isMatching ? "You have this skill" : "Required skill"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
              
              {/* Matching Skills Summary */}
              {candidateSkills.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Skills Match</h4>
                    <span className="text-sm font-medium">
                      {matchingSkills.length}/{job.skills.length}
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${(matchingSkills.length / Math.max(job.skills.length, 1)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {matchingSkills.length > 0 
                      ? `You match ${matchingSkills.length} of ${job.skills.length} required skills` 
                      : "You don't match any of the required skills yet"}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
        
        {!compact && (
          <CardFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              
              {applied ? (
                <div className="flex items-center">
                  <Button variant="outline" className="mr-2" disabled>
                    <Check className="mr-2 h-4 w-4" />
                    Applied
                  </Button>
                  <Button variant="outline">
                    View Application
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleApply}
                  disabled={applyMutation.isPending}
                  className="sm:w-auto w-full"
                >
                  {applyMutation.isPending ? "Applying..." : "Apply Now"}
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Apply Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Application</DialogTitle>
            <DialogDescription>
              You're applying to the "{job.title}" position at {job.company}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {matchingSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Your matching skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {matchingSkills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <Check className="mr-1 h-3 w-3" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {missingSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Skills you're missing:</h4>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center border border-amber-200 bg-amber-50 rounded-md p-3">
              <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                When you apply, our AI will analyze your profile against this job for a match score.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApply} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? "Applying..." : "Confirm Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
