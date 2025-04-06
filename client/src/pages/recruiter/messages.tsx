import { useState } from "react";
import { PortalContainer } from "@/components/layout/portal-container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Search, Send, Star, User, Filter, Info } from "lucide-react";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
  senderName: string;
}

interface Contact {
  id: number;
  name: string;
  role: "candidate";
  applyingFor?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  avatarUrl?: string;
  isFavorite: boolean;
  appliedDate?: string;
  status?: "new" | "interviewing" | "offer" | "rejected";
}

export default function RecruiterMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  
  // Mock data for demonstration - in a real app, this would come from API
  const mockContacts: Contact[] = [
    {
      id: 101,
      name: "Alex Johnson",
      role: "candidate",
      applyingFor: "Senior Frontend Developer",
      lastMessage: "Thank you for the opportunity. I'm very interested in this position.",
      lastMessageTime: "2 hours ago",
      unreadCount: 2,
      avatarUrl: "",
      isFavorite: true,
      appliedDate: "2023-04-01",
      status: "interviewing"
    },
    {
      id: 102,
      name: "Maria Garcia",
      role: "candidate",
      applyingFor: "Backend Engineer",
      lastMessage: "When would be a good time for the technical interview?",
      lastMessageTime: "Yesterday",
      unreadCount: 0,
      avatarUrl: "",
      isFavorite: true,
      appliedDate: "2023-04-02",
      status: "new"
    },
    {
      id: 103,
      name: "James Wilson",
      role: "candidate",
      applyingFor: "DevOps Engineer",
      lastMessage: "I've attached my additional certifications as requested.",
      lastMessageTime: "3 days ago",
      unreadCount: 0,
      avatarUrl: "",
      isFavorite: false,
      appliedDate: "2023-03-28",
      status: "interviewing"
    },
    {
      id: 104,
      name: "Emma Thompson",
      role: "candidate",
      applyingFor: "UX/UI Designer",
      lastMessage: "I'm available for the interview on Thursday at 2 PM.",
      lastMessageTime: "1 week ago",
      unreadCount: 0,
      avatarUrl: "",
      isFavorite: false,
      appliedDate: "2023-03-25",
      status: "offer"
    },
    {
      id: 105,
      name: "David Chen",
      role: "candidate",
      applyingFor: "Full Stack Developer",
      lastMessage: "Thank you for the feedback on my technical assessment.",
      lastMessageTime: "2 weeks ago",
      unreadCount: 0,
      avatarUrl: "",
      isFavorite: false,
      appliedDate: "2023-03-20",
      status: "rejected"
    }
  ];
  
  const mockMessages: Record<number, Message[]> = {
    101: [
      {
        id: 1,
        senderId: user?.id || 0,
        receiverId: 101,
        content: "Hi Alex, I've reviewed your application for the Senior Frontend Developer position and I'm impressed with your experience.",
        timestamp: "2023-04-05T10:30:00Z",
        isRead: true,
        senderName: user?.fullName || "You"
      },
      {
        id: 2,
        senderId: 101,
        receiverId: user?.id || 0,
        content: "Hello! Thank you for reaching out. I'm very excited about the opportunity to join your team.",
        timestamp: "2023-04-05T10:45:00Z",
        isRead: true,
        senderName: "Alex Johnson"
      },
      {
        id: 3,
        senderId: user?.id || 0,
        receiverId: 101,
        content: "Great! We'd like to schedule a technical interview. Are you available next Tuesday at 2 PM?",
        timestamp: "2023-04-05T11:00:00Z",
        isRead: true,
        senderName: user?.fullName || "You"
      },
      {
        id: 4,
        senderId: 101,
        receiverId: user?.id || 0,
        content: "Tuesday at 2 PM works perfectly for me. Should I prepare anything specific for the interview?",
        timestamp: "2023-04-05T11:15:00Z",
        isRead: true,
        senderName: "Alex Johnson"
      },
      {
        id: 5,
        senderId: user?.id || 0,
        receiverId: 101,
        content: "We'll focus on React, state management, and some system design questions. Also, please prepare to discuss your experience with frontend performance optimization.",
        timestamp: "2023-04-05T11:30:00Z",
        isRead: true,
        senderName: user?.fullName || "You"
      },
      {
        id: 6,
        senderId: 101,
        receiverId: user?.id || 0,
        content: "Thank you for the opportunity. I'm very interested in this position.",
        timestamp: "2023-04-05T14:20:00Z",
        isRead: false,
        senderName: "Alex Johnson"
      },
      {
        id: 7,
        senderId: 101,
        receiverId: user?.id || 0,
        content: "I've been working on performance optimization extensively in my current role, so I look forward to discussing that.",
        timestamp: "2023-04-05T14:25:00Z",
        isRead: false,
        senderName: "Alex Johnson"
      }
    ],
    102: [
      {
        id: 8,
        senderId: user?.id || 0,
        receiverId: 102,
        content: "Hello Maria, thanks for applying to the Backend Engineer position. Your experience with Node.js and databases is impressive.",
        timestamp: "2023-04-04T09:00:00Z",
        isRead: true,
        senderName: user?.fullName || "You"
      },
      {
        id: 9,
        senderId: 102,
        receiverId: user?.id || 0,
        content: "Thank you for considering my application. I'm particularly excited about working with your tech stack.",
        timestamp: "2023-04-04T09:30:00Z",
        isRead: true,
        senderName: "Maria Garcia"
      },
      {
        id: 10,
        senderId: user?.id || 0,
        receiverId: 102,
        content: "Great! We'd like to move forward with a technical interview. I'll send you the details soon.",
        timestamp: "2023-04-04T10:00:00Z",
        isRead: true,
        senderName: user?.fullName || "You"
      },
      {
        id: 11,
        senderId: 102,
        receiverId: user?.id || 0,
        content: "When would be a good time for the technical interview?",
        timestamp: "2023-04-04T15:45:00Z",
        isRead: true,
        senderName: "Maria Garcia"
      }
    ]
  };
  
  // Filter contacts based on active tab and search query
  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.applyingFor && contact.applyingFor.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "unread") return matchesSearch && contact.unreadCount > 0;
    if (activeTab === "favorites") return matchesSearch && contact.isFavorite;
    if (activeTab === "new") return matchesSearch && contact.status === "new";
    if (activeTab === "interviewing") return matchesSearch && contact.status === "interviewing";
    if (activeTab === "offer") return matchesSearch && contact.status === "offer";
    
    return matchesSearch;
  });
  
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setMessages(mockMessages[contact.id] || []);
    
    // Mark messages as read in a real app, you would call an API
    // This is just for UI demonstration
    if (contact.unreadCount > 0) {
      const updatedContacts = mockContacts.map(c => 
        c.id === contact.id ? { ...c, unreadCount: 0 } : c
      );
      // In a real app, you would update the contacts state and call an API
    }
  };
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedContact) return;
    
    const newMessage: Message = {
      id: Math.max(0, ...messages.map(m => m.id)) + 1,
      senderId: user?.id || 0,
      receiverId: selectedContact.id,
      content: messageText,
      timestamp: new Date().toISOString(),
      isRead: false,
      senderName: user?.fullName || "You"
    };
    
    // In a real app, you would send this to an API
    setMessages([...messages, newMessage]);
    setMessageText("");
    
    // For now just show a toast to simulate message sending
    toast({
      title: "Message sent",
      description: "Your message has been sent successfully",
    });
  };
  
  const toggleFavorite = (contactId: number) => {
    // In a real app, you would update this via API
    // For now, just show a toast
    toast({
      title: "Contact updated",
      description: "Contact has been updated in your favorites",
    });
  };
  
  // Render contact status badge
  const renderStatusBadge = (status?: Contact["status"]) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="secondary" className="text-xs">New</Badge>
        );
      case "interviewing":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">Interviewing</Badge>
        );
      case "offer":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Offer</Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">Rejected</Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-500">Communicate with candidates</p>
        </div>
      </div>
      
      <Card className="h-[calc(100vh-220px)] min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Contacts sidebar */}
          <div className="border-r border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search messages" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread" className="relative">
                    Unread
                    {mockContacts.filter(c => c.unreadCount > 0).length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {mockContacts.filter(c => c.unreadCount > 0).length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="interviewing">Interviewing</TabsTrigger>
                  <TabsTrigger value="offer">Offer</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="overflow-y-auto h-[calc(100%-150px)]">
              <div className="py-2">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => (
                    <div 
                      key={contact.id}
                      className={`flex items-start px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedContact?.id === contact.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                      onClick={() => handleContactSelect(contact)}
                    >
                      <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                        <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{contact.name}</h3>
                            {contact.isFavorite && (
                              <Star className="h-3 w-3 text-yellow-400 ml-1 flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500 truncate">{contact.applyingFor}</p>
                          <div className="ml-2">
                            {renderStatusBadge(contact.status)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">{contact.lastMessage}</p>
                      </div>
                      {contact.unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 h-5 w-5 bg-primary-500 rounded-full text-white text-xs flex items-center justify-center">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No messages found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat area */}
          <div className="col-span-2 flex flex-col h-full">
            {selectedContact ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={selectedContact.avatarUrl} alt={selectedContact.name} />
                      <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium">{selectedContact.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-6 w-6 p-0"
                          onClick={() => toggleFavorite(selectedContact.id)}
                        >
                          <Star className={`h-4 w-4 ${selectedContact.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                          <span className="sr-only">{selectedContact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                        </Button>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs text-gray-500">Applying for: {selectedContact.applyingFor}</p>
                        <div className="ml-2">
                          {renderStatusBadge(selectedContact.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">View candidate details</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.senderId !== user?.id && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-xl p-3 ${
                          message.senderId === user?.id
                            ? 'bg-primary-100 text-primary-900'
                            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs text-gray-500 mt-1 block text-right">
                          {new Date(message.timestamp).toLocaleTimeString(undefined, {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-end space-x-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="flex-shrink-0"
                      disabled={!messageText.trim()}
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500">Choose a candidate to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          Note: This is a demonstration of the messaging interface. In the production
          system, messages would be stored and retrieved from the database.
        </p>
      </div>
    </PortalContainer>
  );
}