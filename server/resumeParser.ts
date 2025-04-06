// A module for parsing resume text and extracting structured information

// Import callGroqAPI function and shared types
import { AIMessage, ParsedResume } from './types';
import { callGroqAPI } from './aiService';

/**
 * Parse resume text using AI to extract structured information
 */
export async function parseResume(resumeText: string): Promise<ParsedResume> {
  try {
    const response = await callGroqAPI([
      {
        role: "system",
        content: 
          "You are an AI resume parser. Extract structured information from the resume text provided. " +
          "Include contact information, education history, work experience, skills (technical and soft), " +
          "projects, and a summary if available. Format the response as a JSON object with appropriate fields. " +
          "Be thorough but do not invent information that is not present in the resume."
      },
      {
        role: "user",
        content: `Parse the following resume and extract structured information:\n\n${resumeText}`
      }
    ]);

    // Parse the AI response
    const result = JSON.parse(response.choices[0].message.content);
    
    // Ensure the result matches our expected structure
    return {
      contactInfo: result.contactInfo || {
        name: "",
        email: "",
      },
      education: result.education || [],
      experience: result.experience || [],
      skills: result.skills || {
        technical: [],
        soft: [],
        languages: [],
        certifications: []
      },
      projects: result.projects || [],
      summary: result.summary || ""
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    // Return a minimal structure in case of error
    return {
      contactInfo: {
        name: "",
        email: "",
      },
      education: [],
      experience: [],
      skills: {
        technical: [],
        soft: [],
        languages: [],
        certifications: []
      }
    };
  }
}

/**
 * Extract key skills from a resume using AI
 */
export async function extractSkillsFromResume(resumeText: string): Promise<string[]> {
  try {
    const response = await callGroqAPI([
      {
        role: "system",
        content: 
          "You are an AI skills extractor. Analyze the resume text and identify all technical skills, " +
          "tools, programming languages, frameworks, and technologies mentioned. Return a JSON array of skills " +
          "found in the resume. Be comprehensive but do not invent skills not mentioned in the text."
      },
      {
        role: "user",
        content: `Extract all technical and professional skills from this resume:\n\n${resumeText}`
      }
    ]);

    // Parse the AI response
    const result = JSON.parse(response.choices[0].message.content);
    
    // Ensure we return an array of skills
    return Array.isArray(result) ? result : 
           (result.skills && Array.isArray(result.skills)) ? result.skills : [];
  } catch (error) {
    console.error("Error extracting skills from resume:", error);
    return [];
  }
}

/**
 * Generate a summary of a candidate's background from their resume
 */
export async function generateCandidateSummary(resumeText: string): Promise<string> {
  try {
    const response = await callGroqAPI([
      {
        role: "system",
        content: 
          "You are an AI resume summarizer. Create a concise professional summary based on the resume provided. " +
          "Highlight key qualifications, experience, and skills in 2-3 paragraphs. Use professional language and " +
          "focus on the most impressive and relevant aspects of the candidate's background."
      },
      {
        role: "user",
        content: `Generate a professional summary based on this resume:\n\n${resumeText}`
      }
    ]);

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating candidate summary:", error);
    return "Unable to generate summary due to an error.";
  }
}