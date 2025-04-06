import { useAuth } from "@/hooks/use-auth";
import { PortalContainer } from "@/components/layout/portal-container";
import { Card, CardContent } from "@/components/ui/card";
import { JobCard } from "@/components/jobs/job-card";
import { ApplicationCard } from "@/components/applications/application-card";
import { Button } from "@/components/ui/button";
import { SkillsRadar } from "@/components/charts/skills-radar";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Briefcase, CalendarCheck, ChartLine, Lightbulb } from "lucide-react";
import { BarChart2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidateDashboard() {
  const { user } = useAuth();

  // Fetch candidate profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/candidate/profile"],
  });

  // Fetch candidate applications
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/candidate/applications"],
  });

  // Fetch active job postings
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
  });

  return (
    <PortalContainer>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.fullName.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-gray-500">Here's an overview of your job applications and AI insights</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/candidate/browse-jobs">
            <Button className="inline-flex items-center">
              <Briefcase className="mr-2 h-4 w-4" />
              Browse New Jobs
            </Button>
          </Link>
        </div>
      </div>

      {/* Application Stats */}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Briefcase className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Applications</dt>
                  <dd>
                    {applicationsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">{applications?.length || 0}</div>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Interviews Scheduled</dt>
                  <dd>
                    {applicationsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">
                        {applications?.filter((app: any) => app.status === "interview_scheduled").length || 0}
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
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <ChartLine className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average AI Match Score</dt>
                  <dd>
                    {applicationsLoading || applications?.length === 0 ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-lg font-medium text-gray-900">
                        {applications?.length 
                          ? Math.round(applications.reduce((sum: number, app: any) => sum + (app.aiScore || 0), 0) / applications.length)
                          : 0}%
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">AI Career Insights</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary-500 rounded-full p-2">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-base font-medium text-gray-900">Your Profile Assessment</h3>
                {profileLoading ? (
                  <div className="mt-2 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : profile?.aiEvaluation ? (
                  <div className="mt-2 text-sm text-gray-500">
                    <p>{profile.aiEvaluation.overallFeedback}</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {profile.aiEvaluation.strengths?.map((strength: string, i: number) => (
                        <li key={`strength-${i}`}>{strength}</li>
                      ))}
                      {profile.aiEvaluation.developmentAreas?.map((area: string, i: number) => (
                        <li key={`area-${i}`}>{area}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Complete your profile to get AI-powered insights about your career prospects and skills.</p>
                    <div className="mt-4">
                      <Link href="/candidate/profile">
                        <Button variant="outline" size="sm">
                          Update Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
                {profile?.aiEvaluation && (
                  <div className="mt-4">
                    <Link href="/candidate/insights">
                      <Button variant="link" className="text-sm font-medium text-primary-600 p-0 hover:text-primary-500 h-auto">
                        View detailed analysis <span className="ml-1">→</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {profile?.aiEvaluation?.skillsMatch?.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-base font-medium text-gray-900">Skills Radar</h3>
                <div className="mt-2 rounded-lg">
                  <SkillsRadar data={profile.aiEvaluation.skillsMatch} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Applications</h2>
          <Link href="/candidate/applications">
            <Button variant="link" className="text-sm font-medium text-primary-600 p-0 hover:text-primary-500 h-auto">
              View all <span className="ml-1">→</span>
            </Button>
          </Link>
        </div>
        <div className="mt-4">
          {applicationsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          ) : applications?.length ? (
            <div className="space-y-4">
              {applications.slice(0, 3).map((application: any) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart2 className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start applying to jobs to track your applications here.
                </p>
                <div className="mt-6">
                  <Link href="/candidate/browse-jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Recommended for You</h2>
          <Link href="/candidate/browse-jobs">
            <Button variant="link" className="text-sm font-medium text-primary-600 p-0 hover:text-primary-500 h-auto">
              View all <span className="ml-1">→</span>
            </Button>
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {jobsLoading ? (
            <>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </>
          ) : jobs?.length ? (
            jobs.slice(0, 2).map((job: any) => (
              <JobCard 
                key={job.id} 
                job={job} 
                aiMatchScore={Math.floor(Math.random() * 30) + 70} // Placeholder for demo
              />
            ))
          ) : (
            <Card className="col-span-2">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No job recommendations available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Complete your profile to get personalized job recommendations.
                </p>
                <div className="mt-6">
                  <Link href="/candidate/profile">
                    <Button>Update Profile</Button>
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
