import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ResumeParserProps {
  onResumeProcessed: (resumeText: string, parsedData: any) => void;
}

export function ResumeParser({ onResumeProcessed }: ResumeParserProps) {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState(false);
  
  const handleResumeProcess = async () => {
    if (!resumeText || resumeText.trim().length < 50) {
      toast({
        title: "Invalid resume text",
        description: "Please enter a valid resume text (minimum 50 characters).",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setProcessingError(null);
    setProcessingSuccess(false);
    
    try {
      const res = await apiRequest("POST", "/api/candidate/resume/analyze", { resumeText });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to process resume");
      }
      
      setProcessingSuccess(true);
      onResumeProcessed(resumeText, data);
      
      toast({
        title: "Resume processed successfully",
        description: "Your resume has been analyzed and your profile has been updated with the extracted information.",
      });
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Resume processing failed",
        description: error instanceof Error ? error.message : "An unknown error occurred while processing your resume.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Resume Parser</CardTitle>
        <CardDescription>
          Let our AI analyze your resume to extract structured information and provide insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Copy and paste your full resume text here..."
            className="min-h-[200px] resize-y"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            disabled={isProcessing}
          />
          
          {processingError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{processingError}</AlertDescription>
            </Alert>
          )}
          
          {processingSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your resume has been successfully processed and your profile has been updated.
              </AlertDescription>
            </Alert>
          )}
          
          <Button
            onClick={handleResumeProcess}
            disabled={isProcessing || resumeText.trim().length < 50}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Process Resume with AI
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 mt-2">
            Our AI will extract information such as skills, experience, education, and contact details 
            from your resume text. This helps us provide better job matches and career insights.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}