'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, PriorityBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Heart,
  Edit,
  Trash2,
  Lock,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  TrendingUp,
  FileText,
  Share2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

// Mock data - replace with API call
const mockPrayerRequest = {
  id: '1',
  title: 'Healing for Sister Mary',
  description: 'Please pray for Sister Mary who is recovering from surgery. She had a major operation last week and is currently in the hospital. The doctors say the surgery went well, but she needs time to recover. Please pray for complete healing, strength during recovery, and comfort for her family during this difficult time.',
  category: 'healing',
  priority: 'High',
  status: 'In Progress',
  isConfidential: false,
  isAnonymous: false,
  requester: {
    id: 'user1',
    name: 'John Smith',
    email: 'john.smith@church.com',
    phone: '+233 24 123 4567',
    avatar: null,
  },
  assignedTo: {
    id: 'team1',
    name: 'Prayer Warriors',
    type: 'team',
  },
  createdAt: '2024-01-20T10:30:00Z',
  updatedAt: '2024-01-22T14:20:00Z',
  prayerCount: 45,
  comments: [
    {
      id: 'c1',
      user: 'Pastor David',
      message: 'Added to our prayer list. We will be praying for Sister Mary during our next prayer meeting.',
      timestamp: '2024-01-20T11:00:00Z',
    },
    {
      id: 'c2',
      user: 'Elder Mary',
      message: 'Visited Sister Mary at the hospital today. She is in good spirits and grateful for the prayers.',
      timestamp: '2024-01-21T15:30:00Z',
    },
    {
      id: 'c3',
      user: 'John Smith',
      message: 'Update: Sister Mary is making good progress. Doctors are pleased with her recovery.',
      timestamp: '2024-01-22T09:15:00Z',
    },
  ],
  prayerUpdates: [
    {
      id: 'u1',
      user: 'Prayer Warriors',
      action: 'prayed',
      message: '15 members prayed for this request during Sunday service',
      timestamp: '2024-01-21T11:00:00Z',
    },
    {
      id: 'u2',
      user: 'Intercessory Team',
      action: 'prayed',
      message: 'Added to 24/7 prayer chain',
      timestamp: '2024-01-21T16:00:00Z',
    },
  ],
};

const PRAYER_STATUS_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Answered', label: 'Answered' },
  { value: 'Closed', label: 'Closed' },
];

export default function PrayerRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [prayerRequest, setPrayerRequest] = useState(mockPrayerRequest);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState(prayerRequest.status);

  const handleStatusChange = async (status: string) => {
    try {
      setPrayerRequest({ ...prayerRequest, status });
      setNewStatus(status);
      
      toast({
        title: 'Status Updated',
        description: `Prayer request status updated to ${status}`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const newCommentObj = {
        id: `c${Date.now()}`,
        user: 'Current User',
        message: newComment,
        timestamp: new Date().toISOString(),
      };
      
      setPrayerRequest({
        ...prayerRequest,
        comments: [...prayerRequest.comments, newCommentObj],
      });
      
      setNewComment('');
      
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      toast({
        title: 'Prayer Request Deleted',
        description: 'The prayer request has been deleted successfully',
      });
      
      router.push('/dashboard/prayer-requests');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete prayer request',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            asChild
          >
            <Link href="/dashboard/prayer-requests" aria-label="Back to Prayer Requests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{prayerRequest.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/prayer-requests/${params.id}/edit`}>
              <Edit className="mr-1.5 h-4 w-4" />
              Edit
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Prayer Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this prayer request? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">{prayerRequest.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted on {new Date(prayerRequest.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <PriorityBadge priority={prayerRequest.priority.toLowerCase() as any} size="sm" />
                  <StatusBadge status={prayerRequest.status.toLowerCase() as any} size="sm" />
                  {prayerRequest.isConfidential && (
                    <Badge variant="neutral" size="sm">
                      <Lock className="h-3 w-3" />
                      Confidential
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {prayerRequest.description}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="font-medium capitalize text-foreground">{prayerRequest.category.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Intercessors</p>
                  <p className="font-medium text-foreground">{prayerRequest.prayerCount} praying</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-medium text-foreground">
                    {new Date(prayerRequest.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                  <p className="font-medium text-foreground">
                    {prayerRequest.assignedTo.name}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Prayer Action Button */}
              <Button className="w-full">
                <Heart className="mr-2 h-4 w-4" />
                I&apos;m Praying for This
              </Button>
            </CardContent>
          </Card>

          {/* Comments & Updates Tabs */}
          <Card>
            <Tabs defaultValue="comments" className="w-full">
              <CardHeader className="pb-3">
                <TabsList>
                  <TabsTrigger value="comments">
                    Comments ({prayerRequest.comments.length})
                  </TabsTrigger>
                  <TabsTrigger value="updates">
                    Prayer Updates ({prayerRequest.prayerUpdates.length})
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="comments" className="space-y-4 pt-1">
                  {/* Add Comment */}
                  <div className="space-y-2">
                    <Label htmlFor="new-comment" className="text-xs font-medium">Add a Comment</Label>
                    <Textarea
                      id="new-comment"
                      placeholder="Share an update or encouragement..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button 
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Post Comment
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Comments List */}
                  <div className="space-y-4">
                    {prayerRequest.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-7 w-7 mt-0.5">
                          <AvatarFallback className="text-[10px]">
                            {comment.user.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">{comment.user}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="updates" className="space-y-3 pt-1">
                  <div className="space-y-2">
                    {prayerRequest.prayerUpdates.map((update) => (
                      <div key={update.id} className="p-3 rounded-lg border bg-muted/30 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">{update.user}</span>
                            <Badge variant="neutral" size="sm" className="text-[10px]">{update.action}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{update.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(update.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="status-select" className="text-xs text-muted-foreground">Current Status</Label>
                <Select value={newStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRAYER_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Requester Info */}
          {!prayerRequest.isAnonymous && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Requester</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs font-medium">
                      {prayerRequest.requester.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-foreground">{prayerRequest.requester.name}</p>
                    <p className="text-xs text-muted-foreground">Member</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{prayerRequest.requester.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{prayerRequest.requester.phone}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  Contact Requester
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="mr-2 h-4 w-4" />
                Share Request
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Print Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
