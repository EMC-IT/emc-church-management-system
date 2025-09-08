'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  MessageCircle,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Reply,
  Archive,
  Trash2,
  Star,
  Clock,
  CheckCircle2,
  Circle,
  Users,
  Send,
  Paperclip
} from 'lucide-react';

// Mock data for conversations
const conversations = [
  {
    id: '1',
    type: 'individual',
    participant: {
      name: 'Sarah Wilson',
      avatar: '/avatars/sarah.jpg',
      role: 'Youth Leader',
      status: 'online'
    },
    lastMessage: {
      content: 'Thank you for organizing the youth event! The kids had a wonderful time.',
      timestamp: '2024-01-15T14:30:00Z',
      sender: 'Sarah Wilson',
      isRead: false
    },
    unreadCount: 2,
    isStarred: true,
    isArchived: false,
    messageCount: 8
  },
  {
    id: '2',
    type: 'group',
    participant: {
      name: 'Prayer Team',
      avatar: '/avatars/prayer-team.jpg',
      role: 'Group Chat',
      status: 'active',
      memberCount: 12
    },
    lastMessage: {
      content: 'Please remember to pray for the Johnson family during this difficult time.',
      timestamp: '2024-01-15T12:15:00Z',
      sender: 'Elder Smith',
      isRead: true
    },
    unreadCount: 0,
    isStarred: false,
    isArchived: false,
    messageCount: 45
  },
  {
    id: '3',
    type: 'individual',
    participant: {
      name: 'Michael Davis',
      avatar: '/avatars/michael.jpg',
      role: 'Volunteer Coordinator',
      status: 'offline'
    },
    lastMessage: {
      content: 'I can help with setting up for the Sunday service. What time should I arrive?',
      timestamp: '2024-01-15T10:45:00Z',
      sender: 'Michael Davis',
      isRead: true
    },
    unreadCount: 0,
    isStarred: false,
    isArchived: false,
    messageCount: 3
  },
  {
    id: '4',
    type: 'group',
    participant: {
      name: 'Worship Team',
      avatar: '/avatars/worship-team.jpg',
      role: 'Group Chat',
      status: 'active',
      memberCount: 8
    },
    lastMessage: {
      content: 'Practice is moved to Thursday 7 PM this week.',
      timestamp: '2024-01-14T16:20:00Z',
      sender: 'Music Director',
      isRead: true
    },
    unreadCount: 0,
    isStarred: true,
    isArchived: false,
    messageCount: 23
  },
  {
    id: '5',
    type: 'individual',
    participant: {
      name: 'Mary Johnson',
      avatar: '/avatars/mary.jpg',
      role: 'Children Ministry',
      status: 'away'
    },
    lastMessage: {
      content: 'The children\'s program materials have arrived. Should I store them in the usual place?',
      timestamp: '2024-01-14T09:30:00Z',
      sender: 'Mary Johnson',
      isRead: true
    },
    unreadCount: 0,
    isStarred: false,
    isArchived: true,
    messageCount: 12
  }
];

const summaryStats = {
  totalConversations: 5,
  unreadMessages: 2,
  starredConversations: 2,
  archivedConversations: 1
};

export default function MessagesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showArchived, setShowArchived] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      case 'active': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conversation.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'individual' && conversation.type === 'individual') ||
                       (filterType === 'group' && conversation.type === 'group') ||
                       (filterType === 'unread' && conversation.unreadCount > 0) ||
                       (filterType === 'starred' && conversation.isStarred);
    
    const matchesArchived = showArchived ? conversation.isArchived : !conversation.isArchived;
    
    return matchesSearch && matchesType && matchesArchived;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleConversationClick = (conversationId: string) => {
    router.push(`/dashboard/communications/messages/${conversationId}`);
  };

  const handleStarToggle = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle star toggle logic
    console.log('Toggle star for conversation:', conversationId);
  };

  const handleArchiveToggle = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle archive toggle logic
    console.log('Toggle archive for conversation:', conversationId);
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <MessageCircle className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">Communicate with church members and teams</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">Active conversations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starred</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.starredConversations}</div>
            <p className="text-xs text-muted-foreground">Important chats</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{summaryStats.archivedConversations}</div>
            <p className="text-xs text-muted-foreground">Archived chats</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="group">Group Chats</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="starred">Starred</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant={showArchived ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="mr-2 h-4 w-4" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        </div>
        <Button onClick={() => router.push('/dashboard/communications/messages/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Conversations List */}
      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>Your recent conversations and group chats</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredConversations.map((conversation, index) => (
              <div
                key={conversation.id}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.participant.avatar} />
                      <AvatarFallback>
                        {conversation.type === 'group' 
                          ? <Users className="h-6 w-6" />
                          : conversation.participant.name.split(' ').map(n => n[0]).join('')
                        }
                      </AvatarFallback>
                    </Avatar>
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(conversation.participant.status)}`}></div>
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">
                          {conversation.participant.name}
                        </h3>
                        {conversation.type === 'group' && (
                          <Badge variant="outline" className="text-xs">
                            {conversation.participant.memberCount} members
                          </Badge>
                        )}
                        {conversation.isStarred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{conversation.participant.role}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.sender !== 'You' && (
                            <span className="font-medium">{conversation.lastMessage.sender}: </span>
                          )}
                          {conversation.lastMessage.content}
                        </span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => handleStarToggle(conversation.id, e)}
                        >
                          <Star className={`h-4 w-4 ${conversation.isStarred ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => handleArchiveToggle(conversation.id, e)}
                        >
                          <Archive className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No conversations found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters'
                    : showArchived 
                      ? 'No archived conversations'
                      : 'Start a new conversation to get started'
                  }
                </p>
                {!searchTerm && !showArchived && (
                  <Button onClick={() => router.push('/dashboard/communications/messages/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Start New Conversation
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/communications/messages/new')}>
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Send Message</h3>
            <p className="text-sm text-muted-foreground">Start a new conversation with a member</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Create Group</h3>
            <p className="text-sm text-muted-foreground">Start a group conversation</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Paperclip className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Share Files</h3>
            <p className="text-sm text-muted-foreground">Send documents and media</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}