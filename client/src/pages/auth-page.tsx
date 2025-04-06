import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, userRoleEnum } from "@shared/schema";
import { LaptopIcon, Users, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect } from "wouter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: userRoleEnum.default("candidate"),
  company: z.string().optional().or(z.literal('')),
  position: z.string().optional().or(z.literal('')),
}).refine(data => {
  // If role is recruiter, company and position are required
  if (data.role === "recruiter") {
    return !!data.company && !!data.position;
  }
  return true;
}, {
  message: "Company and position are required for recruiters",
  path: ["company"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { currentUser } = useFirebaseAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      role: "candidate",
      company: "",
      position: "",
    },
  });

  // Handle login form submission
  async function onLoginSubmit(data: LoginFormValues) {
    // Legacy system login
    loginMutation.mutate(data);
  }

  // Handle registration form submission
  async function onRegisterSubmit(data: RegisterFormValues) {
    // Legacy system registration
    registerMutation.mutate(data);
  }

  // Firebase email login
  async function handleFirebaseEmailLogin() {
    try {
      // For email login, let's use the email format directly
      const username = loginForm.getValues("username");
      const password = loginForm.getValues("password");
      
      // Validation
      if (!username || !password) {
        toast({
          title: "Missing fields",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
      
      // Assuming the username might be an email or we'll format it
      const email = username.includes('@') ? username : `${username}@selementry.com`;
      
      setIsLoading(true);
      const result = await signInWithEmail(email, password);
      setIsLoading(false);

      if (result.error) {
        toast({
          title: "Firebase login failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login successful",
          description: "You are now logged in with Firebase",
        });
        
        // Call the original login to maintain session state with backend
        loginMutation.mutate({
          username: loginForm.getValues("username"),
          password: loginForm.getValues("password")
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }

  // Firebase email registration
  async function handleFirebaseEmailRegister() {
    try {
      const data = registerForm.getValues();
      const email = data.email;
      const password = data.password;
      
      if (!email || !password) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields including email and password",
          variant: "destructive",
        });
        return;
      }
      
      // Validate email format
      if (!email.includes('@')) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const result = await signUpWithEmail(email, password);
      setIsLoading(false);

      if (result.error) {
        toast({
          title: "Firebase registration failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration successful",
          description: "Your account has been created with Firebase",
        });
        
        // Also register with the original system
        registerMutation.mutate(data);
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }

  // Firebase Google sign-in
  async function handleGoogleSignIn() {
    try {
      setIsLoading(true);
      console.log("Initiating Google Sign-In from auth page...");
      const result = await signInWithGoogle();
      
      // If we're using the redirect method, the page will reload
      // and the result will be handled by the FirebaseRedirectHandler
      if (result.redirectStarted) {
        console.log("Google Sign-In redirect started, page will reload...");
        // Don't reset loading state as the page will reload
        return;
      }
      
      setIsLoading(false);

      if (result.error) {
        console.error("Google Sign-In failed:", result.error);
        toast({
          title: "Google sign-in failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.user) {
        console.log("Google Sign-In successful, user info:", {
          email: result.user?.email,
          displayName: result.user?.displayName
        });
        
        toast({
          title: "Google sign-in successful",
          description: "You are now logged in with Google",
        });
        
        // If we have user data from Google, handle backend sync if necessary
        if (result.user?.email) {
          // For now, we'll just log the successful Google login
          // In the future, we could create a backend user or sync the accounts
          
          // Since we don't have a direct API for registering Google users yet,
          // we'll just handle the authentication through the Firebase context
          // The ProtectedRoute component has been updated to handle this case
        }
      }
    } catch (error: any) {
      console.error("Unexpected error in Google Sign-In handler:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred with Google Sign-In",
        variant: "destructive",
      });
    }
  }

  // Watch the role field to show/hide company fields
  const role = registerForm.watch("role");

  // If user is logged in, redirect to appropriate dashboard
  if (user || currentUser) {
    // Log authentication state for debugging
    console.log("Auth state:", { 
      backendAuth: !!user, 
      firebaseAuth: !!currentUser,
      backendRole: user?.role || 'none'
    });
    
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-700 mb-2">SELEMENTRY</h1>
            <p className="text-xl text-gray-600">AI-Powered Recruitment Platform</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full mb-2" 
                        disabled={loginMutation.isPending || isLoading}
                      >
                        {loginMutation.isPending || isLoading ? "Logging in..." : "Login"}
                      </Button>
                      
                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        type="button"
                        className="w-full bg-red-500 hover:bg-red-600 mb-2" 
                        onClick={handleFirebaseEmailLogin}
                        disabled={isLoading}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Login with Firebase Email
                      </Button>
                      
                      <Button 
                        type="button"
                        className="w-full bg-blue-500 hover:bg-blue-600" 
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                          <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Login with Google
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Register to start using SELEMENTRY
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Account Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="candidate" id="candidate" />
                                  <label htmlFor="candidate" className="flex items-center space-x-2 cursor-pointer">
                                    <Users className="h-4 w-4" />
                                    <span>I'm a Candidate</span>
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="recruiter" id="recruiter" />
                                  <label htmlFor="recruiter" className="flex items-center space-x-2 cursor-pointer">
                                    <LaptopIcon className="h-4 w-4" />
                                    <span>I'm a Recruiter</span>
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {role === "recruiter" && (
                        <>
                          <FormField
                            control={registerForm.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input placeholder="Company Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position</FormLabel>
                                <FormControl>
                                  <Input placeholder="HR Manager" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full mb-2" 
                        disabled={registerMutation.isPending || isLoading}
                      >
                        {registerMutation.isPending || isLoading ? "Registering..." : "Register"}
                      </Button>
                      
                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        type="button"
                        className="w-full bg-red-500 hover:bg-red-600 mb-2" 
                        onClick={handleFirebaseEmailRegister}
                        disabled={isLoading}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Register with Firebase
                      </Button>
                      
                      <Button 
                        type="button"
                        className="w-full bg-blue-500 hover:bg-blue-600" 
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                          <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Register with Google
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden lg:flex flex-col justify-center">
          <div className="bg-primary-600 text-white p-10 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Transform Your Recruitment Process</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">AI-Powered Matching</h3>
                  <p className="mt-1 text-white/80">Leverage AI to find the perfect candidates for your job openings.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Data-Driven Insights</h3>
                  <p className="mt-1 text-white/80">Make better hiring decisions with comprehensive analytics and reports.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Streamlined Workflows</h3>
                  <p className="mt-1 text-white/80">Simplify your hiring process with intuitive job posting and candidate tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
