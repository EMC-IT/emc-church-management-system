'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Megaphone,
  Edit,
  Trash2,
  Share2,
  Calendar,
  Users,
  Eye,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Send,
  Copy
} from 'lucide-react';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';

// Mock data - in real app, this would come from API
const mockAnnouncement = {
  id: '1',
  title: 'Sunday Service Update',
  content: `Dear Church Family,

We hope this message finds you well and blessed. We wanted to inform you of an important update regarding this Sunday's service schedule.

Please note that this Sunday's service will start at 10:00 AM instead of the usual 9:30 AM. This change is to accommodate our special guest speaker, Pastor Michael Thompson, who will be sharing a powerful message about "Walking in Faith During Challenging Times."

We encourage everyone to arrive a few minutes early to fellowship and prepare our hearts for worship. Coffee and light refreshments will be available in the fellowship hall starting at 9:30 AM.

We look forward to seeing you all there for what promises to be a blessed and inspiring service.

God bless,
Pastor John`,
  status: 'published',
  priority: 'high',
  targetAudience: 'All Members',
  scheduledDate: '2024-01-15T09:00:00Z',
  publishedDate: '2024-01-14T10:30:00Z',
  expiryDate: '2024-01-22T23:59:59Z',
  createdAt: '2024-01-10T14:30:00Z',
  updatedAt: '2024-01-14T10:30:00Z',
  author: {
    name: 'Pastor John',
    email: 'pastor.john@emcchurch.org',
    avatar: '/avatars/pastor-john.jpg',
    role: 'Senior Pastor'
  },
  stats: {
    views: 245,
    engagement: 89,
    shares: 12,
    comments: 8
  },
  settings: {
    sendNotification: true,
    allowComments: true,
    isScheduled: false
  }
};

const mockComments = [
  {
    id: '1',
    author: 'Sarah Wilson',
    avatar: '/avatars/sarah.jpg',
    content: 'Thank you for the update! Looking forward to hearing Pastor Thompson.',
    timestamp: '2024-01-14T11:15:00Z',
    likes: 5
  },
  {
    id: '2',
    author: 'Michael Davis',
    avatar: '/avatars/michael.jpg',
    content: 'Will there be childcare available during the service?',
    timestamp: '2024-01-14T12:30:00Z',
    likes: 2
  },
  {
    id: '3',
    author: 'Mary Johnson',
    avatar: '/avatars/mary.jpg',
    content: 'Excited for this special service! See everyone there.',
    timestamp: '2024-01-14T14:45:00Z',
    likes: 8
  }
];

export default function AnnouncementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [announcement, setAnnouncement] = useState(mockAnnouncement);
  const [comments, setComments] = useState(mockComments);
  const [isLoading, setIsLoading] = useState(false);
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    // In real app, fetch announcement by ID
    // fetchAnnouncement(params.id);
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'scheduled': return 'secondary';
      case 'draft': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'draft': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Eye className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/communications/announcements/${params.id}/edit`);
  };

  const handleDeleteClick = () => {
    deleteDialog.openDialog(announcement);
  };

  const handleDelete = async (announcementToDelete: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Announcement deleted successfully');
    router.push('/dashboard/communications/announcements');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
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
        
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Megaphone className="h-6 w-6 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Announcement Details</h1>
            <p className="text-muted-foreground">View and manage announcement information</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteClick} disabled={isLoading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcement Content */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(announcement.status)} className="flex items-center gap-1">
                      {getStatusIcon(announcement.status)}
                      {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                    </Badge>
                    <Badge variant={getPriorityColor(announcement.priority)} className="flex items-center gap-1">
                      {getPriorityIcon(announcement.priority)}
                      {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} Priority
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                </div>
              </div>
              
              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4">
                <Avatar>
                  <AvatarImage src={announcement.author.avatar} />
                  <AvatarFallback>{announcement.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{announcement.author.name}</p>
                  <p className="text-sm text-muted-foreground">{announcement.author.role}</p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  Published {formatRelativeTime(announcement.publishedDate)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {announcement.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          {announcement.settings.allowComments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Comments ({comments.length})
                </CardTitle>
                <CardDescription>Member responses and feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          👍 {comment.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No comments yet. Be the first to respond!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Views</span>
                </div>
                <span className="font-semibold">{announcement.stats.views}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Comments</span>
                </div>
                <span className="font-semibold">{announcement.stats.comments}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Shares</span>
                </div>
                <span className="font-semibold">{announcement.stats.shares}</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement Rate</span>
                <span className="font-semibold text-green-600">{announcement.stats.engagement}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Target Audience</span>
                </div>
                <p className="text-sm pl-6">{announcement.targetAudience}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Scheduled Date</span>
                </div>
                <p className="text-sm pl-6">{formatDate(announcement.scheduledDate)}</p>
              </div>
              
              {announcement.expiryDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Expires</span>
                  </div>
                  <p className="text-sm pl-6">{formatDate(announcement.expiryDate)}</p>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Notifications</span>
                </div>
                <p className="text-sm pl-6">
                  {announcement.settings.sendNotification ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Comments</span>
                </div>
                <p className="text-sm pl-6">
                  {announcement.settings.allowComments ? 'Allowed' : 'Disabled'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps Card */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Created:</span>
                <br />
                <span className="text-muted-foreground">{formatDate(announcement.createdAt)}</span>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">Published:</span>
                <br />
                <span className="text-muted-foreground">{formatDate(announcement.publishedDate)}</span>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">Last Updated:</span>
                <br />
                <span className="text-muted-foreground">{formatDate(announcement.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => deleteDialog.handleConfirm(handleDelete)}
        title="Delete Announcement"
        itemName={announcement.title}
        loading={deleteDialog.loading}
      />
    </div>
  );
}