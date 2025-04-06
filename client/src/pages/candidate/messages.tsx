import { useState } from "react";
import { PortalContainer } from "@/components/layout/portal-container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Search, Send, User } from "lucide-react";

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
  role: string;
  company?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  avatarUrl?: string;
}

export default function CandidateMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Mock data for demonstration - in a real app, this would come from API
  const mockContacts: Contact[] = [
    {
      id: 101,
      name: "Sarah Johnson",
      role: "Recruiter",
      company: "TechSolutions Inc.",
      lastMessage: "Thanks for applying! I'd like to schedule an interview.",
      lastMessageTime: "2 hours ago",
      unreadCount: 1,
      avatarUrl: ""
    },
    {
      id: 102,
      name: "Michael Chen",
      role: "Hiring Manager",
      company: "Innovate Labs",
      lastMessage: "Your resume looks impressive. Are you available next week?",
      lastMessageTime: "Yesterday",
      unreadCount: 0,
      avatarUrl: ""
    },
    {
      id: 103,
      name: "Jessica Rodriguez",
      role: "HR Specialist",
      company: "Global Systems",
      lastMessage: "We've received your application and are reviewing it.",
      lastMessageTime: "3 days ago",
      unreadCount: 0,
      avatarUrl: ""
    }
  ];
  
  const mockMessages: Record<number, Message[]> = {
    101: [
      {
        id: 1,
        senderId: 101,
        receiverId: user?.id || 0,
        content: "Hello! I noticed your application for the Senior Developer position.",
        timestamp: "2023-04-05T14:30:00Z",
        isRead: true,
        senderName: "Sarah Johnson"
      },
      {
        id: 2,
        senderId: user?.id || 0,
        receiverId: 101,
        content: "Thanks for reaching out! Yes, I'm very interested in the role.",
        timestamp: "2023-04-05T14:35:00Z",
        isRead: true,
        senderName: user?.fullName || "You"
      },
      {
        id: 3,
        senderId: 101,
        receiverId: user?.id || 0,
        content: "Great! Your experience seems like a good fit. I'd like to schedule an interview with the team.",
        timestamp: "2023-04-05T14:40:00Z",
        isRead: true,
        senderName: "Sarah Johnson"
      },
      {
        id: 4,
        senderId: 101,
        receiverId: user?.id || 0,
        content: "Thanks for applying! I'd like to schedule an interview.",
        timestamp: "2023-04-05T16:30:00Z",
        isRead: false,
        senderName: "Sarah Johnson"
      }
    ],
    102: [
      {
        id: 5,
        senderId: 102,
        receiverId: user?.id || 0,
        content: "Hi there! I've reviewed your portfolio and I'm impressed with your work.",
        timestamp: "2023-04-04T11:20:00Z",
        isRead: true,
        senderName: "Michael Chen"
      },
      {
        id: 6,
        senderId: user?.id || 0,
        receiverId: 102,
        content: "Thank you! I put a lot of effort into those projects.",
        timestamp: "2023-04-04T11:45:00Z",
        isRead: true,
        senderName: user?.fullName || "You"
      },
      {
        id: 7,
        senderId: 102,
        receiverId: user?.id || 0,
        content: "Your resume looks impressive. Are you available next week?",
        timestamp: "2023-04-04T13:15:00Z",
        isRead: true,
        senderName: "Michael Chen"
      }
    ],
    103: [
      {
        id: 8,
        senderId: 103,
        receiverId: user?.id || 0,
        content: "Hello! Thank you for your application to Global Systems.",
        timestamp: "2023-04-02T09:10:00Z",
        isRead: true,
        senderName: "Jessica Rodriguez"
      },
      {
        id: 9,
        senderId: 103,
        receiverId: user?.id || 0,
        content: "We've received your application and are reviewing it.",
        timestamp: "2023-04-02T09:12:00Z",
        isRead: true,
        senderName: "Jessica Rodriguez"
      }
    ]
  };
  
  const filteredContacts = mockContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
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
  
  return (
    <PortalContainer>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-500">Communicate with recruiters and hiring managers</p>
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
            </div>
            <div className="overflow-y-auto h-[calc(100%-70px)]">
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
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{contact.name}</h3>
                          <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{contact.company}</p>
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
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={selectedContact.avatarUrl} alt={selectedContact.name} />
                    <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-medium">{selectedContact.name}</h3>
                    <p className="text-xs text-gray-500">{selectedContact.role} at {selectedContact.company}</p>
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
                <p className="mt-1 text-sm text-gray-500">Choose a contact to start messaging</p>
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