'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupEventFormData } from '@/lib/types/groups';
import { toast } from 'sonner';

const eventTypes = [
  'Meeting',
  'Bible Study',
  'Prayer Meeting',
  'Fellowship',
  'Service Project',
  'Outreach',
  'Training',
  'Social Event',
  'Workshop',
  'Other'
];

const statusOptions = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

export default function AddGroupEventPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const groupId = params.id as string;
  const editEventId = searchParams.get('edit');
  const isEditing = !!editEventId;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<GroupEventFormData>({
    title: '',
    description: '',
    type: 'Meeting',
    startDate: '',
    endDate: '',
    location: '',
    maxAttendees: 50,
    registrationRequired: false,
    registrationDeadline: '',
    status: 'Upcoming',
    notes: ''
  });

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId, editEventId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      }
      
      if (isEditing && editEventId) {
        const eventResponse = await groupsService.getGroupEvent(editEventId);
        if (eventResponse.success && eventResponse.data) {
          const event = eventResponse.data;
          setFormData({
            title: event.title,
            description: event.description,
            type: event.type,
            startDate: new Date(event.startDate).toISOString().slice(0, 16),
            endDate: new Date(event.endDate).toISOString().slice(0, 16),
            location: event.location,
            maxAttendees: event.maxAttendees,
            registrationRequired: event.registrationRequired,
            registrationDeadline: event.registrationDeadline ? 
              new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
            status: event.status,
            notes: event.notes || ''
          });
        }
      }
    } catch {
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GroupEventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.startDate) newErrors.startDate = 'Start date/time is required';
    if (!formData.endDate) newErrors.endDate = 'End date/time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const eventData = {
        ...formData,
        groupId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };
      
      let response;
      if (isEditing && editEventId) {
        response = await groupsService.updateGroupEvent(editEventId, eventData);
      } else {
        response = await groupsService.createGroupEvent(groupId, eventData);
      }
      
      if (response.success) {
        toast.success(`Event ${isEditing ? 'updated' : 'created'} successfully`);
        router.push(`/dashboard/groups/${groupId}/events`);
      } else {
        toast.error(response.message || 'Failed to save event');
      }
    } catch {
      toast.error('Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/groups/${groupId}/events`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {isEditing ? 'Edit Group Event' : 'Add Group Event'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? 'Update the details for this event.' : 'Schedule a new meeting, Bible study, prayer session, or outreach.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Event Information</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Monthly Fellowship Meetup"
                  required
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              <div className="col-span-12 sm:col-span-3 space-y-2">
                <Label htmlFor="type">Event Type *</Label>
                <Select value={formData.type} onValueChange={(val) => handleInputChange('type', val)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-3 space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(val) => handleInputChange('status', val)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Event details and agenda..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Date & Location</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="startDate">Start Date & Time *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="endDate">End Date & Time *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                />
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="location">Location / Venue *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g. Main Sanctuary"
                  required
                />
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="maxAttendees">Expected Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/groups/${groupId}/events`)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                {isEditing ? 'Save Changes' : 'Create Event'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}