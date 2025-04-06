import { users, type User, type InsertUser } from "@shared/schema";
import { applications, type Application, type InsertApplication } from "@shared/schema";
import { jobPostings, type JobPosting, type InsertJobPosting } from "@shared/schema";
import { candidateProfiles, type CandidateProfile, type InsertCandidateProfile } from "@shared/schema";
import { recruiterProfiles, type RecruiterProfile, type InsertRecruiterProfile } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { Store } from "express-session";
import createMemoryStore from "memorystore";
import pg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresStore = pg(session);

// Storage interface for all CRUD operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job Postings
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  getJobPostings(limit?: number, offset?: number): Promise<JobPosting[]>;
  getJobPostingsByRecruiter(recruiterId: number): Promise<JobPosting[]>;
  getActiveJobPostings(limit?: number, offset?: number): Promise<JobPosting[]>;
  createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting>;
  updateJobPosting(id: number, jobPosting: Partial<JobPosting>): Promise<JobPosting | undefined>;
  
  // Applications
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByCandidate(candidateId: number): Promise<Application[]>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  getApplicationByUserAndJob(candidateId: number, jobId: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<Application>): Promise<Application | undefined>;
  
  // Candidate Profiles
  getCandidateProfile(userId: number): Promise<CandidateProfile | undefined>;
  getAllCandidateProfiles(): Promise<CandidateProfile[]>;
  createCandidateProfile(profile: InsertCandidateProfile): Promise<CandidateProfile>;
  updateCandidateProfile(userId: number, profile: Partial<CandidateProfile>): Promise<CandidateProfile | undefined>;
  
  // Recruiter Profiles
  getRecruiterProfile(userId: number): Promise<RecruiterProfile | undefined>;
  createRecruiterProfile(profile: InsertRecruiterProfile): Promise<RecruiterProfile>;
  updateRecruiterProfile(userId: number, profile: Partial<RecruiterProfile>): Promise<RecruiterProfile | undefined>;
  
  // Session store
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    // Use PostgreSQL session store with connect-pg-simple
    this.sessionStore = new PostgresStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Job Postings
  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    const result = await db.select().from(jobPostings).where(eq(jobPostings.id, id));
    return result[0];
  }

  async getJobPostings(limit?: number, offset?: number): Promise<JobPosting[]> {
    const query = db.select().from(jobPostings).orderBy(desc(jobPostings.createdAt));
    const result = await query;
    
    if (limit !== undefined && offset !== undefined) {
      return result.slice(offset, offset + limit);
    } else if (limit !== undefined) {
      return result.slice(0, limit);
    }
    
    return result;
  }

  async getJobPostingsByRecruiter(recruiterId: number): Promise<JobPosting[]> {
    return await db.select()
      .from(jobPostings)
      .where(eq(jobPostings.recruiterId, recruiterId));
  }

  async getActiveJobPostings(limit?: number, offset?: number): Promise<JobPosting[]> {
    const query = db.select()
      .from(jobPostings)
      .where(eq(jobPostings.isActive, true))
      .orderBy(desc(jobPostings.createdAt));
    
    const result = await query;
    
    if (limit !== undefined && offset !== undefined) {
      return result.slice(offset, offset + limit);
    } else if (limit !== undefined) {
      return result.slice(0, limit);
    }
    
    return result;
  }

  async createJobPosting(insertJobPosting: InsertJobPosting): Promise<JobPosting> {
    const result = await db.insert(jobPostings)
      .values(insertJobPosting)
      .returning();
    return result[0];
  }

  async updateJobPosting(id: number, jobPosting: Partial<JobPosting>): Promise<JobPosting | undefined> {
    const result = await db.update(jobPostings)
      .set(jobPosting)
      .where(eq(jobPostings.id, id))
      .returning();
    return result[0];
  }

  // Applications
  async getApplication(id: number): Promise<Application | undefined> {
    const result = await db.select().from(applications).where(eq(applications.id, id));
    return result[0];
  }

  async getApplicationsByCandidate(candidateId: number): Promise<Application[]> {
    return await db.select()
      .from(applications)
      .where(eq(applications.candidateId, candidateId));
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return await db.select()
      .from(applications)
      .where(eq(applications.jobId, jobId));
  }

  async getApplicationByUserAndJob(candidateId: number, jobId: number): Promise<Application | undefined> {
    const result = await db.select()
      .from(applications)
      .where(and(
        eq(applications.candidateId, candidateId),
        eq(applications.jobId, jobId)
      ));
    return result[0];
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const now = new Date();
    const data = {
      ...insertApplication,
      status: "applied" as const,
      createdAt: now,
      updatedAt: now
    };
    const result = await db.insert(applications)
      .values(data)
      .returning();
    return result[0];
  }

  async updateApplication(id: number, application: Partial<Application>): Promise<Application | undefined> {
    const result = await db.update(applications)
      .set({
        ...application,
        updatedAt: new Date()
      })
      .where(eq(applications.id, id))
      .returning();
    return result[0];
  }

  // Candidate Profiles
  async getCandidateProfile(userId: number): Promise<CandidateProfile | undefined> {
    const result = await db.select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId));
    return result[0];
  }
  
  async getAllCandidateProfiles(): Promise<CandidateProfile[]> {
    return await db.select()
      .from(candidateProfiles)
      .orderBy(desc(candidateProfiles.updatedAt));
  }

  async createCandidateProfile(insertProfile: InsertCandidateProfile): Promise<CandidateProfile> {
    const now = new Date();
    const result = await db.insert(candidateProfiles)
      .values({
        ...insertProfile,
        aiEvaluation: {},
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return result[0];
  }

  async updateCandidateProfile(userId: number, profileUpdate: Partial<CandidateProfile>): Promise<CandidateProfile | undefined> {
    const result = await db.update(candidateProfiles)
      .set({
        ...profileUpdate,
        updatedAt: new Date()
      })
      .where(eq(candidateProfiles.userId, userId))
      .returning();
    return result[0];
  }

  // Recruiter Profiles
  async getRecruiterProfile(userId: number): Promise<RecruiterProfile | undefined> {
    const result = await db.select()
      .from(recruiterProfiles)
      .where(eq(recruiterProfiles.userId, userId));
    return result[0];
  }

  async createRecruiterProfile(insertProfile: InsertRecruiterProfile): Promise<RecruiterProfile> {
    const result = await db.insert(recruiterProfiles)
      .values({
        ...insertProfile,
        createdAt: new Date()
      })
      .returning();
    return result[0];
  }

  async updateRecruiterProfile(userId: number, profileUpdate: Partial<RecruiterProfile>): Promise<RecruiterProfile | undefined> {
    const result = await db.update(recruiterProfiles)
      .set(profileUpdate)
      .where(eq(recruiterProfiles.userId, userId))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();