import { PortalContainer } from "@/components/layout/portal-container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Calendar, Clock, Users, Building, CalendarCheck, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { CandidatesChart } from "@/components/charts/candidates-chart";

export default function RecruiterDashboard() {
  const { user } = useAuth();

  // Fetch recruiter's job postings
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/recruiter/jobs"],
  });

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/recruiter/analytics"],
  });

  return (
    <PortalContainer>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recruiter Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage job postings and evaluate candidates with AI-powered insights</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/recruiter/job-postings/new">
            <Button className="inline-flex items-center">
              <Briefcase className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Recruitment Stats */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Briefcase className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                  <dd>
                    {jobsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">
                        {analytics?.activeJobs || 0}
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Candidates</dt>
                  <dd>
                    {analyticsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">
                        {analytics?.totalApplications || 0}
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CalendarCheck className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Interviews This Week</dt>
                  <dd>
                    {analyticsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">
                        {analytics?.applicationsByStatus?.interview_scheduled || 0}
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Time-to-Hire (Avg)</dt>
                  <dd>
                    {analyticsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">24 days</div> // Example static value
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recruitment Analytics */}
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recruitment Analytics</h2>
        <Card>
          <CardContent className="p-6">
            <div className="sm:flex sm:items-center sm:justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-900">Candidate Sources & Conversions</h3>
                <p className="mt-1 text-sm text-gray-500">Last 30 days analytics</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
            
            {analyticsLoading ? (
              <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : analytics?.applicationsByStatus ? (
              <CandidatesChart 
                data={[
                  { name: "Applied", value: analytics.applicationsByStatus.applied, fill: "#60A5FA" },
                  { name: "Under Review", value: analytics.applicationsByStatus.under_review, fill: "#FBBF24" },
                  { name: "Interview", value: analytics.applicationsByStatus.interview_scheduled, fill: "#34D399" },
                  { name: "Accepted", value: analytics.applicationsByStatus.accepted, fill: "#8B5CF6" },
                  { name: "Rejected", value: analytics.applicationsByStatus.rejected, fill: "#F87171" },
                ]}
                title="Application Status Distribution"
              />
            ) : (
              <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">No analytics data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Candidates */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Top Candidates</h2>
          <Link href="/recruiter/candidates">
            <Button variant="link" className="text-sm font-medium text-primary-600 p-0 hover:text-primary-500 h-auto">
              View all <span className="ml-1">→</span>
            </Button>
          </Link>
        </div>
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Candidate</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">AI Score</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {analyticsLoading ? (
                <>
                  <tr>
                    <td colSpan={5} className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                </>
              ) : analytics?.jobsWithApplications && analytics.jobsWithApplications.length > 0 ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">Candidate {index + 1}</div>
                          <div className="text-gray-500">example{index + 1}@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="text-gray-900">{analytics.jobsWithApplications[0]?.title || "Job Position"}</div>
                      <div className="text-gray-500">{analytics.jobsWithApplications[0]?.department || "Department"}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="mr-2 text-green-600 font-medium">{90 - index * 3}%</div>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className="h-4 w-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Interview Scheduled
                      </Badge>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link href={`/recruiter/candidates/${index + 1}`}>
                        <a className="text-primary-600 hover:text-primary-900">View</a>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center">
                      <Users className="h-8 w-8 text-gray-400 mb-2" />
                      <p>No candidates available yet</p>
                      <p className="mt-1">Post jobs to start receiving applications</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Postings */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Job Postings</h2>
          <Link href="/recruiter/job-postings">
            <Button variant="link" className="text-sm font-medium text-primary-600 p-0 hover:text-primary-500 h-auto">
              View all <span className="ml-1">→</span>
            </Button>
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {jobsLoading ? (
            <>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </>
          ) : jobs && jobs.length > 0 ? (
            jobs.slice(0, 2).map((job: any) => (
              <Card key={job.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">{job.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{job.department} • {job.jobType}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {job.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {job.location}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Posted {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "recently"}
                    </div>
                  </div>
                  
                  <div className="mt-5 flex items-center space-x-2">
                    <div className="text-sm text-gray-500">Applicants:</div>
                    <div className="h-2 bg-gray-200 flex-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ 
                          width: analytics?.jobsWithApplications?.find(j => j.id === job.id)?.applications 
                            ? `${Math.min(100, (analytics.jobsWithApplications.find(j => j.id === job.id)?.applications / 100) * 100)}%` 
                            : "0%" 
                        }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {analytics?.jobsWithApplications?.find(j => j.id === job.id)?.applications || 0}
                    </div>
                  </div>
                  
                  <div className="mt-5 flex space-x-3">
                    <Link href={`/recruiter/job-postings/${job.id}/candidates`}>
                      <Button className="flex-1">View Candidates</Button>
                    </Link>
                    <Link href={`/recruiter/job-postings/${job.id}/edit`}>
                      <Button variant="outline" className="flex-1">Edit Posting</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-2">
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
      </div>
    </PortalContainer>
  );
}
