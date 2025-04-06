import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertJobPostingSchema, 
  insertApplicationSchema,
  jobPostings,
  applications
} from "@shared/schema";
import { z } from "zod";
import { 
  analyzeCandidateProfile, 
  analyzeCandidateJobMatch, 
  getCareerRecommendations 
} from "./openai";
import { 
  processResume,
  analyzeCandidate, 
  analyzeCandidateJobFit 
} from "./candidateAnalysis";
import { parseResume } from "./resumeParser";

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to ensure user is a recruiter
function ensureRecruiter(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user && req.user.role === "recruiter") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Recruiter role required" });
}

// Middleware to ensure user is a candidate
function ensureCandidate(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user && req.user.role === "candidate") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Candidate role required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // ===== Job Posting Routes =====
  
  // Get all job postings (public)
  app.get("/api/jobs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const jobs = await storage.getActiveJobPostings(limit, offset);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching job postings" });
    }
  });
  
  // Get specific job posting (public)
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJobPosting(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Error fetching job posting" });
    }
  });
  
  // Create new job posting (recruiters only)
  app.post("/api/jobs", ensureRecruiter, async (req, res) => {
    try {
      const recruiterId = req.user!.id;
      const validatedData = insertJobPostingSchema.parse({
        ...req.body,
        recruiterId
      });
      
      const job = await storage.createJobPosting(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error creating job posting" });
    }
  });
  
  // Update job posting (recruiters only)
  app.patch("/api/jobs/:id", ensureRecruiter, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const recruiterId = req.user!.id;
      
      // First verify the job belongs to this recruiter
      const job = await storage.getJobPosting(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      if (job.recruiterId !== recruiterId) {
        return res.status(403).json({ message: "Not authorized to update this job posting" });
      }
      
      const updatedJob = await storage.updateJobPosting(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Error updating job posting" });
    }
  });
  
  // Get job postings by recruiter (recruiters only)
  app.get("/api/recruiter/jobs", ensureRecruiter, async (req, res) => {
    try {
      const recruiterId = req.user!.id;
      const jobs = await storage.getJobPostingsByRecruiter(recruiterId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recruiter job postings" });
    }
  });

  // ===== Applications Routes =====
  
  // Apply to job (candidates only)
  app.post("/api/applications", ensureCandidate, async (req, res) => {
    try {
      const candidateId = req.user!.id;
      
      const validatedData = insertApplicationSchema.parse({
        ...req.body,
        candidateId
      });
      
      // Verify the job exists
      const job = await storage.getJobPosting(validatedData.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      // Check if already applied
      const candidateApplications = await storage.getApplicationsByCandidate(candidateId);
      const alreadyApplied = candidateApplications.some(app => app.jobId === validatedData.jobId);
      
      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied to this job" });
      }
      
      // Get candidate profile for AI scoring
      const candidateProfile = await storage.getCandidateProfile(candidateId);
      
      // Create the application
      const application = await storage.createApplication(validatedData);
      
      // If we have candidate profile data, process AI scoring
      if (candidateProfile && candidateProfile.resumeText && candidateProfile.skills) {
        try {
          const match = await analyzeCandidateJobMatch(
            candidateProfile.resumeText,
            candidateProfile.skills,
            job.title,
            job.description,
            job.skills
          );
          
          // Update application with AI score and notes
          await storage.updateApplication(application.id, {
            aiScore: match.score,
            aiNotes: match.feedback
          });
          
          // Return the updated application
          res.status(201).json({
            ...application,
            aiScore: match.score,
            aiNotes: match.feedback
          });
        } catch (error) {
          // Still create the application even if AI scoring fails
          console.error("AI scoring failed:", error);
          res.status(201).json(application);
        }
      } else {
        // If no profile data, just return the application without AI scoring
        res.status(201).json(application);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error creating application" });
    }
  });
  
  // Get candidate applications
  app.get("/api/candidate/applications", ensureCandidate, async (req, res) => {
    try {
      const candidateId = req.user!.id;
      const applications = await storage.getApplicationsByCandidate(candidateId);
      
      // Fetch job details for each application
      const applicationsWithJobs = await Promise.all(
        applications.map(async (app) => {
          const job = await storage.getJobPosting(app.jobId);
          return {
            ...app,
            job
          };
        })
      );
      
      res.json(applicationsWithJobs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching applications" });
    }
  });
  
  // Get applications for a job (recruiters only)
  app.get("/api/jobs/:id/applications", ensureRecruiter, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const recruiterId = req.user!.id;
      
      // First verify the job belongs to this recruiter
      const job = await storage.getJobPosting(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      if (job.recruiterId !== recruiterId) {
        return res.status(403).json({ message: "Not authorized to view applications for this job" });
      }
      
      const applications = await storage.getApplicationsByJob(jobId);
      
      // Fetch candidate details for each application
      const applicationsWithCandidates = await Promise.all(
        applications.map(async (app) => {
          const candidate = await storage.getUser(app.candidateId);
          const profile = await storage.getCandidateProfile(app.candidateId);
          
          return {
            ...app,
            candidate: candidate ? {
              id: candidate.id,
              username: candidate.username,
              email: candidate.email,
              fullName: candidate.fullName
            } : undefined,
            profile
          };
        })
      );
      
      res.json(applicationsWithCandidates);
    } catch (error) {
      res.status(500).json({ message: "Error fetching applications" });
    }
  });
  
  // Update application status (recruiters only)
  app.patch("/api/applications/:id", ensureRecruiter, async (req, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const recruiterId = req.user!.id;
      
      // Validate the status
      const updateSchema = z.object({
        status: z.enum(["applied", "under_review", "interview_scheduled", "rejected", "accepted"])
      });
      
      const { status } = updateSchema.parse(req.body);
      
      // Get the application
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Get the job to verify ownership
      const job = await storage.getJobPosting(application.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      // Check if the recruiter owns this job
      if (job.recruiterId !== recruiterId) {
        return res.status(403).json({ message: "Not authorized to update this application" });
      }
      
      // Update the application status
      const updatedApplication = await storage.updateApplication(applicationId, { status });
      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error updating application" });
    }
  });
  
  // ===== Advanced Candidate Analysis Routes =====

  // Process resume using AI analysis
  app.post('/api/candidate/resume/analyze', ensureCandidate, async (req, res) => {
    try {
      const { resumeText } = req.body;
      
      if (!resumeText) {
        return res.status(400).json({ message: 'Resume text is required' });
      }
      
      console.log(`Processing resume for user ${req.user!.id}`);
      
      // Process the resume and update the candidate's profile with the structured data
      const profile = await processResume(req.user!.id, resumeText);
      
      if (!profile) {
        return res.status(500).json({ message: 'Failed to process resume' });
      }
      
      console.log('Resume processed and saved successfully');
      
      res.status(200).json({
        message: "Resume processed successfully",
        profile: profile
      });
    } catch (error) {
      console.error('Error processing resume:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: 'Failed to process resume',
        error: errorMessage
      });
    }
  });
  
  // Perform comprehensive candidate analysis
  app.get('/api/candidate/comprehensive-analysis', ensureCandidate, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Perform the analysis
      const analysis = await analyzeCandidate(userId);
      
      res.status(200).json(analysis);
    } catch (error) {
      console.error('Error analyzing candidate:', error);
      res.status(500).json({ message: 'Failed to analyze candidate' });
    }
  });
  
  // Analyze job fit for a specific candidate and job
  app.get('/api/candidate/jobs/:jobId/fit', ensureCandidate, async (req, res) => {
    try {
      const candidateId = req.user!.id;
      const jobId = parseInt(req.params.jobId);
      
      // Verify job exists
      const job = await storage.getJobPosting(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job posting not found' });
      }
      
      // Perform the job fit analysis
      const jobFit = await analyzeCandidateJobFit(candidateId, jobId);
      
      if (!jobFit) {
        return res.status(500).json({ message: 'Failed to analyze job fit' });
      }
      
      res.status(200).json(jobFit);
    } catch (error) {
      console.error('Error analyzing job fit:', error);
      res.status(500).json({ message: 'Failed to analyze job fit' });
    }
  });
  
  // For recruiters to view candidate analysis
  app.get('/api/recruiter/candidates/:candidateId/analysis', ensureRecruiter, async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      
      // Check if candidate profile exists
      const profile = await storage.getCandidateProfile(candidateId);
      if (!profile) {
        return res.status(404).json({ message: 'Candidate profile not found' });
      }
      
      // Perform the analysis
      const analysis = await analyzeCandidate(candidateId);
      
      res.status(200).json(analysis);
    } catch (error) {
      console.error('Error analyzing candidate:', error);
      res.status(500).json({ message: 'Failed to analyze candidate' });
    }
  });
  
  // For recruiters to view job fit for a candidate
  app.get('/api/recruiter/candidates/:candidateId/jobs/:jobId/fit', ensureRecruiter, async (req, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      const jobId = parseInt(req.params.jobId);
      
      // Verify job exists and belongs to this recruiter
      const job = await storage.getJobPosting(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job posting not found' });
      }
      
      if (job.recruiterId !== req.user!.id) {
        return res.status(403).json({ message: 'Not authorized to access this job' });
      }
      
      // Perform the job fit analysis
      const jobFit = await analyzeCandidateJobFit(candidateId, jobId);
      
      if (!jobFit) {
        return res.status(500).json({ message: 'Failed to analyze job fit' });
      }
      
      res.status(200).json(jobFit);
    } catch (error) {
      console.error('Error analyzing job fit:', error);
      res.status(500).json({ message: 'Failed to analyze job fit' });
    }
  });

  // ===== Candidate Profile Routes =====
  
  // Get candidate profile
  app.get("/api/candidate/profile", ensureCandidate, async (req, res) => {
    try {
      const userId = req.user!.id;
      const profile = await storage.getCandidateProfile(userId);
      
      if (!profile) {
        // Create a default profile if none exists
        const newProfile = await storage.createCandidateProfile({
          userId,
          skills: [],
          experience: "",
          education: "",
          resumeText: ""
        });
        return res.json(newProfile);
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error fetching candidate profile" });
    }
  });
  
  // Update candidate profile
  app.patch("/api/candidate/profile", ensureCandidate, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const updateSchema = z.object({
        skills: z.array(z.string()).optional(),
        experience: z.string().optional(),
        education: z.string().optional(),
        resumeText: z.string().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      let profile = await storage.getCandidateProfile(userId);
      
      if (!profile) {
        // Create a new profile if none exists
        profile = await storage.createCandidateProfile({
          userId,
          skills: validatedData.skills || [],
          experience: validatedData.experience || "",
          education: validatedData.education || "",
          resumeText: validatedData.resumeText || ""
        });
      } else {
        // Update existing profile
        profile = await storage.updateCandidateProfile(userId, validatedData);
      }
      
      // If the resume text and skills were updated, get an AI evaluation
      if ((validatedData.resumeText || validatedData.skills) && profile?.resumeText && profile.skills && profile.skills.length > 0) {
        try {
          const assessment = await analyzeCandidateProfile(profile.resumeText, profile.skills || []);
          await storage.updateCandidateProfile(userId, {
            aiEvaluation: assessment
          });
          
          // Return updated profile with evaluation
          profile = await storage.getCandidateProfile(userId);
        } catch (error) {
          console.error("AI evaluation failed:", error);
          // Continue without AI evaluation
        }
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error updating candidate profile" });
    }
  });
  
  // Resume parsing and analysis
  app.post("/api/candidate/resume/analyze", ensureCandidate, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { resumeText } = req.body;
      
      if (!resumeText) {
        return res.status(400).json({ message: "Resume text is required" });
      }
      
      // Parse the resume using AI
      const parsedResume = await parseResume(resumeText);
      
      // Save the parsed resume data to the candidate profile
      await storage.updateCandidateProfile(userId, {
        resumeText,
        parsedResume
      });
      
      // Return the parsed resume
      res.json(parsedResume);
    } catch (error) {
      console.error("Resume parsing error:", error);
      res.status(500).json({ message: "Error parsing resume" });
    }
  });
  
  // Get AI-based career recommendations
  app.get("/api/candidate/recommendations", ensureCandidate, async (req, res) => {
    try {
      const userId = req.user!.id;
      const profile = await storage.getCandidateProfile(userId);
      
      if (!profile || !profile.resumeText || !profile.skills || (profile.skills && profile.skills.length === 0)) {
        return res.status(400).json({ 
          message: "Profile incomplete. Please update your resume and skills to get recommendations." 
        });
      }
      
      const recommendations = await getCareerRecommendations(profile.resumeText, profile.skills || []);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Error generating recommendations" });
    }
  });
  
  // ===== Recruiter Profile Routes =====
  
  // Get recruiter profile
  app.get("/api/recruiter/profile", ensureRecruiter, async (req, res) => {
    try {
      const userId = req.user!.id;
      const profile = await storage.getRecruiterProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Recruiter profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recruiter profile" });
    }
  });
  
  // Update recruiter profile
  app.patch("/api/recruiter/profile", ensureRecruiter, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const updateSchema = z.object({
        company: z.string().optional(),
        position: z.string().optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      const profile = await storage.updateRecruiterProfile(userId, validatedData);
      
      if (!profile) {
        return res.status(404).json({ message: "Recruiter profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error updating recruiter profile" });
    }
  });
  
  // ===== Analytics Routes =====
  
  // Get recruiter analytics
  app.get("/api/recruiter/analytics", ensureRecruiter, async (req, res) => {
    try {
      const recruiterId = req.user!.id;
      
      // Get all jobs posted by this recruiter
      const jobs = await storage.getJobPostingsByRecruiter(recruiterId);
      
      // Get applications for all jobs
      const jobsWithApplications = await Promise.all(
        jobs.map(async (job) => {
          const applications = await storage.getApplicationsByJob(job.id);
          return {
            ...job,
            applications: applications.length,
            statusBreakdown: {
              applied: applications.filter(app => app.status === "applied").length,
              under_review: applications.filter(app => app.status === "under_review").length,
              interview_scheduled: applications.filter(app => app.status === "interview_scheduled").length,
              rejected: applications.filter(app => app.status === "rejected").length,
              accepted: applications.filter(app => app.status === "accepted").length
            }
          };
        })
      );
      
      // Aggregate stats
      const activeJobs = jobs.filter(job => job.isActive).length;
      const totalApplications = jobsWithApplications.reduce((sum, job) => sum + job.applications, 0);
      const applicationsByStatus = {
        applied: jobsWithApplications.reduce((sum, job) => sum + job.statusBreakdown.applied, 0),
        under_review: jobsWithApplications.reduce((sum, job) => sum + job.statusBreakdown.under_review, 0),
        interview_scheduled: jobsWithApplications.reduce((sum, job) => sum + job.statusBreakdown.interview_scheduled, 0),
        rejected: jobsWithApplications.reduce((sum, job) => sum + job.statusBreakdown.rejected, 0),
        accepted: jobsWithApplications.reduce((sum, job) => sum + job.statusBreakdown.accepted, 0)
      };
      
      res.json({
        totalJobs: jobs.length,
        activeJobs,
        totalApplications,
        applicationsByStatus,
        jobsWithApplications
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  // ===== Test Routes =====
  
  // Test resume parsing endpoint (no auth required for testing)
  app.post('/api/test/resume-parse', async (req, res) => {
    try {
      const { resumeText } = req.body;
      if (!resumeText) {
        return res.status(400).json({ error: 'Resume text is required' });
      }
      
      console.log('Parsing resume text with length:', resumeText.length);
      const parsedResume = await parseResume(resumeText);
      console.log('Resume parsed successfully');
      res.json(parsedResume);
    } catch (error) {
      console.error('Error parsing resume:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to parse resume', details: errorMessage });
    }
  });
  
  // Serve the resume parser test HTML page
  app.get('/test/resume-parser', (req, res) => {
    res.sendFile('test-resume-parser.html', { root: '.' });
  });

  const httpServer = createServer(app);
  return httpServer;
}
