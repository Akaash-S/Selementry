// Central service for all AI-related functionalities

// Import shared types
import { AIMessage, ParsedResume } from './types';

// Import types from socialMedia.ts
import { LinkedInProfile, TwitterProfile, InstagramProfile, SocialMediaAnalysis } from './socialMedia';
import dotenv from 'dotenv';
dotenv.config();

// No need for a client library, we'll use fetch directly
const GROQ_API_KEY = process.env.GROQ_API_KEY || "dummy-key-for-development";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function callGroqAPI(messages: AIMessage[], responseFormat = { type: "json_object" }) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      response_format: responseFormat
    })
  });
  
  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Comprehensive candidate analysis that combines resume data and social media profiles
 */
export interface ComprehensiveCandidateAnalysis {
  overallScore: number; // 0-100
  candidateAssessment: {
    professionalBackground: {
      score: number; // 0-100
      strengths: string[];
      weaknesses: string[];
      experience: string; // Summary of experience
    };
    skills: {
      technical: {
        score: number; // 0-100
        strengths: string[];
        gaps: string[];
      };
      soft: {
        score: number; // 0-100
        strengths: string[];
        areas_for_improvement: string[];
      };
    };
    education: {
      score: number; // 0-100
      relevance: string; // How relevant education is to career
      notes: string;
    };
  };
  socialMediaInsights: {
    professionalBrand: {
      score: number; // 0-100
      strengths: string[];
      improvement_areas: string[];
    };
    communication: {
      score: number; // 0-100
      style: string;
      tone: string;
      consistency: string;
    };
    redFlags: string[];
    opportunities: string[];
  };
  careerRecommendations: string[];
  developmentPlan: {
    shortTerm: string[];
    longTerm: string[];
  };
}

/**
 * Analyze a candidate using both resume data and social media profiles
 */
export async function analyzeCandidateComprehensive(
  resumeData: ParsedResume,
  linkedIn: LinkedInProfile | null,
  twitter: TwitterProfile | null,
  instagram: InstagramProfile | null
): Promise<ComprehensiveCandidateAnalysis> {
  try {
    // Prepare the input data for AI analysis
    const candidateData = {
      resume: resumeData,
      socialProfiles: {
        linkedIn: linkedIn || null,
        twitter: twitter || null,
        instagram: instagram || null
      }
    };

    const response = await callGroqAPI([
      {
        role: "system",
        content: 
          "You are an AI talent evaluator with expertise in analyzing professional backgrounds and social media presence. " +
          "Provide a comprehensive candidate assessment based on both their resume data and social media profiles. " +
          "Consider technical skills, experience, education, communication style, professional brand, and online presence. " +
          "Identify strengths, weaknesses, opportunities, and potential red flags. " +
          "Recommend career development paths and provide both short-term and long-term development plans. " +
          "Format your response as a detailed JSON object."
      },
      {
        role: "user",
        content: `Analyze this candidate's information:\n\n${JSON.stringify(candidateData, null, 2)}`
      }
    ]);

    const result = JSON.parse(response.choices[0].message.content);
    
    // Ensure the result has the required structure
    return {
      overallScore: result.overallScore || 50,
      candidateAssessment: result.candidateAssessment || {
        professionalBackground: {
          score: 50,
          strengths: [],
          weaknesses: [],
          experience: "No data available"
        },
        skills: {
          technical: {
            score: 50,
            strengths: [],
            gaps: []
          },
          soft: {
            score: 50,
            strengths: [],
            areas_for_improvement: []
          }
        },
        education: {
          score: 50,
          relevance: "No data available",
          notes: "No data available"
        }
      },
      socialMediaInsights: result.socialMediaInsights || {
        professionalBrand: {
          score: 0,
          strengths: [],
          improvement_areas: ["No social media data available"]
        },
        communication: {
          score: 0,
          style: "Unknown",
          tone: "Unknown",
          consistency: "Unknown"
        },
        redFlags: [],
        opportunities: ["Connect social media accounts for comprehensive analysis"]
      },
      careerRecommendations: result.careerRecommendations || [],
      developmentPlan: result.developmentPlan || {
        shortTerm: [],
        longTerm: []
      }
    };
  } catch (error) {
    console.error("Error in comprehensive candidate analysis:", error);
    // Return a structured error response
    return {
      overallScore: 0,
      candidateAssessment: {
        professionalBackground: {
          score: 0,
          strengths: [],
          weaknesses: [],
          experience: "Error analyzing resume data"
        },
        skills: {
          technical: {
            score: 0,
            strengths: [],
            gaps: []
          },
          soft: {
            score: 0,
            strengths: [],
            areas_for_improvement: []
          }
        },
        education: {
          score: 0,
          relevance: "Error analyzing education data",
          notes: "Error analyzing education data"
        }
      },
      socialMediaInsights: {
        professionalBrand: {
          score: 0,
          strengths: [],
          improvement_areas: ["Error analyzing social media data"]
        },
        communication: {
          score: 0,
          style: "Error",
          tone: "Error",
          consistency: "Error"
        },
        redFlags: ["Analysis error occurred"],
        opportunities: ["Try again later"]
      },
      careerRecommendations: ["Unable to generate recommendations due to an error"],
      developmentPlan: {
        shortTerm: ["Try again later"],
        longTerm: ["Try again later"]
      }
    };
  }
}

/**
 * Compare a candidate against a specific job using AI analysis
 */
export async function compareJobFit(
  candidateResume: ParsedResume,
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[]
): Promise<{
  score: number;
  analysis: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}> {
  try {
    const response = await callGroqAPI([
      {
        role: "system",
        content: 
          "You are an AI recruitment specialist. Compare a candidate's resume with a job description " +
          "and evaluate how well they match. Provide a match score (0-100), detailed analysis, " +
          "strengths, skill gaps, and a hiring recommendation. Format your response as a JSON object."
      },
      {
        role: "user",
        content: 
          `Candidate Resume: ${JSON.stringify(candidateResume, null, 2)}\n\n` +
          `Job Title: ${jobTitle}\n\n` +
          `Job Description: ${jobDescription}\n\n` +
          `Required Skills: ${requiredSkills.join(', ')}`
      }
    ]);

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      score: result.score || 50,
      analysis: result.analysis || "No analysis available",
      strengths: result.strengths || [],
      gaps: result.gaps || [],
      recommendation: result.recommendation || "No recommendation available"
    };
  } catch (error) {
    console.error("Error in job fit comparison:", error);
    return {
      score: 0,
      analysis: "Error occurred during analysis",
      strengths: [],
      gaps: [],
      recommendation: "Unable to provide recommendation due to error"
    };
  }
}