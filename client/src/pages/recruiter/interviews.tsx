import { useState } from "react";
import { PortalContainer } from "@/components/layout/portal-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  Phone, 
  AlertTriangle,
  Check,
  X,
  RotateCcw,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  AlarmClock,
  Bell,
} from "lucide-react";

// Types for interviews
interface Interview {
  id: number;
  candidateId: number;
  candidateName: string;
  candidateAvatar?: string;
  position: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "video" | "phone" | "in-person";
  location: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
  jobId: number;
  jobTitle: string;
}

export default function RecruiterInterviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newInterview, setNewInterview] = useState({
    candidateId: "",
    position: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "video",
    location: "",
    notes: "",
    jobId: "",
  });
  
  // Mock data for interviews
  const mockInterviews: Interview[] = [
    {
      id: 1,
      candidateId: 101,
      candidateName: "Alex Johnson",
      candidateAvatar: "",
      position: "Senior Frontend Developer",
      date: "2023-04-07",
      startTime: "10:00",
      endTime: "11:00",
      type: "video",
      location: "Zoom Meeting",
      status: "scheduled",
      notes: "Focus on React experience and team collaboration",
      jobId: 1001,
      jobTitle: "Senior Frontend Developer",
    },
    {
      id: 2,
      candidateId: 102,
      candidateName: "Maria Garcia",
      candidateAvatar: "",
      position: "Backend Engineer",
      date: "2023-04-07",
      startTime: "13:30",
      endTime: "14:30",
      type: "video",
      location: "Google Meet",
      status: "scheduled",
      notes: "Assess Node.js and database knowledge",
      jobId: 1002,
      jobTitle: "Backend Engineer",
    },
    {
      id: 3,
      candidateId: 103,
      candidateName: "James Wilson",
      candidateAvatar: "",
      position: "DevOps Engineer",
      date: "2023-04-06",
      startTime: "11:00",
      endTime: "12:00",
      type: "phone",
      location: "Phone Interview",
      status: "completed",
      notes: "Good understanding of CI/CD pipelines and cloud infrastructure",
      jobId: 1003,
      jobTitle: "DevOps Engineer",
    },
    {
      id: 4,
      candidateId: 104,
      candidateName: "Emma Thompson",
      candidateAvatar: "",
      position: "UX/UI Designer",
      date: "2023-04-05",
      startTime: "14:00",
      endTime: "15:00",
      type: "in-person",
      location: "Office - Meeting Room 2",
      status: "completed",
      notes: "Portfolio review was impressive. Strong design principles.",
      jobId: 1004,
      jobTitle: "UX/UI Designer",
    },
    {
      id: 5,
      candidateId: 105,
      candidateName: "David Chen",
      candidateAvatar: "",
      position: "Full Stack Developer",
      date: "2023-04-05",
      startTime: "10:30",
      endTime: "11:30",
      type: "video",
      location: "Microsoft Teams",
      status: "no-show",
      notes: "Candidate did not attend. Follow up required.",
      jobId: 1005,
      jobTitle: "Full Stack Developer",
    },
    {
      id: 6,
      candidateId: 106,
      candidateName: "Sarah Miller",
      candidateAvatar: "",
      position: "Product Manager",
      date: "2023-04-04",
      startTime: "09:00",
      endTime: "10:30",
      type: "video",
      location: "Zoom Meeting",
      status: "cancelled",
      notes: "Candidate requested to reschedule due to illness",
      jobId: 1006,
      jobTitle: "Product Manager",
    },
  ];
  
  // Filter interviews based on search, status, type, and date
  const filteredInterviews = mockInterviews.filter(interview => {
    const matchesSearch = searchQuery === "" || 
      interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === null || interview.status === filterStatus;
    
    const matchesType = filterType === null || interview.type === filterType;
    
    const matchesDate = !selectedDate || interview.date === format(selectedDate, "yyyy-MM-dd");
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });
  
  // Separate interviews by status
  const upcomingInterviews = filteredInterviews.filter(
    interview => interview.status === "scheduled"
  );
  
  const pastInterviews = filteredInterviews.filter(
    interview => interview.status !== "scheduled"
  );
  
  // Handle interview status change
  const handleStatusChange = (interviewId: number, newStatus: Interview["status"]) => {
    // In a real app, you would update this via API
    // For now, just show a success message
    
    toast({
      title: "Interview status updated",
      description: `Interview status has been changed to ${newStatus}`,
    });
  };
  
  // Handle create new interview
  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newInterview.candidateId || !newInterview.position || !newInterview.date || 
        !newInterview.startTime || !newInterview.endTime || !newInterview.type || 
        !newInterview.location || !newInterview.jobId) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would send this to the server
    toast({
      title: "Interview scheduled",
      description: "New interview has been successfully scheduled",
    });
    
    // Reset form and close dialog
    setNewInterview({
      candidateId: "",
      position: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "video",
      location: "",
      notes: "",
      jobId: "",
    });
    setCreateDialogOpen(false);
  };
  
  // Helper to render interview type icon
  const renderInterviewTypeIcon = (type: Interview["type"]) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "phone":
        return <Phone className="h-4 w-4 text-green-500" />;
      case "in-person":
        return <MapPin className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };
  
  // Helper to render interview status badge
  const renderStatusBadge = (status: Interview["status"]) => {
    switch (status) {
      case "scheduled":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlarmClock className="h-3 w-3 mr-1" />
            Scheduled
          </div>
        );
      case "completed":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </div>
        );
      case "cancelled":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <X className="h-3 w-3 mr-1" />
            Cancelled
          </div>
        );
      case "no-show":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            No Show
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Interviews</h1>
          <p className="mt-1 text-sm text-gray-500">Schedule and manage candidate interviews</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Schedule New Interview</DialogTitle>
                <DialogDescription>
                  Fill in the details to schedule an interview with a candidate
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateInterview} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateId">Candidate</Label>
                    <Select 
                      onValueChange={(value) => setNewInterview({...newInterview, candidateId: value})}
                      value={newInterview.candidateId}
                    >
                      <SelectTrigger id="candidateId">
                        <SelectValue placeholder="Select candidate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="101">Alex Johnson</SelectItem>
                        <SelectItem value="102">Maria Garcia</SelectItem>
                        <SelectItem value="107">Robert Smith</SelectItem>
                        <SelectItem value="108">Jennifer Lee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobId">Job Position</Label>
                    <Select 
                      onValueChange={(value) => {
                        setNewInterview({
                          ...newInterview, 
                          jobId: value, 
                          position: value === "1001" ? "Senior Frontend Developer" : 
                                   value === "1002" ? "Backend Engineer" : 
                                   value === "1007" ? "Data Scientist" : "Product Manager"
                        });
                      }}
                      value={newInterview.jobId}
                    >
                      <SelectTrigger id="jobId">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1001">Senior Frontend Developer</SelectItem>
                        <SelectItem value="1002">Backend Engineer</SelectItem>
                        <SelectItem value="1007">Data Scientist</SelectItem>
                        <SelectItem value="1008">Product Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newInterview.date ? newInterview.date : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          onSelect={(date) => {
                            if (date) {
                              setNewInterview({
                                ...newInterview,
                                date: format(date, "yyyy-MM-dd"),
                              });
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Interview Type</Label>
                    <Select 
                      onValueChange={(value: "video" | "phone" | "in-person") => 
                        setNewInterview({...newInterview, type: value})}
                      value={newInterview.type}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="in-person">In-Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newInterview.startTime}
                      onChange={(e) => setNewInterview({...newInterview, startTime: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newInterview.endTime}
                      onChange={(e) => setNewInterview({...newInterview, endTime: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="location">Location / Meeting Link</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Zoom link, meeting room, etc."
                      value={newInterview.location}
                      onChange={(e) => setNewInterview({...newInterview, location: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Interview notes or instructions"
                      value={newInterview.notes}
                      onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-span-2 flex items-center space-x-2">
                    <Switch id="sendNotification" defaultChecked />
                    <Label htmlFor="sendNotification">
                      Send notification to candidate
                    </Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Schedule Interview</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search interviews..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
                {(filterStatus || filterType || selectedDate) && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-primary"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="filterStatus">Status</Label>
                  <Select 
                    value={filterStatus || ""} 
                    onValueChange={(value) => setFilterStatus(value === "" ? null : value)}
                  >
                    <SelectTrigger id="filterStatus">
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="filterType">Interview Type</Label>
                  <Select 
                    value={filterType || ""} 
                    onValueChange={(value) => setFilterType(value === "" ? null : value)}
                  >
                    <SelectTrigger id="filterType">
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any type</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilterStatus(null);
                      setFilterType(null);
                      setSelectedDate(undefined);
                    }}
                  >
                    Reset Filters
                  </Button>
                  <Button onClick={() => {}}>Apply Filters</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Tabs for upcoming and past interviews */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming" className="flex gap-2">
            <AlarmClock className="h-4 w-4" />
            Upcoming
            {upcomingInterviews.length > 0 && (
              <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {upcomingInterviews.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="flex gap-2">
            <RotateCcw className="h-4 w-4" />
            Past
          </TabsTrigger>
        </TabsList>
        
        {/* Upcoming interviews tab content */}
        <TabsContent value="upcoming">
          {upcomingInterviews.length > 0 ? (
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={interview.candidateAvatar} />
                          <AvatarFallback>{interview.candidateName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="text-base font-medium truncate">
                              {interview.candidateName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {interview.position}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {renderStatusBadge(interview.status)}
                            
                            <div className="flex items-center text-xs text-gray-500">
                              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                              {new Date(interview.date).toLocaleDateString()}
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {interview.startTime} - {interview.endTime}
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500">
                              {renderInterviewTypeIcon(interview.type)}
                              <span className="ml-1">
                                {interview.type === "video" 
                                  ? "Video Call" 
                                  : interview.type === "phone" 
                                    ? "Phone" 
                                    : "In-Person"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <div className="text-sm">
                            <span className="font-medium">Location:</span> {interview.location}
                          </div>
                          
                          {interview.notes && (
                            <div className="text-sm">
                              <span className="font-medium">Notes:</span> {interview.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Bell className="h-3.5 w-3.5" />
                            Send Reminder
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center gap-1" 
                            onClick={() => handleStatusChange(interview.id, "completed")}>
                            <Check className="h-3.5 w-3.5" />
                            Mark as Completed
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center gap-1"
                            onClick={() => handleStatusChange(interview.id, "cancelled")}>
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <ChevronRight className="h-3.5 w-3.5" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="rounded-full bg-gray-100 p-3">
                  <Calendar className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No upcoming interviews</h3>
                <p className="mt-1 text-sm text-gray-500 text-center max-w-md">
                  You don't have any upcoming interviews scheduled. Click "Schedule Interview" to add a new interview.
                </p>
                <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule Interview
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Past interviews tab content */}
        <TabsContent value="past">
          {pastInterviews.length > 0 ? (
            <div className="space-y-4">
              {pastInterviews.map((interview) => (
                <Card key={interview.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={interview.candidateAvatar} />
                          <AvatarFallback>{interview.candidateName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="text-base font-medium truncate">
                              {interview.candidateName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {interview.position}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {renderStatusBadge(interview.status)}
                            
                            <div className="flex items-center text-xs text-gray-500">
                              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                              {new Date(interview.date).toLocaleDateString()}
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {interview.startTime} - {interview.endTime}
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500">
                              {renderInterviewTypeIcon(interview.type)}
                              <span className="ml-1">
                                {interview.type === "video" 
                                  ? "Video Call" 
                                  : interview.type === "phone" 
                                    ? "Phone" 
                                    : "In-Person"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <div className="text-sm">
                            <span className="font-medium">Location:</span> {interview.location}
                          </div>
                          
                          {interview.notes && (
                            <div className="text-sm">
                              <span className="font-medium">Notes:</span> {interview.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {interview.status === "cancelled" && (
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reschedule
                            </Button>
                          )}
                          {interview.status === "no-show" && (
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reschedule
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <ChevronRight className="h-3.5 w-3.5" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="rounded-full bg-gray-100 p-3">
                  <RotateCcw className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No past interviews</h3>
                <p className="mt-1 text-sm text-gray-500 text-center max-w-md">
                  You don't have any past interviews. They will appear here once interviews are completed, cancelled, or missed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {upcomingInterviews.length > 0 && (
        <Alert className="mt-6">
          <Bell className="h-4 w-4" />
          <AlertTitle>Interview Reminder</AlertTitle>
          <AlertDescription>
            You have {upcomingInterviews.length} upcoming interview{upcomingInterviews.length > 1 ? 's' : ''} scheduled. 
            Don't forget to prepare your questions and review candidate profiles.
          </AlertDescription>
        </Alert>
      )}
    </PortalContainer>
  );
}