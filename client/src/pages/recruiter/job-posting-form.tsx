import { useState, useEffect } from "react";
import { PortalContainer } from "@/components/layout/portal-container";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Form schema based on job posting model
const jobPostingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  company: z.string().min(2, "Company name is required"),
  location: z.string().min(2, "Location is required"),
  description: z.string().min(20, "Please provide a detailed description"),
  salary: z.string().optional(),
  jobType: z.string().min(2, "Job type is required"),
  department: z.string().min(2, "Department is required"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  isActive: z.boolean().default(true),
});

type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

interface JobPostingFormProps {
  jobId?: number;
}

export default function JobPostingForm({ jobId }: JobPostingFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [newSkill, setNewSkill] = useState("");

  const isEditing = !!jobId;

  // Fetch job details if editing
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: isEditing,
  });

  // Create Zod form
  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      description: "",
      salary: "",
      jobType: "Full-time",
      department: "",
      skills: [],
      isActive: true,
    },
  });

  // Update form when job data is loaded
  useEffect(() => {
    if (job && isEditing) {
      form.reset({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        salary: job.salary || "",
        jobType: job.jobType,
        department: job.department,
        skills: job.skills,
        isActive: job.isActive,
      });
    }
  }, [job, form, isEditing]);

  // Create job posting mutation
  const createMutation = useMutation({
    mutationFn: async (data: JobPostingFormValues) => {
      const response = await apiRequest("POST", "/api/jobs", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job posting created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recruiter/jobs"] });
      navigate("/recruiter/job-postings");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job posting",
        variant: "destructive",
      });
    },
  });

  // Update job posting mutation
  const updateMutation = useMutation({
    mutationFn: async (data: JobPostingFormValues) => {
      const response = await apiRequest("PATCH", `/api/jobs/${jobId}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job posting updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recruiter/jobs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      navigate("/recruiter/job-postings");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job posting",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: JobPostingFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  // Add skill to the skills array
  const addSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = form.getValues("skills") || [];
      
      // Check if skill already exists
      if (!currentSkills.includes(newSkill.trim())) {
        form.setValue("skills", [...currentSkills, newSkill.trim()]);
        form.trigger("skills"); // Validate after update
      }
      
      setNewSkill("");
    }
  };

  // Remove skill from skills array
  const removeSkill = (index: number) => {
    const currentSkills = form.getValues("skills") || [];
    const updatedSkills = [...currentSkills];
    updatedSkills.splice(index, 1);
    form.setValue("skills", updatedSkills);
    form.trigger("skills"); // Validate after update
  };

  // Handle keydown to add skill when Enter is pressed
  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // Handle loading state
  if (isEditing && jobLoading) {
    return (
      <PortalContainer>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-4 w-2/3 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-8">
            <Skeleton className="h-10 w-24 mr-2" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </PortalContainer>
    );
  }

  return (
    <PortalContainer>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">
          {isEditing ? "Edit Job Posting" : "Create New Job Posting"}
        </h1>
        <p className="text-gray-500 mb-6">
          {isEditing
            ? "Update the details of your job posting"
            : "Fill in the details to create a new job posting"}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York, NY (or Remote)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Range (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. $80,000 - $100,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Engineering, Marketing, Sales" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of the role, responsibilities, and requirements"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={() => (
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input
                        placeholder="Add a skill (e.g. React, Project Management)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={addSkill}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.getValues("skills")?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {form.formState.errors.skills && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.skills.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Make this job posting visible to candidates
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/recruiter/job-postings")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  form.formState.isSubmitting
                }
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update Job"
                  : "Create Job"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PortalContainer>
  );
}