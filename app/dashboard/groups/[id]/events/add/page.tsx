'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as UILabel } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupEvent, GroupEventFormData } from '@/lib/types/groups';
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
  'Conference',
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
    type: '',
    startDate: '',
    endDate: '',
    location: '',
    maxAttendees: 50,
    registrationRequired: true,
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
      
      // Load group details
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      }
      
      // If editing, load event data
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
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GroupEventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Event type is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date and time is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date and time is required';
    }
    
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.maxAttendees < 1) {
      newErrors.maxAttendees = 'Maximum attendees must be at least 1';
    }
    
    if (formData.registrationRequired && formData.registrationDeadline) {
      const deadline = new Date(formData.registrationDeadline);
      const startDate = new Date(formData.startDate);
      
      if (deadline >= startDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before event start';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const eventData = {
        ...formData,
        groupId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationDeadline: formData.registrationDeadline ? 
          new Date(formData.registrationDeadline).toISOString() : undefined
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
        toast.error(response.message || `Failed to ${isEditing ? 'update' : 'create'} event`);
      }
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} event`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/groups/${groupId}/events`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isEditing ? 'Edit Event' : 'Create New Event'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Update event details' : 'Create a new event for'} {group?.name}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Event Details</span>
                </CardTitle>
                <CardDescription>
                  Basic information about the event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <UILabel htmlFor="title">Event Title *</UILabel>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter event title"
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.title}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <UILabel htmlFor="type">Event Type *</UILabel>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.type}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <UILabel htmlFor="status">Status</UILabel>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
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
                  
                  <div className="md:col-span-2">
                    <UILabel htmlFor="description">Description *</UILabel>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the event"
                      rows={3}
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Date & Time</span>
                </CardTitle>
                <CardDescription>
                  When will this event take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <UILabel htmlFor="startDate">Start Date & Time *</UILabel>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={errors.startDate ? 'border-destructive' : ''}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.startDate}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <UILabel htmlFor="endDate">End Date & Time *</UILabel>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={errors.endDate ? 'border-destructive' : ''}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.endDate}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Location</span>
                </CardTitle>
                <CardDescription>
                  Where will this event be held?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <UILabel htmlFor="location">Event Location *</UILabel>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter event location"
                    className={errors.location ? 'border-destructive' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.location}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Registration</span>
                </CardTitle>
                <CardDescription>
                  Configure event registration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <UILabel htmlFor="maxAttendees">Maximum Attendees *</UILabel>
                  <Input
                    id="maxAttendees"
                    type="number"
                    min="1"
                    value={formData.maxAttendees}
                    onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value) || 0)}
                    className={errors.maxAttendees ? 'border-destructive' : ''}
                  />
                  {errors.maxAttendees && (
                    <p className="text-sm text-destructive mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.maxAttendees}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="registrationRequired"
                    checked={formData.registrationRequired}
                    onCheckedChange={(checked) => handleInputChange('registrationRequired', checked)}
                  />
                  <UILabel htmlFor="registrationRequired">Registration Required</UILabel>
                </div>
                
                {formData.registrationRequired && (
                  <div>
                    <UILabel htmlFor="registrationDeadline">Registration Deadline</UILabel>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={formData.registrationDeadline}
                      onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                      className={errors.registrationDeadline ? 'border-destructive' : ''}
                    />
                    {errors.registrationDeadline && (
                      <p className="text-sm text-destructive mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.registrationDeadline}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty for no deadline
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>
                  Any additional information about the event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <UILabel htmlFor="notes">Notes</UILabel>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes or instructions"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}