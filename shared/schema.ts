import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Types: 'candidate' or 'recruiter'
export const userRoleEnum = z.enum(["candidate", "recruiter"]);
export type UserRole = z.infer<typeof userRoleEnum>;

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["candidate", "recruiter"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Job Postings Table
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  salary: text("salary"),
  jobType: text("job_type").notNull(), // Full-time, Part-time, Contract
  department: text("department").notNull(),
  skills: text("skills").array().notNull(),
  recruiterId: integer("recruiter_id").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobPostingSchema = createInsertSchema(jobPostings)
  .omit({ id: true, createdAt: true });

export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;

// Applications Table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  jobId: integer("job_id").notNull(),
  status: text("status", { enum: ["applied", "under_review", "interview_scheduled", "rejected", "accepted"] }).notNull().default("applied"),
  aiScore: integer("ai_score"), // 0-100 score
  aiNotes: text("ai_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applications)
  .omit({ id: true, status: true, aiScore: true, aiNotes: true, createdAt: true, updatedAt: true });

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Candidate Profiles
export const candidateProfiles = pgTable("candidate_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  skills: text("skills").array(),
  experience: text("experience"),
  education: text("education"),
  resumeText: text("resume_text"),
  parsedResume: json("parsed_resume"),
  contactInfo: json("contact_info"),
  detailedExperience: json("detailed_experience"),
  detailedEducation: json("detailed_education"),
  detailedSkills: json("detailed_skills"),
  projects: json("projects"),
  summary: text("summary"),
  aiEvaluation: json("ai_evaluation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCandidateProfileSchema = createInsertSchema(candidateProfiles)
  .omit({ id: true, aiEvaluation: true, createdAt: true, updatedAt: true });

export type InsertCandidateProfile = z.infer<typeof insertCandidateProfileSchema>;
export type CandidateProfile = typeof candidateProfiles.$inferSelect;

// Recruiter Profiles
export const recruiterProfiles = pgTable("recruiter_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  company: text("company").notNull(),
  position: text("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecruiterProfileSchema = createInsertSchema(recruiterProfiles)
  .omit({ id: true, createdAt: true });

export type InsertRecruiterProfile = z.infer<typeof insertRecruiterProfileSchema>;
export type RecruiterProfile = typeof recruiterProfiles.$inferSelect;
