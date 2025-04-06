import { PortalContainer } from "@/components/layout/portal-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { X, FileText, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeParser } from "@/components/resume/resume-parser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema with validation
const profileSchema = z.object({
  resumeText: z.string().min(10, "Resume must be at least 10 characters"),
  experience: z.string().optional(),
  education: z.string().optional(),
  newSkill: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CandidateProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Fetch candidate profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/candidate/profile"],
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { resumeText: string, experience: string, education: string, skills: string[] }) => {
      const res = await apiRequest("PATCH", "/api/candidate/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidate/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      resumeText: "",
      experience: "",
      education: "",
      newSkill: "",
    },
  });
  
  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      if (profile.skills && Array.isArray(profile.skills)) {
        setSkills(profile.skills);
      }
      
      form.reset({
        resumeText: profile?.resumeText || "",
        experience: profile?.experience || "",
        education: profile?.education || "",
        newSkill: "",
      });
    }
  }, [profile, form]);

  // Add skill handler
  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
      form.setValue("newSkill", "");
    }
  };

  // Remove skill handler
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Form submission handler
  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate({
      resumeText: values.resumeText,
      experience: values.experience || "",
      education: values.education || "",
      skills: skills,
    });
  };
  
  // Resume parser handler
  const handleResumeProcessed = (resumeText: string, parsedData: any) => {
    // Update the form with the parsed resume data
    form.setValue("resumeText", resumeText);
    
    // Extract skills from parsed data if available
    if (parsedData.skills?.technical) {
      const technicalSkills = parsedData.skills.technical || [];
      const softSkills = parsedData.skills.soft || [];
      const allSkills = [...technicalSkills, ...softSkills];
      
      if (allSkills.length > 0) {
        setSkills(allSkills);
      }
    }
    
    // Extract experience from parsed data if available
    if (parsedData.experience) {
      const experienceText = parsedData.experience.map((exp: any) => 
        `${exp.company} - ${exp.position}\n${exp.startDate || ''} - ${exp.endDate || ''}\n${exp.description || ''}`
      ).join('\n\n');
      
      form.setValue("experience", experienceText);
    }
    
    // Extract education from parsed data if available
    if (parsedData.education) {
      const educationText = parsedData.education.map((edu: any) => 
        `${edu.institution} - ${edu.degree} in ${edu.field}\n${edu.startDate || ''} - ${edu.endDate || ''}`
      ).join('\n\n');
      
      form.setValue("education", educationText);
    }
    
    // Submit the form with the updated values
    form.handleSubmit(onSubmit)();
  };

  if (isLoading) {
    return (
      <PortalContainer>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your career profile and preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </PortalContainer>
    );
  }

  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your career profile and preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Your account details and personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-sm text-gray-900 mb-4">{user?.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <p className="text-sm text-gray-900 mb-4">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <p className="text-sm text-gray-900 mb-4">{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <p className="text-sm text-gray-900 capitalize">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Profile</CardTitle>
            <CardDescription>
              This information will be used to match you with suitable job opportunities and analyze your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="ai-parser" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  AI Resume Parser
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Skills section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Skills
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          placeholder="Add a skill (e.g., JavaScript, Project Management)" 
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          onClick={handleAddSkill}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {skills.map((skill, index) => (
                          <Badge key={index} className="flex items-center space-x-1 px-3 py-1">
                            <span>{skill}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-1 text-xs rounded-full hover:bg-primary-700 w-4 h-4 inline-flex items-center justify-center"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {skills.length === 0 && (
                          <p className="text-sm text-gray-500 mt-1">No skills added yet</p>
                        )}
                      </div>
                    </div>

                    {/* Experience section */}
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Experience</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your work experience, including companies, roles, and responsibilities"
                              className="min-h-[120px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            List your most relevant work experiences
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Education section */}
                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List your education, including universities, degrees, and years"
                              className="min-h-[120px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Include any relevant degrees, certifications, or courses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Resume section */}
                    <FormField
                      control={form.control}
                      name="resumeText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resume Text</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Copy and paste the full text of your resume here"
                              className="min-h-[200px] resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be analyzed by AI to help match you with jobs and provide insights
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto" 
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="ai-parser">
                <ResumeParser onResumeProcessed={handleResumeProcessed} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PortalContainer>
  );
}
