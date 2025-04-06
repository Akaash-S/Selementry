import { useState } from "react";
import { PortalContainer } from "@/components/layout/portal-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircle, MessageSquare, Search, AlertCircle, Phone, Clock, Headphones, File, BookOpen, Play, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RecruiterHelp() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    priority: "normal"
  });
  
  // FAQ data
  const faqs = [
    {
      question: "How do I create a job posting?",
      answer: "To create a job posting, navigate to the 'Job Postings' page from the sidebar menu. Click on the 'Create Job Posting' button and fill in all the required information including job title, description, requirements, and qualifications. You can also specify whether the AI should analyze candidates for this position automatically."
    },
    {
      question: "How does the AI candidate matching work?",
      answer: "Our AI candidate matching analyzes resumes and candidate profiles against your job requirements to identify the best matches. The system evaluates technical skills, experience, education, and even soft skills extracted from social media profiles (with candidate permission). Each candidate receives a match score and detailed analysis explaining why they might be a good fit."
    },
    {
      question: "Can I customize the screening questions?",
      answer: "Yes, you can customize screening questions for each job posting. When creating or editing a job posting, scroll to the 'Screening Questions' section and click 'Add Question'. You can create multiple-choice, yes/no, or free text questions. The AI will analyze responses as part of the candidate evaluation."
    },
    {
      question: "How do I schedule interviews with candidates?",
      answer: "To schedule interviews, go to the candidate's profile and click the 'Schedule Interview' button. Select the interview type (video, phone, or in-person), date, time, and add any notes or preparation instructions for the candidate. The system will send an automatic invitation to the candidate and add the interview to your calendar."
    },
    {
      question: "How can I interpret the candidate analytics?",
      answer: "The candidate analytics show a comprehensive evaluation of the candidate's skills, experience, and fit for the role. The overall match score indicates general compatibility, while detailed breakdowns show strengths and gaps in specific areas. Look for the 'AI Insights' section for explanations of why the candidate might be suitable or where additional assessment may be needed."
    },
    {
      question: "How do I integrate with my company's ATS?",
      answer: "To integrate with your existing Applicant Tracking System, go to Settings > Integrations and select your ATS provider from the list. Follow the setup wizard to establish the connection. You'll need API credentials from your ATS provider. Once integrated, you can sync jobs, candidates, and status updates between systems."
    },
    {
      question: "Can I export candidate data?",
      answer: "Yes, you can export candidate data in several formats. From the Candidates page, select the candidates you want to export (or use filters to select a group), then click 'Export' and choose your preferred format (CSV, Excel, or PDF). You can customize which fields to include in the export."
    },
    {
      question: "How do I manage team access and permissions?",
      answer: "Team access and permissions can be managed from Settings > Team. Click 'Invite Team Member' to add new users, assigning them roles like Admin, Recruiter, or Hiring Manager. You can customize access levels for each team member, controlling which actions they can perform and which data they can view."
    }
  ];
  
  // Tutorial data
  const tutorials = [
    {
      id: 1,
      title: "Getting Started with SELEMENTRY",
      description: "Learn the basics of setting up your recruiter account and navigating the platform",
      duration: "5 min",
      link: "#"
    },
    {
      id: 2,
      title: "Creating Effective Job Postings",
      description: "Best practices for writing job descriptions that attract qualified candidates",
      duration: "8 min",
      link: "#"
    },
    {
      id: 3,
      title: "Understanding AI Candidate Matching",
      description: "How to interpret AI matching scores and analytics for better hiring decisions",
      duration: "12 min",
      link: "#"
    },
    {
      id: 4,
      title: "Advanced Candidate Filtering",
      description: "Master the search and filter tools to find the perfect candidates quickly",
      duration: "7 min",
      link: "#"
    },
    {
      id: 5,
      title: "Managing the Interview Process",
      description: "Scheduling, conducting, and evaluating candidate interviews efficiently",
      duration: "10 min",
      link: "#"
    },
    {
      id: 6,
      title: "Collaborating with Your Hiring Team",
      description: "How to share candidates, gather feedback, and make collective decisions",
      duration: "6 min",
      link: "#"
    }
  ];
  
  // Resource data
  const resources = [
    {
      id: 1,
      title: "Complete Recruiter Guide",
      description: "Comprehensive documentation covering all features and workflows",
      type: "PDF",
      link: "#"
    },
    {
      id: 2,
      title: "AI Matching Technology Whitepaper",
      description: "Technical explanation of our AI matching algorithms and methodologies",
      type: "PDF",
      link: "#"
    },
    {
      id: 3,
      title: "Effective Screening Questions Template",
      description: "Ready-to-use question templates for different job categories",
      type: "DOCX",
      link: "#"
    },
    {
      id: 4,
      title: "Interview Scorecard Template",
      description: "Standardized evaluation form for candidate interviews",
      type: "XLSX",
      link: "#"
    },
    {
      id: 5,
      title: "Recruitment Metrics Dashboard Guide",
      description: "How to track and improve your recruitment performance metrics",
      type: "PDF",
      link: "#"
    }
  ];
  
  // Filtered FAQs based on search query
  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;
  
  // Filtered tutorials based on search query
  const filteredTutorials = searchQuery
    ? tutorials.filter(tutorial => 
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tutorials;
  
  // Filtered resources based on search query
  const filteredResources = searchQuery
    ? resources.filter(resource => 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : resources;
  
  // Handle contact form submission
  const handleSubmitContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.subject || !contactForm.message) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would submit this to an API
    toast({
      title: "Support request submitted",
      description: "We've received your message and will respond shortly",
    });
    
    // Reset form
    setContactForm({
      subject: "",
      message: "",
      priority: "normal"
    });
  };
  
  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Help & Support</h1>
          <p className="mt-1 text-sm text-gray-500">Get answers to your questions and find resources</p>
        </div>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input 
          placeholder="Search for help articles, tutorials, and resources..." 
          className="pl-10 py-6 text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar navigation */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "faq" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("faq")}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  FAQ
                </Button>
                
                <Button
                  variant={activeTab === "tutorials" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("tutorials")}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Tutorials
                </Button>
                
                <Button
                  variant={activeTab === "resources" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("resources")}
                >
                  <File className="h-4 w-4 mr-2" />
                  Resources
                </Button>
                
                <Button
                  variant={activeTab === "contact" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("contact")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </nav>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Support Hours</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex items-start mb-2">
                <Clock className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                <div>
                  <p className="font-medium">Monday - Friday</p>
                  <p className="text-gray-500">9:00 AM - 6:00 PM EST</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>1-800-555-0123</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-3">
          {activeTab === "faq" && (
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about using the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFaqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-gray-600">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No results found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search or browse the FAQ sections
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {activeTab === "tutorials" && (
            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>
                  Learn how to use the platform with step-by-step video guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTutorials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTutorials.map((tutorial) => (
                      <div key={tutorial.id} className="border rounded-md overflow-hidden">
                        <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
                          <Play className="h-10 w-10 text-gray-400" />
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {tutorial.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium">{tutorial.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{tutorial.description}</p>
                          <Button variant="link" className="p-0 h-auto text-sm mt-2 flex items-center">
                            Watch tutorial
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No tutorials found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search or browse all tutorials
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {activeTab === "resources" && (
            <Card>
              <CardHeader>
                <CardTitle>Resources & Downloads</CardTitle>
                <CardDescription>
                  Access helpful documentation, templates, and guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="mb-6">
                  <TabsList>
                    <TabsTrigger value="all">All Resources</TabsTrigger>
                    <TabsTrigger value="guides">Guides</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="technical">Technical Docs</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {filteredResources.length > 0 ? (
                  <div className="space-y-4">
                    {filteredResources.map((resource) => (
                      <div key={resource.id} className="flex border rounded-md p-4">
                        <div className="w-10 h-10 bg-primary-50 rounded-md flex items-center justify-center mr-4 flex-shrink-0">
                          <File className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{resource.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                            </div>
                            <span className="text-xs text-gray-500 font-medium bg-gray-100 rounded px-2 py-1">
                              {resource.type}
                            </span>
                          </div>
                          <Button variant="link" className="p-0 h-auto text-sm mt-2 flex items-center">
                            Download
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search or browse all resources
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {activeTab === "contact" && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get help from our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitContactForm} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="What do you need help with?"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue in detail..."
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="priority" className="block text-sm font-medium">
                      Priority
                    </label>
                    <select
                      id="priority"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={contactForm.priority}
                      onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                    >
                      <option value="low">Low - General question</option>
                      <option value="normal">Normal - Need assistance</option>
                      <option value="high">High - Something isn't working</option>
                      <option value="urgent">Urgent - Critical issue</option>
                    </select>
                  </div>
                  
                  <Alert>
                    <Headphones className="h-4 w-4" />
                    <AlertTitle>Support response times</AlertTitle>
                    <AlertDescription>
                      For urgent issues, we typically respond within 2 hours during business hours.
                      Normal priority tickets are addressed within 24 hours.
                    </AlertDescription>
                  </Alert>
                  
                  <Button type="submit" className="w-full sm:w-auto">
                    Submit Support Request
                  </Button>
                </form>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Other Ways to Get Help</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md">
                      <div className="flex items-start">
                        <div className="bg-primary-50 p-2 rounded-md mr-3">
                          <Phone className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Premium Support</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            1-800-555-0123<br />
                            Available for Enterprise customers
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex items-start">
                        <div className="bg-primary-50 p-2 rounded-md mr-3">
                          <BookOpen className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Knowledge Base</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Browse our extensive documentation<br />
                            with step-by-step guides
                          </p>
                          <Button variant="link" className="p-0 h-auto text-sm mt-1">
                            Visit Knowledge Base
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PortalContainer>
  );
}