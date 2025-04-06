import { useState } from "react";
import { PortalContainer } from "@/components/layout/portal-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { 
  Building, 
  MapPin, 
  Globe, 
  Users, 
  Briefcase, 
  Pencil, 
  Share2,
  Info,
  FileText,
  Image,
  Upload,
  Plus,
  X,
  AlertTriangle
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const companyProfileSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  size: z.string().min(1, "Company size is required"),
  founded: z.string().min(1, "Founded year is required"),
  website: z.string().url("Website must be a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  mission: z.string().optional(),
  values: z.string().optional(),
  headquarters: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State/Province is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  socialMedia: z.object({
    linkedin: z.string().url("LinkedIn URL must be valid").or(z.literal("")),
    twitter: z.string().url("Twitter URL must be valid").or(z.literal("")),
    facebook: z.string().url("Facebook URL must be valid").or(z.literal("")),
    instagram: z.string().url("Instagram URL must be valid").or(z.literal("")),
  }),
});

type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

export default function RecruiterCompanyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [companyPhotos, setCompanyPhotos] = useState<string[]>([]);
  const [benefitsList, setBenefitsList] = useState([
    { id: 1, name: "Health Insurance", description: "Comprehensive medical, dental, and vision coverage" },
    { id: 2, name: "Flexible Work Hours", description: "Work when you're most productive" },
    { id: 3, name: "Remote Work Options", description: "Work from home or anywhere in the world" },
    { id: 4, name: "Professional Development", description: "Budget for conferences, courses, and educational materials" },
    { id: 5, name: "Paid Time Off", description: "Generous vacation and personal days allowance" },
  ]);
  const [newBenefit, setNewBenefit] = useState({ name: "", description: "" });
  
  // Mock initial data for form
  const defaultValues: CompanyProfileFormValues = {
    name: "TechSolutions Inc.",
    industry: "technology",
    size: "51-200",
    founded: "2015",
    website: "https://techsolutions.example.com",
    description: "TechSolutions Inc. is a leading technology company specializing in innovative software solutions for businesses of all sizes. We focus on creating cutting-edge products that transform how organizations operate and engage with their customers.",
    mission: "Our mission is to empower businesses through technology, making complex processes simple and accessible to all.",
    values: "Innovation, Excellence, Integrity, Collaboration, Customer Success",
    headquarters: {
      street: "123 Tech Avenue, Suite 500",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      country: "USA",
    },
    socialMedia: {
      linkedin: "https://linkedin.com/company/techsolutions",
      twitter: "https://twitter.com/techsolutions",
      facebook: "https://facebook.com/techsolutions",
      instagram: "https://instagram.com/techsolutions",
    },
  };
  
  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues,
  });
  
  // Update company profile mutation
  const updateCompanyProfileMutation = useMutation({
    mutationFn: async (data: CompanyProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/company/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company/profile"] });
      setEditMode(false);
      toast({
        title: "Profile updated",
        description: "Your company profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSaveProfile = (values: CompanyProfileFormValues) => {
    // In a real app, this would be sent to the server
    console.log("Saving company profile:", values);
    
    // For now, just show success message
    toast({
      title: "Profile updated",
      description: "Your company profile has been successfully updated.",
    });
    
    setEditMode(false);
  };
  
  const handleAddBenefit = () => {
    if (!newBenefit.name || !newBenefit.description) {
      toast({
        title: "Invalid benefit",
        description: "Both name and description are required",
        variant: "destructive",
      });
      return;
    }
    
    setBenefitsList([
      ...benefitsList,
      {
        id: Math.max(0, ...benefitsList.map(b => b.id)) + 1,
        name: newBenefit.name,
        description: newBenefit.description,
      },
    ]);
    
    setNewBenefit({ name: "", description: "" });
  };
  
  const handleRemoveBenefit = (id: number) => {
    setBenefitsList(benefitsList.filter(benefit => benefit.id !== id));
  };
  
  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Company Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your company's public profile and information</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          {!editMode && (
            <Button 
              variant="outline" 
              onClick={() => setPreviewMode(!previewMode)}
              className="gap-1"
            >
              {previewMode ? <Pencil className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              {previewMode ? "Edit Mode" : "Preview Mode"}
            </Button>
          )}
          
          {!previewMode && (
            <Button 
              onClick={() => setEditMode(!editMode)}
              className="gap-1"
            >
              {editMode ? "Cancel Editing" : "Edit Profile"}
            </Button>
          )}
        </div>
      </div>
      
      {previewMode ? (
        <div className="space-y-6">
          {/* Banner and Logo */}
          <div className="relative h-48 md:h-64 bg-gray-200 rounded-xl overflow-hidden">
            {bannerUrl ? (
              <img src={bannerUrl} alt="Company banner" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-r from-primary-100 to-primary-50">
                <Building className="h-16 w-16 text-primary-400" />
              </div>
            )}
            
            <div className="absolute -bottom-10 left-6 h-20 w-20 rounded-xl overflow-hidden border-4 border-white bg-white shadow-md">
              {logoUrl ? (
                <img src={logoUrl} alt="Company logo" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full bg-primary-100">
                  <Building className="h-8 w-8 text-primary-600" />
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-12">
            <h2 className="text-2xl font-bold">{defaultValues.name}</h2>
            <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-4">
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                {defaultValues.industry === "technology" ? "Technology" : defaultValues.industry}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {defaultValues.size === "51-200" ? "51-200 employees" : defaultValues.size}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {defaultValues.headquarters.city}, {defaultValues.headquarters.country}
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                <a href={defaultValues.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {defaultValues.website.replace(/(^\w+:|^)\/\//, '')}
                </a>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="about" className="mt-6">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="culture">Culture & Photos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">About {defaultValues.name}</h3>
                <p className="text-gray-700">{defaultValues.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{defaultValues.mission}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Our Values</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {defaultValues.values?.split(',').map((value, index) => (
                        <Badge key={index} variant="outline" className="bg-primary-50">
                          {value.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Founded</p>
                      <p className="text-gray-700">{defaultValues.founded}</p>
                    </div>
                    <div>
                      <p className="font-medium">Headquarters</p>
                      <p className="text-gray-700">
                        {defaultValues.headquarters.street}<br />
                        {defaultValues.headquarters.city}, {defaultValues.headquarters.state} {defaultValues.headquarters.postalCode}<br />
                        {defaultValues.headquarters.country}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Industry</p>
                      <p className="text-gray-700">{defaultValues.industry === "technology" ? "Technology" : defaultValues.industry}</p>
                    </div>
                    <div>
                      <p className="font-medium">Company Size</p>
                      <p className="text-gray-700">{defaultValues.size === "51-200" ? "51-200 employees" : defaultValues.size}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex gap-3">
                    {defaultValues.socialMedia.linkedin && (
                      <a href={defaultValues.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                    {defaultValues.socialMedia.twitter && (
                      <a href={defaultValues.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    )}
                    {defaultValues.socialMedia.facebook && (
                      <a href={defaultValues.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                    {defaultValues.socialMedia.instagram && (
                      <a href={defaultValues.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="benefits" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Benefits & Perks</h3>
                <p className="text-gray-700">We offer a comprehensive benefits package designed to support the health, wellbeing, and professional growth of our employees.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefitsList.map((benefit) => (
                  <Card key={benefit.id}>
                    <CardContent className="p-4">
                      <h4 className="font-medium">{benefit.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="culture" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Our Culture</h3>
                <p className="text-gray-700">
                  At {defaultValues.name}, we foster a collaborative, inclusive, and innovative environment where employees can thrive and grow both personally and professionally. Our workplace culture is built on mutual respect, continuous learning, and a shared passion for technology and excellence.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Photos</h3>
                {companyPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {companyPhotos.map((photo, index) => (
                      <div key={index} className="h-48 rounded-md overflow-hidden">
                        <img src={photo} alt={`Company photo ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 flex flex-col items-center justify-center">
                      <Image className="h-12 w-12 text-gray-300" />
                      <h3 className="mt-4 text-lg font-medium">No photos yet</h3>
                      <p className="mt-1 text-sm text-gray-500 text-center">
                        Showcase your company culture with photos of your office, team events, and work environment.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Visual Branding</CardTitle>
                <CardDescription>
                  Upload your company logo and banner to enhance your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="border rounded-md p-4 flex items-center justify-center">
                      <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center relative">
                        {logoUrl ? (
                          <>
                            <img src={logoUrl} alt="Company logo" className="w-full h-full object-cover rounded-md" />
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => setLogoUrl(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Building className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button variant="outline" size="sm" className="mt-2">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Recommended size: 400x400px, Max 2MB</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Company Banner</Label>
                    <div className="border rounded-md p-4 flex items-center justify-center">
                      <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center relative">
                        {bannerUrl ? (
                          <>
                            <img src={bannerUrl} alt="Company banner" className="w-full h-full object-cover rounded-md" />
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => setBannerUrl(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Image className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button variant="outline" size="sm" className="mt-2">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Banner
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Recommended size: 1200x300px, Max 5MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  This information will be displayed on your company profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Website</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" placeholder="https://example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 employees</SelectItem>
                              <SelectItem value="11-50">11-50 employees</SelectItem>
                              <SelectItem value="51-200">51-200 employees</SelectItem>
                              <SelectItem value="201-500">201-500 employees</SelectItem>
                              <SelectItem value="501-1000">501-1000 employees</SelectItem>
                              <SelectItem value="1001+">1001+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="founded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Founded Year</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mt-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={4}
                            placeholder="Tell candidates about your company"
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed prominently on your company profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Mission & Values</CardTitle>
                <CardDescription>
                  Share your company's mission and core values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Mission</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3}
                            placeholder="What is your company's mission?"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="values"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Core Values</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={3}
                            placeholder="Enter your company's core values, separated by commas"
                          />
                        </FormControl>
                        <FormDescription>
                          Example: Innovation, Excellence, Integrity, Collaboration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Enter your company's headquarter address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="headquarters.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="headquarters.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="headquarters.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="headquarters.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="headquarters.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>
                  Connect your company's social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="socialMedia.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://linkedin.com/company/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialMedia.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://twitter.com/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialMedia.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://facebook.com/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialMedia.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://instagram.com/..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
                <CardDescription>
                  Highlight the benefits and perks your company offers to employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-4">
                    {benefitsList.map((benefit) => (
                      <div key={benefit.id} className="flex items-start justify-between p-3 border rounded-md">
                        <div>
                          <h4 className="font-medium">{benefit.name}</h4>
                          <p className="text-sm text-gray-600">{benefit.description}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveBenefit(benefit.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Add New Benefit</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="benefitName">Benefit Name</Label>
                        <Input 
                          id="benefitName" 
                          value={newBenefit.name}
                          onChange={(e) => setNewBenefit({...newBenefit, name: e.target.value})}
                          placeholder="e.g., Health Insurance, 401(k), Remote Work"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="benefitDescription">Description</Label>
                        <Textarea 
                          id="benefitDescription" 
                          value={newBenefit.description}
                          onChange={(e) => setNewBenefit({...newBenefit, description: e.target.value})}
                          placeholder="Briefly describe the benefit"
                          rows={2}
                        />
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddBenefit}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Benefit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Company Photos</CardTitle>
                <CardDescription>
                  Upload photos showcasing your company culture, office, and team events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {companyPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {companyPhotos.map((photo, index) => (
                      <div key={index} className="relative h-40 rounded-md overflow-hidden group">
                        <img src={photo} alt={`Company photo ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setCompanyPhotos(companyPhotos.filter((_, i) => i !== index))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-md p-8 text-center mb-4">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <Image className="h-full w-full" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No photos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Upload photos to showcase your company culture
                    </p>
                  </div>
                )}
                
                <div className="flex justify-center">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  You can upload up to 10 photos. Recommended size: minimum 800x600px, Max 10MB each
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Profile Visibility</CardTitle>
                <CardDescription>
                  Control how your company profile appears to candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Public Profile</Label>
                      <p className="text-sm text-gray-500">Make your company profile visible to all candidates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Featured Company</Label>
                      <p className="text-sm text-gray-500">Highlight your company in featured sections</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Your company profile must be complete before it can be made public. Please fill in all required fields.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Save Company Profile
              </Button>
            </div>
          </form>
        </Form>
      )}
    </PortalContainer>
  );
}