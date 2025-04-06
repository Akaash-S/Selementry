import dotenv from 'dotenv';
dotenv.config();

// No need for a client library, we'll use fetch directly
const GROQ_API_KEY = process.env.GROQ_API_KEY || "dummy-key-for-development";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function callGroqAPI(messages: any, responseFormat = { type: "json_object" }) {
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

export interface CandidateAssessment {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  developmentAreas: string[];
  overallFeedback: string;
  skillsMatch: {
    skill: string;
    score: number; // 0-100
  }[];
}

export interface CandidateJobMatch {
  score: number; // 0-100
  feedback: string;
  skillsAnalysis: {
    [key: string]: number; // 0-100
  };
  jobFitReasoning: string;
}

/**
 * Analyzes a candidate's profile against the overall job market
 */
export async function analyzeCandidateProfile(resumeText: string, skills: string[]): Promise<CandidateAssessment> {
  try {
    const response = await callGroqAPI([
      {
        role: "system",
        content: 
          "You are a professional AI talent evaluator. Analyze the candidate resume and skills, then provide a comprehensive evaluation. " +
          "Consider technical skills, experience, education, and other relevant factors. " +
          "Rate the candidate on a scale of 0-100 and identify strengths, weaknesses, and areas for development. " +
          "Format response as JSON."
      },
      {
        role: "user",
        content: `Please evaluate this candidate profile:\n\nResume: ${resumeText}\n\nSkills: ${skills.join(", ")}`
      }
    ]);

    const result = JSON.parse(response.choices[0].message.content);
    return {
      score: Math.max(0, Math.min(100, result.score || 75)),
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      developmentAreas: result.developmentAreas || [],
      overallFeedback: result.overallFeedback || "",
      skillsMatch: result.skillsMatch || []
    };
  } catch (error) {
    console.error("Error analyzing candidate profile:", error);
    // Return a fallback assessment in case of API error
    return {
      score: 50,
      strengths: ["Unable to analyze strengths due to API error"],
      weaknesses: ["Unable to analyze weaknesses due to API error"],
      developmentAreas: ["Unable to analyze development areas due to API error"],
      overallFeedback: "Unable to generate feedback due to an error with the AI service.",
      skillsMatch: []
    };
  }
}

/**
 * Analyzes a candidate's fit for a specific job posting
 */
export async function analyzeCandidateJobMatch(
  resumeText: string, 
  candidateSkills: string[], 
  jobTitle: string, 
  jobDescription: string, 
  jobSkills: string[]
): Promise<CandidateJobMatch> {
  try {
    const response = await callGroqAPI([
      {
        role: "system",
        content: 
          "You are a professional AI recruiter. Analyze the candidate's resume and skills against the job requirements. " +
          "Provide a match score (0-100), detailed feedback, and a skills analysis. " +
          "Format your response as JSON with the following structure: " +
          "{\"score\": number, \"feedback\": string, \"skillsAnalysis\": {\"skill1\": score1, ...}, \"jobFitReasoning\": string}"
      },
      {
        role: "user",
        content: 
          `Candidate Resume: ${resumeText}\n\n` +
          `Candidate Skills: ${candidateSkills.join(", ")}\n\n` +
          `Job Title: ${jobTitle}\n\n` +
          `Job Description: ${jobDescription}\n\n` +
          `Job Skills Required: ${jobSkills.join(", ")}`
      }
    ]);

    const result = JSON.parse(response.choices[0].message.content);
    return {
      score: Math.max(0, Math.min(100, result.score || 50)),
      feedback: result.feedback || "",
      skillsAnalysis: result.skillsAnalysis || {},
      jobFitReasoning: result.jobFitReasoning || ""
    };
  } catch (error) {
    console.error("Error analyzing job match:", error);
    // Return a fallback match in case of API error
    return {
      score: 50,
      feedback: "Unable to generate feedback due to an error with the AI service.",
      skillsAnalysis: {},
      jobFitReasoning: "Unable to analyze job fit due to an error with the AI service."
    };
  }
}

/**
 * Provides recommendations for candidates based on their profile
 */
export async function getCareerRecommendations(
  resumeText: string, 
  skills: string[]
): Promise<{ recommendations: string[], explanation: string }> {
  try {
    const response = await callGroqAPI([
      {
        role: "system",
        content: 
          "You are a career advisor AI. Based on the candidate's resume and skills, " +
          "suggest career development recommendations. Focus on skills to develop, " +
          "certifications to pursue, and career paths that would be beneficial. " +
          "Format your response as JSON with the following structure: " +
          "{\"recommendations\": [\"recommendation1\", \"recommendation2\", ...], \"explanation\": \"detailed explanation\"}"
      },
      {
        role: "user",
        content: `Resume: ${resumeText}\n\nSkills: ${skills.join(", ")}`
      }
    ]);

    const result = JSON.parse(response.choices[0].message.content);
    return {
      recommendations: result.recommendations || [],
      explanation: result.explanation || ""
    };
  } catch (error) {
    console.error("Error generating career recommendations:", error);
    return {
      recommendations: ["Unable to generate recommendations due to an error with the AI service."],
      explanation: "An error occurred when attempting to analyze your profile."
    };
  }
}
