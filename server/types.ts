// Common types used across multiple server files

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ParsedResume {
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    website?: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    achievements?: string[];
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    achievements?: string[];
    technologies?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    certifications: string[];
  };
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string[];
    url?: string;
  }>;
  summary?: string;
}