import { PortalContainer } from "@/components/layout/portal-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { SkillsRadar } from "@/components/charts/skills-radar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Lightbulb, Award, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CandidateInsights() {
  const { user } = useAuth();

  // Fetch candidate profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/candidate/profile"],
  });

  // Fetch career recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/candidate/recommendations"],
    enabled: !!profile?.resumeText && !!profile?.skills?.length,
  });

  if (profileLoading || recommendationsLoading) {
    return (
      <PortalContainer>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">AI Insights</h1>
            <p className="mt-1 text-sm text-gray-500">AI-driven analysis of your profile and career prospects</p>
          </div>
        </div>

        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </PortalContainer>
    );
  }

  const isProfileComplete = !!profile?.resumeText && !!profile?.skills?.length;

  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Insights</h1>
          <p className="mt-1 text-sm text-gray-500">AI-driven analysis of your profile and career prospects</p>
        </div>
      </div>

      {!isProfileComplete ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Complete Your Profile</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              To get AI-driven insights, please complete your profile with your resume and skills information.
            </p>
            <div className="mt-6">
              <Link href="/candidate/profile">
                <Button>Update Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overall Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                Profile Assessment
              </CardTitle>
              <CardDescription>
                Overall analysis of your professional profile and skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                    <p className="text-sm text-gray-600">{profile?.aiEvaluation?.overallFeedback}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <Award className="h-4 w-4 mr-1 text-green-600" />
                        Strengths
                      </h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {profile?.aiEvaluation?.strengths?.map((strength: string, i: number) => (
                          <li key={`strength-${i}`}>{strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1 text-amber-600" />
                        Areas for Development
                      </h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {profile?.aiEvaluation?.developmentAreas?.map((area: string, i: number) => (
                          <li key={`area-${i}`}>{area}</li>
                        ))}
                        {profile?.aiEvaluation?.weaknesses?.map((weakness: string, i: number) => (
                          <li key={`weakness-${i}`}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="lg:w-1/3 border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6">
                  <div className="text-center mb-2">
                    <span className="inline-block px-4 py-1 text-lg font-semibold rounded-full bg-primary-100 text-primary-800">
                      Overall Score: {profile?.aiEvaluation?.score}/100
                    </span>
                  </div>
                  <div className="h-60">
                    <SkillsRadar data={profile?.aiEvaluation?.skillsMatch || []} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Career Recommendations
              </CardTitle>
              <CardDescription>
                AI suggestions to improve your career prospects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{recommendations?.explanation}</p>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Key Recommendations</h3>
                  <div className="space-y-3">
                    {recommendations?.recommendations?.map((recommendation: string, i: number) => (
                      <div key={`rec-${i}`} className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600">
                          <Badge variant="outline" className="mr-2">{i + 1}</Badge>
                          {recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                Skills Analysis
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your skills compared to market demands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profile?.aiEvaluation?.skillsMatch?.map((skillData: {skill: string, score: number}, i: number) => (
                  <div key={`skill-${i}`} className="p-4 border rounded-md bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{skillData.skill}</h4>
                      <Badge 
                        variant="outline" 
                        className={
                          skillData.score >= 80 ? "bg-green-100 text-green-800 border-green-200" :
                          skillData.score >= 60 ? "bg-blue-100 text-blue-800 border-blue-200" :
                          "bg-amber-100 text-amber-800 border-amber-200"
                        }
                      >
                        {skillData.score}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={
                          skillData.score >= 80 ? "bg-green-500 h-2.5 rounded-full" :
                          skillData.score >= 60 ? "bg-blue-500 h-2.5 rounded-full" :
                          "bg-amber-500 h-2.5 rounded-full"
                        }
                        style={{ width: `${skillData.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {!profile?.aiEvaluation?.skillsMatch?.length && (
                <div className="text-center p-6">
                  <p className="text-sm text-gray-500">No skill analysis available. Update your profile to get a detailed assessment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PortalContainer>
  );
}
