'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupFormData } from '@/lib/types/groups';
import { toast } from 'sonner';
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

const categories = ['Ministry', 'Fellowship', 'Study', 'Prayer', 'Outreach', 'Service'];
const statusOptions = ['Active', 'Inactive', 'Archived'];

export default function EditGroupPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    category: '',
    leader: {
      id: '',
      name: '',
      email: '',
      phone: ''
    },
    maxMembers: 50,
    meetingSchedule: '',
    location: '',
    status: 'Active'
  });

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  const loadGroup = async () => {
    try {
      const response = await groupsService.getGroup(groupId);
      if (response.success && response.data) {
        const groupData = response.data;
        setGroup(groupData);
        setFormData({
          name: groupData.name,
          description: groupData.description,
          category: groupData.category,
          leader: groupData.leader,
          maxMembers: groupData.maxMembers,
          meetingSchedule: groupData.meetingSchedule,
          location: groupData.location,
          status: groupData.status
        });
      } else {
        toast.error('Group not found');
        router.push('/dashboard/groups');
      }
    } catch {
      toast.error('Failed to load group');
      router.push('/dashboard/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('leader.')) {
      const leaderField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        leader: {
          ...prev.leader,
          [leaderField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    
    if (!formData.leader.name.trim()) {
      toast.error('Group leader name is required');
      return;
    }
    
    setSaving(true);
    try {
      const response = await groupsService.updateGroup(groupId, formData);
      if (response.success) {
        toast.success('Group updated successfully');
        router.push(`/dashboard/groups/${groupId}`);
      } else {
        toast.error(response.message || 'Failed to update group');
      }
    } catch {
      toast.error('Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await groupsService.deleteGroup(groupId);
      if (response.success) {
        toast.success('Group deleted successfully');
        router.push('/dashboard/groups');
      } else {
        toast.error(response.message || 'Failed to delete group');
      }
    } catch {
      toast.error('Failed to delete group');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-bold">Group Not Found</h2>
          <Button onClick={() => router.push('/dashboard/groups')} size="sm" className="mt-4">
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/groups/${groupId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Group</h1>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive shrink-0">
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Group
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{group.name}&quot;? This action cannot be undone and will remove all group records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Deleting...' : 'Delete Group'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Basic Information</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Youth Fellowship"
                  required
                />
              </div>
              
              <div className="col-span-12 sm:col-span-3 space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-3 space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="maxMembers">Maximum Capacity</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  value={formData.maxMembers}
                  onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value) || 0)}
                  placeholder="50"
                  min="1"
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
                <Input
                  id="meetingSchedule"
                  value={formData.meetingSchedule}
                  onChange={(e) => handleInputChange('meetingSchedule', e.target.value)}
                  placeholder="Fridays at 6:00 PM"
                />
              </div>
              
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="location">Location / Venue</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Youth Center"
                />
              </div>

              <div className="col-span-12 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Purpose, focus, and meeting details..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Group Leader */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Group Leader</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="leaderName">Leader Name *</Label>
                <Input
                  id="leaderName"
                  value={formData.leader.name}
                  onChange={(e) => handleInputChange('leader.name', e.target.value)}
                  placeholder="Grace Mensah"
                  required
                />
              </div>
              
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="leaderEmail">Leader Email *</Label>
                <Input
                  id="leaderEmail"
                  type="email"
                  value={formData.leader.email}
                  onChange={(e) => handleInputChange('leader.email', e.target.value)}
                  placeholder="leader@example.com"
                  required
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="leaderPhone">Leader Phone</Label>
                <Input
                  id="leaderPhone"
                  value={formData.leader.phone}
                  onChange={(e) => handleInputChange('leader.phone', e.target.value)}
                  placeholder="+233 24 123 4567"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/groups/${groupId}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}