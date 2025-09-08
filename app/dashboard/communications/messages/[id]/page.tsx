'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft,
  MessageCircle,
  Send,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Archive,
  Trash2,
  Star,
  Paperclip,
  Image,
  Smile,
  Users,
  CheckCircle2,
  Circle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data - in real app, this would come from API
const mockConversation = {
  id: '1',
  type: 'individual',
  participant: {
    name: 'Sarah Wilson',
    avatar: '/avatars/sarah.jpg',
    role: 'Youth Leader',
    email: 'sarah.wilson@email.com',
    phone: '+1 (555) 123-4567',
    status: 'online',
    lastSeen: '2024-01-15T14:30:00Z'
  },
  isStarred: true,
  isArchived: false,
  createdAt: '2024-01-10T09:00:00Z'
};

const mockMessages = [
  {
    id: '1',
    content: 'Hi! I wanted to discuss the upcoming youth event planning.',
    sender: {
      id: 'sarah-1',
      name: 'Sarah Wilson',
      avatar: '/avatars/sarah.jpg'
    },
    timestamp: '2024-01-15T10:00:00Z',
    isRead: true,
    type: 'text'
  },
  {
    id: '2',
    content: 'Of course! I\'d be happy to help. What specific aspects do you need assistance with?',
    sender: {
      id: 'me',
      name: 'You',
      avatar: '/avatars/me.jpg'
    },
    timestamp: '2024-01-15T10:05:00Z',
    isRead: true,
    type: 'text'
  },
  {
    id: '3',
    content: 'We need to finalize the venue, catering, and activity schedule. Also, we should discuss the budget allocation.',
    sender: {
      id: 'sarah-1',
      name: 'Sarah Wilson',
      avatar: '/avatars/sarah.jpg'
    },
    timestamp: '2024-01-15T10:10:00Z',
    isRead: true,
    type: 'text'
  },
  {
    id: '4',
    content: 'Great! Let me check our available venues and get back to you with options. For the budget, what\'s our target amount?',
    sender: {
      id: 'me',
      name: 'You',
      avatar: '/avatars/me.jpg'
    },
    timestamp: '2024-01-15T10:15:00Z',
    isRead: true,
    type: 'text'
  },
  {
    id: '5',
    content: 'We\'re looking at around $2,000 for the entire event. That should cover venue, food, and activities for about 50 youth.',
    sender: {
      id: 'sarah-1',
      name: 'Sarah Wilson',
      avatar: '/avatars/sarah.jpg'
    },
    timestamp: '2024-01-15T10:20:00Z',
    isRead: true,
    type: 'text'
  },
  {
    id: '6',
    content: 'Perfect! That\'s a reasonable budget. I\'ll prepare a detailed breakdown and some venue options. Can we schedule a meeting this week?',
    sender: {
      id: 'me',
      name: 'You',
      avatar: '/avatars/me.jpg'
    },
    timestamp: '2024-01-15T10:25:00Z',
    isRead: true,
    type: 'text'
  },
  {
    id: '7',
    content: 'Absolutely! How about Thursday at 2 PM? We could meet in the church office.',
    sender: {
      id: 'sarah-1',
      name: 'Sarah Wilson',
      avatar: '/avatars/sarah.jpg'
    },
    timestamp: '2024-01-15T10:30:00Z',
    isRead: true,
    type: 'text'
  },
  {
    id: '8',
    content: 'Thursday at 2 PM works perfectly! I\'ll bring the venue options and budget breakdown. Looking forward to it!',
    sender: {
      id: 'me',
      name: 'You',
      avatar: '/avatars/me.jpg'
    },
    timestamp: '2024-01-15T10:35:00Z',
    isRead: true,
    type: 'text'
  },
  {
    id: '9',
    content: 'Thank you so much! This is going to be an amazing event for our youth. See you Thursday! 🙏',
    sender: {
      id: 'sarah-1',
      name: 'Sarah Wilson',
      avatar: '/avatars/sarah.jpg'
    },
    timestamp: '2024-01-15T14:30:00Z',
    isRead: false,
    type: 'text'
  }
];

export default function MessageThreadPage() {
  const router = useRouter();
  const params = useParams();
  const [conversation, setConversation] = useState(mockConversation);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In real app, fetch conversation and messages by ID
    // fetchConversation(params.id);
    // fetchMessages(params.id);
    
    // Scroll to bottom on load
    scrollToBottom();
  }, [params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageToSend = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    // Optimistically add message
    const newMsg = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: {
        id: 'me',
        name: 'You',
        avatar: '/avatars/me.jpg'
      },
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text' as const
    };

    setMessages(prev => [...prev, newMsg]);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
      // Remove message on error
      setMessages(prev => prev.filter(msg => msg.id !== newMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStarToggle = () => {
    setConversation(prev => ({ ...prev, isStarred: !prev.isStarred }));
    toast.success(conversation.isStarred ? 'Removed from starred' : 'Added to starred');
  };

  const handleArchiveToggle = () => {
    setConversation(prev => ({ ...prev, isArchived: !prev.isArchived }));
    toast.success(conversation.isArchived ? 'Unarchived conversation' : 'Archived conversation');
  };

  const handleDeleteConversation = () => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      toast.success('Conversation deleted');
      router.push('/dashboard/communications/messages');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-background">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.participant.avatar} />
              <AvatarFallback>
                {conversation.type === 'group' 
                  ? <Users className="h-5 w-5" />
                  : conversation.participant.name.split(' ').map(n => n[0]).join('')
                }
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.participant.status)}`}></div>
          </div>
          
          <div className="flex-1">
            <h2 className="font-semibold">{conversation.participant.name}</h2>
            <p className="text-sm text-muted-foreground">
              {conversation.participant.status === 'online' 
                ? 'Online now'
                : `Last seen ${formatTimestamp(conversation.participant.lastSeen)}`
              }
            </p>
          </div>
          
          {conversation.isStarred && (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Info className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStarToggle}>
                <Star className="mr-2 h-4 w-4" />
                {conversation.isStarred ? 'Remove Star' : 'Add Star'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchiveToggle}>
                <Archive className="mr-2 h-4 w-4" />
                {conversation.isArchived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteConversation} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isMe = message.sender.id === 'me';
          const showAvatar = !isMe && (index === 0 || messages[index - 1].sender.id !== message.sender.id);
          const showTimestamp = index === 0 || 
            new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000; // 5 minutes

          return (
            <div key={message.id} className="space-y-2">
              {showTimestamp && (
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-xs">
                    {formatMessageTime(message.timestamp)}
                  </Badge>
                </div>
              )}
              
              <div className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="w-8">
                    {showAvatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender.avatar} />
                        <AvatarFallback className="text-xs">
                          {message.sender.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                
                <div className={`max-w-xs lg:max-w-md ${isMe ? 'order-1' : ''}`}>
                  <div className={`rounded-lg px-4 py-2 ${
                    isMe 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                    isMe ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{formatMessageTime(message.timestamp)}</span>
                    {isMe && (
                      <div className="flex items-center">
                        {message.isRead ? (
                          <CheckCircle2 className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {isMe && <div className="w-8" />}
              </div>
            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="resize-none"
            />
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}