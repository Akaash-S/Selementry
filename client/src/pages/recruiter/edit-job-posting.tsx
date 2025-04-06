import { useParams } from "wouter";
import JobPostingForm from "./job-posting-form";

export default function EditJobPosting() {
  const params = useParams<{ id: string }>();
  const jobId = params?.id ? parseInt(params.id) : undefined;
  
  if (!jobId) {
    return <div>Job ID is required</div>;
  }
  
  return <JobPostingForm jobId={jobId} />;
}