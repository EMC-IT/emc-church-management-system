'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  User,
  TrendingUp,
  FileText,
  Share2
} from 'lucide-react';
import Link from 'next/link';
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

const PRAYER_STATUSES = [
  { value: 'New', label: 'New', icon: AlertCircle, color: 'default' },
  { value: 'In Progress', label: 'In Progress', icon: Clock, color: 'secondary' },
  { value: 'Answered', label: 'Answered', icon: CheckCircle2, color: 'default' },
  { value: 'Closed', label: 'Closed', icon: CheckCircle2, color: 'outline' },
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
      // TODO: Replace with actual API call
      console.log('Updating status to:', status);
      
      setPrayerRequest({ ...prayerRequest, status });
      setNewStatus(status);
      
      toast({
        title: 'Status Updated',
        description: `Prayer request status updated to ${status}`,
      });
    } catch (error) {
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
      // TODO: Replace with actual API call
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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      // TODO: Replace with actual API call
      console.log('Deleting prayer request:', params.id);
      
      toast({
        title: 'Prayer Request Deleted',
        description: 'The prayer request has been deleted successfully',
      });
      
      router.push('/dashboard/prayer-requests');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete prayer request',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    const statusObj = PRAYER_STATUSES.find(s => s.value === status);
    return (statusObj?.color as "default" | "secondary" | "outline" | "destructive") || 'default';
  };

  const StatusIcon = PRAYER_STATUSES.find(s => s.value === prayerRequest.status)?.icon || AlertCircle;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
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
            <Heart className="h-6 w-6 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{prayerRequest.title}</h1>
            <p className="text-muted-foreground">Prayer Request Details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/prayer-requests/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
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
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{prayerRequest.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Submitted on {new Date(prayerRequest.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(prayerRequest.priority)}>
                    {prayerRequest.priority}
                  </Badge>
                  <Badge variant={getStatusColor(prayerRequest.status)} className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {prayerRequest.status}
                  </Badge>
                  {prayerRequest.isConfidential && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Confidential
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {prayerRequest.description}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Category</p>
                  <p className="font-medium capitalize">{prayerRequest.category.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Prayer Count</p>
                  <p className="font-medium flex items-center gap-1">
                    <Heart className="h-4 w-4 text-brand-primary fill-brand-primary" />
                    {prayerRequest.prayerCount} people praying
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-medium">
                    {new Date(prayerRequest.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Assigned To</p>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {prayerRequest.assignedTo.name}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Prayer Button */}
              <Button className="w-full bg-brand-primary hover:bg-brand-primary/90">
                <Heart className="mr-2 h-4 w-4" />
                I'm Praying for This
              </Button>
            </CardContent>
          </Card>

          {/* Comments & Updates Tabs */}
          <Card>
            <Tabs defaultValue="comments" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comments">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comments ({prayerRequest.comments.length})
                  </TabsTrigger>
                  <TabsTrigger value="updates">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Prayer Updates ({prayerRequest.prayerUpdates.length})
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="comments" className="space-y-4">
                  {/* Add Comment */}
                  <div className="space-y-2">
                    <Label>Add a Comment</Label>
                    <Textarea
                      placeholder="Share an update or encouragement..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-brand-primary hover:bg-brand-primary/90"
                    >
                      Post Comment
                    </Button>
                  </div>

                  <Separator />

                  {/* Comments List */}
                  <div className="space-y-4">
                    {prayerRequest.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {comment.user.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{comment.user}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="updates" className="space-y-4">
                  <div className="space-y-4">
                    {prayerRequest.prayerUpdates.map((update) => (
                      <div key={update.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="p-2 bg-brand-primary/10 rounded-lg h-fit">
                          <Heart className="h-4 w-4 text-brand-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{update.user}</p>
                            <Badge variant="outline" className="text-xs">{update.action}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{update.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(update.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
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
            <CardHeader>
              <CardTitle className="text-sm">Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRAYER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <span className="flex items-center gap-2">
                          <status.icon className="h-3 w-3" />
                          {status.label}
                        </span>
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
              <CardHeader>
                <CardTitle className="text-sm">Requester Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {prayerRequest.requester.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{prayerRequest.requester.name}</p>
                    <p className="text-xs text-muted-foreground">Member</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{prayerRequest.requester.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{prayerRequest.requester.phone}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="mr-2 h-3 w-3" />
                  Contact Requester
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="mr-2 h-3 w-3" />
                Share Request
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="mr-2 h-3 w-3" />
                Print Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
