import { PortalContainer } from "@/components/layout/portal-container";
import { useQuery } from "@tanstack/react-query";
import { ApplicationCard } from "@/components/applications/application-card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { useState } from "react";

export default function CandidateApplications() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Fetch applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ["/api/candidate/applications"],
  });

  // Filter applications by status if filter is set
  const filteredApplications = statusFilter
    ? applications?.filter((app: any) => app.status === statusFilter)
    : applications;

  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Applications</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage your job applications</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Select onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="rejected">Not Selected</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </>
        ) : filteredApplications?.length > 0 ? (
          filteredApplications.map((application: any) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart2 className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {statusFilter ? "No applications with this status" : "No applications yet"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter 
                  ? "Try selecting a different status filter." 
                  : "Browse and apply to jobs to see your applications here."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalContainer>
  );
}
