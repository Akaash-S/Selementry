// Candidate analysis service
import { storage } from './storage';
import { parseResume, extractSkillsFromResume, generateCandidateSummary } from './resumeParser';
import { analyzeCandidateComprehensive, compareJobFit } from './aiService';
import { fetchLinkedInProfile, fetchTwitterProfile, fetchInstagramProfile, analyzeSocialMediaProfiles } from './socialMedia';
import { CandidateProfile, JobPosting, Application } from '@shared/schema';

// Updated candidate profile type with social media fields
export interface ExtendedCandidateProfile extends CandidateProfile {
  socialProfiles?: {
    linkedIn?: string;
    twitter?: string;
    instagram?: string;
  };
  socialAnalysis?: any;
}

/**
 * Process a candidate's resume and update their profile
 */
export async function processResume(userId: number, resumeText: string): Promise<ExtendedCandidateProfile | null> {
  try {
    // Get the existing profile or create one
    let profile = await storage.getCandidateProfile(userId);
    
    if (!profile) {
      profile = await storage.createCandidateProfile({
        userId,
        skills: [],
        education: "",
        experience: "",
        resumeText: ""
      });
    }
    
    // Parse the resume
    const parsedResume = await parseResume(resumeText);
    
    // Extract skills
    const extractedSkills = await extractSkillsFromResume(resumeText);
    
    // Generate a summary
    const summary = await generateCandidateSummary(resumeText);
    
    // Update the profile with parsed data
    const updatedProfile = await storage.updateCandidateProfile(userId, {
      skills: extractedSkills,
      education: JSON.stringify(parsedResume.education),
      experience: JSON.stringify(parsedResume.experience),
      resumeText: resumeText,
      // Store the structured parsed resume data
      parsedResume: parsedResume,
      contactInfo: parsedResume.contactInfo,
      detailedExperience: parsedResume.experience,
      detailedEducation: parsedResume.education,
      detailedSkills: parsedResume.skills,
      projects: parsedResume.projects || [],
      summary: summary,
      // The AI evaluation will be set in a separate social analysis step
    });
    
    return updatedProfile || null;
  } catch (error) {
    console.error("Error processing resume:", error);
    return null;
  }
}

/**
 * Analyze a candidate's social media profiles
 */
export async function analyzeSocialProfiles(
  userId: number,
  linkedInAccessToken?: string,
  twitterAccessToken?: string,
  instagramAccessToken?: string
): Promise<any> {
  try {
    // Fetch candidate profile
    const profile = await storage.getCandidateProfile(userId);
    if (!profile) {
      throw new Error("Candidate profile not found");
    }
    
    // Get social media IDs from the extended profile if available
    const extendedProfile = profile as ExtendedCandidateProfile;
    const socialProfiles = extendedProfile.socialProfiles || {};
    
    // Fetch profiles from social media platforms if tokens are provided
    const linkedIn = linkedInAccessToken && socialProfiles.linkedIn ? 
      await fetchLinkedInProfile(linkedInAccessToken, socialProfiles.linkedIn) : null;
      
    const twitter = twitterAccessToken && socialProfiles.twitter ? 
      await fetchTwitterProfile(twitterAccessToken, socialProfiles.twitter) : null;
      
    const instagram = instagramAccessToken && socialProfiles.instagram ? 
      await fetchInstagramProfile(instagramAccessToken, socialProfiles.instagram) : null;
    
    // Analyze social media profiles
    const socialAnalysis = await analyzeSocialMediaProfiles(linkedIn, twitter, instagram);
    
    // Update the candidate profile with social analysis
    const updatedProfile = await storage.updateCandidateProfile(userId, {
      aiEvaluation: {
        ...((profile.aiEvaluation as any) || {}),
        socialAnalysis
      }
    });
    
    return socialAnalysis;
  } catch (error) {
    console.error("Error analyzing social profiles:", error);
    throw error;
  }
}

/**
 * Perform a comprehensive analysis of a candidate
 */
export async function analyzeCandidate(userId: number): Promise<any> {
  try {
    // Get candidate profile
    const profile = await storage.getCandidateProfile(userId);
    if (!profile) {
      throw new Error("Candidate profile not found");
    }
    
    // Parse the stored resume text
    const parsedResume = await parseResume(profile.resumeText || "");
    
    // Get social media data if available (extended profile)
    const extendedProfile = profile as ExtendedCandidateProfile;
    const socialAnalysis = extendedProfile.socialAnalysis || null;
    
    // Perform comprehensive analysis
    // This would normally include social media profiles, but we'll use null values for now
    const analysis = await analyzeCandidateComprehensive(
      parsedResume,
      null, // LinkedIn profile
      null, // Twitter profile
      null  // Instagram profile
    );
    
    // Update the candidate profile with the analysis
    const updatedProfile = await storage.updateCandidateProfile(userId, {
      aiEvaluation: analysis
    });
    
    return analysis;
  } catch (error) {
    console.error("Error analyzing candidate:", error);
    throw error;
  }
}

/**
 * Analyze a candidate's fit for a specific job
 */
export async function analyzeCandidateJobFit(candidateId: number, jobId: number): Promise<Application | null> {
  try {
    // Get candidate profile
    const profile = await storage.getCandidateProfile(candidateId);
    if (!profile) {
      throw new Error("Candidate profile not found");
    }
    
    // Get job posting
    const job = await storage.getJobPosting(jobId);
    if (!job) {
      throw new Error("Job posting not found");
    }
    
    // Check if application already exists
    let application = await storage.getApplicationByUserAndJob(candidateId, jobId);
    
    // If no application exists, create one
    if (!application) {
      application = await storage.createApplication({
        candidateId,
        jobId
      });
    }
    
    // Parse the resume
    const parsedResume = profile.resumeText ? 
      await parseResume(profile.resumeText) : 
      { contactInfo: { name: "", email: "" }, education: [], experience: [], skills: { technical: [], soft: [], languages: [], certifications: [] } };
    
    // Compare job fit
    const jobFit = await compareJobFit(
      parsedResume,
      job.title,
      job.description,
      job.skills
    );
    
    // Update the application with the analysis
    const updatedApplication = await storage.updateApplication(application.id, {
      aiScore: jobFit.score,
      aiNotes: JSON.stringify(jobFit)
    });
    
    return updatedApplication || null;
  } catch (error) {
    console.error("Error analyzing job fit:", error);
    return null;
  }
}