'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
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
import { 
  ArrowLeft,
  MessageCircle,
  Plus,
  Search,
  Star,
  Clock,
  CheckCircle2,
  Users,
  Archive,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data for conversations
const INITIAL_CONVERSATIONS = [
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

export default function MessagesPage() {
  const router = useRouter();
  const [conversationsList, setConversationsList] = useState(INITIAL_CONVERSATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showArchived, setShowArchived] = useState(false);

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return 'bg-emerald-500';
      case 'away':
        return 'bg-amber-500';
      default:
        return 'bg-muted-foreground';
    }
  };

  const filteredConversations = conversationsList.filter(conversation => {
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

  const handleStarToggle = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationsList(prev => prev.map(c => c.id === conversationId ? { ...c, isStarred: !c.isStarred } : c));
    toast.success('Conversation updated');
  };

  const handleArchiveToggle = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationsList(prev => prev.map(c => c.id === conversationId ? { ...c, isArchived: !c.isArchived } : c));
    toast.success('Conversation archived');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Messages"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/communications">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Communications
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/communications/messages/new">
                <Plus className="mr-1.5 h-4 w-4" />
                New Message
              </Link>
            </Button>
          </>
        }
      />

      {/* 4 Summary StatCards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Conversations"
          value={conversationsList.length}
          icon={MessageSquare}
          accent="primary"
        />
        <StatCard
          title="Unread Messages"
          value={conversationsList.reduce((sum, c) => sum + c.unreadCount, 0)}
          icon={MessageCircle}
          accent="accent"
        />
        <StatCard
          title="Starred Conversations"
          value={conversationsList.filter(c => c.isStarred).length}
          icon={Star}
          accent="secondary"
        />
        <StatCard
          title="Archived"
          value={conversationsList.filter(c => c.isArchived).length}
          icon={Archive}
          accent="success"
        />
      </div>

      {/* Messages List Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">Conversations</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search messages or contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 w-60"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="All Conversations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="individual">Direct Messages</SelectItem>
                  <SelectItem value="group">Group Chats</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="starred">Starred</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showArchived ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                <Archive className="mr-1.5 h-3.5 w-3.5" />
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y border rounded-lg overflow-hidden">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No conversations found matching your filter criteria.
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => router.push(`/dashboard/communications/messages/${conversation.id}`)}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.participant.avatar} />
                        <AvatarFallback>
                          {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-background ${getStatusDot(conversation.participant.status)}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{conversation.participant.name}</span>
                        {conversation.type === 'group' ? (
                          <Badge variant="neutral" className="text-xs">
                            <Users className="mr-1 h-3 w-3" />
                            Group
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {conversation.participant.role}
                          </span>
                        )}
                        {conversation.unreadCount > 0 && (
                          <Badge variant="primary" className="text-xs h-4 px-1.5">
                            {conversation.unreadCount} new
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(conversation.lastMessage.timestamp)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleStarToggle(conversation.id, e)}
                    >
                      <Star className={`h-4 w-4 ${conversation.isStarred ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleArchiveToggle(conversation.id, e)}
                    >
                      <Archive className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}