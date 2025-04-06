import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, Users, MoreHorizontal, Calendar, Clock, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define application status display information
const statusInfo = {
  applied: { label: "Applied", color: "bg-blue-100 text-blue-800 border-blue-200" },
  under_review: { label: "Under Review", color: "bg-amber-100 text-amber-800 border-amber-200" },
  interview_scheduled: { label: "Interview Scheduled", color: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Not Selected", color: "bg-red-100 text-red-800 border-red-200" },
  accepted: { label: "Accepted", color: "bg-purple-100 text-purple-800 border-purple-200" }
};

interface CandidateCardProps {
  application: any;
  compact?: boolean;
  hideJobInfo?: boolean;
  onStatusChange?: () => void;
}

export function CandidateCard({ application, compact = false, hideJobInfo = false, onStatusChange }: CandidateCardProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);
  
  if (!application) return null;
  
  const { candidate, profile, job, status, aiScore, aiNotes, createdAt } = application;
  
  const updateApplicationStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await apiRequest("PATCH", `/api/applications/${application.id}`, { status: newStatus });
      
      // Invalidate cached application data
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${application.jobId}/applications`] });
      
      toast({
        title: "Status updated",
        description: `Candidate status has been updated to ${statusInfo[newStatus as keyof typeof statusInfo]?.label || newStatus}`,
      });
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message || "Failed to update candidate status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Format application date
  const applicationDate = new Date(createdAt || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  
  if (compact) {
    return (
      <Card className="overflow-hidden">
        <div className="flex items-start p-4">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{candidate?.fullName || "Unknown"}</h3>
              <Badge className={statusInfo[status as keyof typeof statusInfo]?.color || "bg-gray-100"}>
                {statusInfo[status as keyof typeof statusInfo]?.label || status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">{candidate?.email || "No email"}</p>
            
            <div className="mt-2 flex items-center">
              <div className="flex items-center text-sm">
                <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                <span className="text-gray-500">{applicationDate}</span>
              </div>
              
              {!hideJobInfo && job && (
                <div className="ml-4 flex items-center text-sm">
                  <span className="text-gray-500">Applied to: <strong>{job.title}</strong></span>
                </div>
              )}
            </div>
            
            {aiScore && (
              <div className="mt-2 flex items-center">
                <span className={`text-sm mr-2 font-medium ${aiScore > 80 ? "text-green-600" : aiScore > 60 ? "text-amber-600" : "text-gray-600"}`}>
                  AI Match: {aiScore}%
                </span>
                <div className="flex">
                  {Array.from({ length: Math.round(aiScore / 20) }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                  {Array.from({ length: 5 - Math.round(aiScore / 20) }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gray-300" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                <Users className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <CardTitle>{candidate?.fullName || "Unknown"}</CardTitle>
                <CardDescription>{candidate?.email || "No email"}</CardDescription>
              </div>
            </div>
            <Badge className={statusInfo[status as keyof typeof statusInfo]?.color || "bg-gray-100"}>
              {statusInfo[status as keyof typeof statusInfo]?.label || status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          {/* Applied Job Info */}
          {!hideJobInfo && job && (
            <div className="mb-4 pb-4 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Applied Position</h4>
              <div className="text-base font-medium">{job.title}</div>
              <div className="text-sm text-gray-500">{job.company}</div>
              <div className="mt-1 flex items-center text-sm">
                <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Applied on {applicationDate}</span>
              </div>
            </div>
          )}
          
          {/* Skills */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {profile?.skills?.slice(0, 6).map((skill: string, i: number) => (
                <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                  {skill}
                </Badge>
              ))}
              {profile?.skills?.length > 6 && (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-100">
                  +{profile.skills.length - 6} more
                </Badge>
              )}
              {!profile?.skills?.length && (
                <span className="text-gray-400 text-sm">No skills listed</span>
              )}
            </div>
          </div>
          
          {/* AI Score */}
          {aiScore && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-500">AI Match Score</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAiInsights(true)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  View Details
                </Button>
              </div>
              <div className="flex items-center">
                <div className={`mr-2 text-xl font-semibold ${aiScore > 80 ? "text-green-600" : aiScore > 60 ? "text-amber-600" : "text-gray-600"}`}>
                  {aiScore}%
                </div>
                <div className="flex">
                  {Array.from({ length: Math.round(aiScore / 20) }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                  {Array.from({ length: 5 - Math.round(aiScore / 20) }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gray-300" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              View Profile
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" disabled={isUpdating}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => updateApplicationStatus("under_review")}>
                      Move to Review
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => updateApplicationStatus("interview_scheduled")}>
                      Schedule Interview
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => updateApplicationStatus("accepted")}>
                      Accept Candidate
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => updateApplicationStatus("rejected")}>
                      Reject Candidate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change candidate status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
      
      {/* AI Insights Dialog */}
      <Dialog open={showAiInsights} onOpenChange={setShowAiInsights}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Analysis for {candidate?.fullName || "Candidate"}</DialogTitle>
            <DialogDescription>
              Detailed AI-generated insights about the candidate's fit for this position
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-md">
              <div className="text-blue-800">
                <div className="text-sm font-medium">Overall Match Score</div>
                <div className="text-3xl font-bold">{aiScore}%</div>
              </div>
              <div className="flex">
                {Array.from({ length: Math.round(aiScore / 20) }).map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-amber-400 fill-current" />
                ))}
                {Array.from({ length: 5 - Math.round(aiScore / 20) }).map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-gray-300" />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Analysis</h3>
              <div className="text-gray-700 whitespace-pre-line">
                {aiNotes || "No detailed analysis available for this candidate."}
              </div>
            </div>
            
            {profile?.skills?.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.map((skill: string, i: number) => (
                    <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}