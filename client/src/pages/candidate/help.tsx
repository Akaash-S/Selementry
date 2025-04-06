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
import { HelpCircle, MessageSquare, Search, AlertCircle, Phone, Clock, Headphones } from "lucide-react";

export default function CandidateHelp() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  
  // FAQ data
  const faqs = [
    {
      question: "How do I create an effective profile?",
      answer: "To create an effective profile, make sure to fully complete all sections including your skills, work experience, and education. Upload a professional photo and ensure your resume is up-to-date. Use the AI resume parser to extract structured information from your resume for better job matching."
    },
    {
      question: "How does the AI-powered matching work?",
      answer: "Our AI matching algorithm analyzes your profile, resume, and preferences against job requirements to find the best matches. The system considers technical skills, years of experience, education, and even soft skills to provide personalized job recommendations and insights."
    },
    {
      question: "Can recruiters see all my information?",
      answer: "Recruiters can only see the information you've chosen to make public in your privacy settings. You can control which parts of your profile are visible and whether recruiters can contact you directly through the platform."
    },
    {
      question: "How do I apply for a job?",
      answer: "Browse available jobs from the 'Browse Jobs' section, view job details, and click the 'Apply' button on jobs you're interested in. You can customize your application for each position before submitting it."
    },
    {
      question: "What should I do if I don't hear back after applying?",
      answer: "It's common for the hiring process to take time. If you haven't heard back after two weeks, you can check your application status in the 'My Applications' section. You can also follow up with a polite message to the recruiter if their contact information is available."
    },
    {
      question: "How can I improve my chances of getting interviews?",
      answer: "Tailor your resume and application to each job you apply for, highlighting relevant skills and experience. Complete your profile fully and keep your information up-to-date. Use the AI insights to identify skills gaps you might want to address to become more competitive."
    },
    {
      question: "How do I delete my account?",
      answer: "You can delete your account from the Settings > Privacy page. Click on the 'Delete my account' button at the bottom of the page. Please note that this action is permanent and will remove all your data from our system."
    },
    {
      question: "What happens to my data when I use the AI resume parser?",
      answer: "When you use the AI resume parser, your resume is analyzed to extract structured information which is then stored in your profile. This data helps match you with relevant jobs and provide career insights. Your data is kept secure and used according to our privacy policy."
    }
  ];
  
  // Filtered FAQs based on search query
  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;
  
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
    });
  };
  
  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Help & Support</h1>
          <p className="mt-1 text-sm text-gray-500">Get answers to your questions and contact support</p>
        </div>
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
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search for answers..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
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
                  
                  <Alert>
                    <Headphones className="h-4 w-4" />
                    <AlertTitle>Support response times</AlertTitle>
                    <AlertDescription>
                      We typically respond to support requests within 24 hours during business days.
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
                          <h4 className="font-medium">Call Us</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            1-800-555-0123<br />
                            Mon-Fri, 9am-6pm EST
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex items-start">
                        <div className="bg-primary-50 p-2 rounded-md mr-3">
                          <MessageSquare className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Live Chat</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            Chat with our support team<br />
                            Available during business hours
                          </p>
                          <Button variant="link" className="p-0 h-auto text-sm mt-1">
                            Start Chat
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