import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Application, JobPosting } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

interface ApplicationWithJob extends Application {
  job?: JobPosting;
}

interface ApplicationCardProps {
  application: ApplicationWithJob;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const job = application.job;
  
  if (!job) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">Job information not available</p>
        </CardContent>
      </Card>
    );
  }

  // Format application date
  const appliedAt = application.createdAt 
    ? formatDistanceToNow(new Date(application.createdAt), { addSuffix: true }) 
    : "Unknown date";

  // Map status to badge colors
  const statusBadgeVariants = {
    "applied": "bg-blue-100 text-blue-800",
    "under_review": "bg-yellow-100 text-yellow-800",
    "interview_scheduled": "bg-green-100 text-green-800",
    "rejected": "bg-red-100 text-red-800",
    "accepted": "bg-purple-100 text-purple-800"
  };

  // Format status for display
  const statusDisplay = {
    "applied": "Applied",
    "under_review": "Under Review",
    "interview_scheduled": "Interview Scheduled",
    "rejected": "Not Selected",
    "accepted": "Accepted"
  };

  return (
    <Card className="w-full">
      <CardContent className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-primary-600 truncate">{job.title}</div>
          <div className="ml-2 flex-shrink-0">
            <Badge className={statusBadgeVariants[application.status as keyof typeof statusBadgeVariants]}>
              {statusDisplay[application.status as keyof typeof statusDisplay]}
            </Badge>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              {job.company}
            </p>
            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
              <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              {job.location}
            </p>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <p>Applied {appliedAt}</p>
          </div>
        </div>
        <div className="mt-2">
          {application.aiScore !== null && application.aiScore !== undefined && (
            <>
              <Progress value={application.aiScore} className="h-2.5 bg-gray-200" />
              <p className="mt-1 text-xs text-gray-500">AI Match Score: {application.aiScore}%</p>
            </>
          )}
          {application.aiNotes && (
            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <p className="font-semibold">AI Feedback:</p>
              <p>{application.aiNotes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
