'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Clock, MapPin, Users, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  'Worship',
  'Study',
  'Conference',
  'Outreach',
  'Social',
  'Training',
  'Youth',
  'Children',
  'Prayer',
  'Fellowship'
];

const groups = [
  { id: '1', name: 'Youth Ministry' },
  { id: '2', name: 'Children Ministry' },
  { id: '3', name: 'Worship Team' },
  { id: '4', name: 'Ushering Team' },
  { id: '5', name: 'Media Team' },
  { id: '6', name: 'Prayer Team' },
  { id: '7', name: 'Outreach Team' },
  { id: '8', name: 'Finance Committee' }
];

// Mock existing event data
const mockEventData = {
  id: '1',
  title: 'Sunday Service',
  description: 'Weekly Sunday worship service with communion and special music ministry.',
  category: 'Worship',
  date: new Date('2024-01-21'),
  startTime: '10:00',
  endTime: '12:00',
  location: 'Main Sanctuary',
  maxAttendees: '500',
  registrationRequired: true,
  registrationDeadline: new Date('2024-01-20'),
  organizer: 'Pastor John Smith',
  contactEmail: 'pastor.john@church.com',
  contactPhone: '(555) 123-4567',
  notes: 'Please arrive 15 minutes early for seating. Communion will be served during the service.',
  linkedGroups: ['3', '4', '5'] // Worship Team, Ushering Team, Media Team
};

interface EventFormData {
  title: string;
  description: string;
  category: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  location: string;
  maxAttendees: string;
  registrationRequired: boolean;
  registrationDeadline: Date | undefined;
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  linkedGroups: string[];
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    date: undefined,
    startTime: '',
    endTime: '',
    location: '',
    maxAttendees: '',
    registrationRequired: false,
    registrationDeadline: undefined,
    organizer: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
    linkedGroups: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  useEffect(() => {
    // Simulate loading existing event data
    const loadEventData = async () => {
      setInitialLoading(true);
      try {
        // In real app, fetch data based on params.id
        await new Promise(resolve => setTimeout(resolve, 500));
        setFormData({
          title: mockEventData.title,
          description: mockEventData.description,
          category: mockEventData.category,
          date: mockEventData.date,
          startTime: mockEventData.startTime,
          endTime: mockEventData.endTime,
          location: mockEventData.location,
          maxAttendees: mockEventData.maxAttendees,
          registrationRequired: mockEventData.registrationRequired,
          registrationDeadline: mockEventData.registrationDeadline,
          organizer: mockEventData.organizer,
          contactEmail: mockEventData.contactEmail,
          contactPhone: mockEventData.contactPhone,
          notes: mockEventData.notes,
          linkedGroups: mockEventData.linkedGroups
        });
      } catch (error) {
        toast.error('Failed to load event data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadEventData();
  }, [params.id]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Event date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.organizer.trim()) newErrors.organizer = 'Organizer is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Enter a valid email address';
    }

    if (formData.maxAttendees && isNaN(Number(formData.maxAttendees))) {
      newErrors.maxAttendees = 'Max attendees must be a number';
    }

    if (formData.endTime && formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
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

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Event updated successfully!');
      router.push(`/dashboard/events/${params.id}`);
    } catch (error) {
      toast.error('Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedGroups: prev.linkedGroups.includes(groupId)
        ? prev.linkedGroups.filter(id => id !== groupId)
        : [...prev.linkedGroups, groupId]
    }));
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href={`/dashboard/events/${params.id}`} aria-label="Back to Event Details">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Basic Information</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Annual Church Conference 2026"
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
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
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>

              <div className="col-span-12 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Event focus, schedule, and objectives..."
                  rows={3}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>
            </div>
          </div>
        </Card>

        {/* Date & Location */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Schedule & Location</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <DatePicker
                  id="date"
                  value={formData.date}
                  onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                  placeholder="Select event date"
                  error={!!errors.date}
                />
                {errors.date && <p className="text-xs text-destructive">{String(errors.date)}</p>}
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <TimePicker
                  id="startTime"
                  value={formData.startTime}
                  onChange={(startTime) => setFormData(prev => ({ ...prev, startTime }))}
                  placeholder="Select start time"
                  error={!!errors.startTime}
                />
                {errors.startTime && <p className="text-xs text-destructive">{errors.startTime}</p>}
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <TimePicker
                  id="endTime"
                  value={formData.endTime}
                  onChange={(endTime) => setFormData(prev => ({ ...prev, endTime }))}
                  placeholder="Select end time"
                  error={!!errors.endTime}
                />
                {errors.endTime && <p className="text-xs text-destructive">{errors.endTime}</p>}
              </div>

              <div className="col-span-12 sm:col-span-6 lg:col-span-3 space-y-2">
                <Label htmlFor="location">Location / Venue *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Main Sanctuary"
                />
                {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
              </div>
            </div>
          </div>
        </Card>

        {/* Capacity & Registration Settings */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Capacity & Registration</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="maxAttendees">Max Attendees</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                  placeholder="Leave empty for unlimited"
                />
                {errors.maxAttendees && <p className="text-xs text-destructive">{errors.maxAttendees}</p>}
              </div>

              <div className="col-span-12 sm:col-span-4 flex items-center pt-6 space-x-2">
                <Checkbox
                  id="registrationRequired"
                  checked={formData.registrationRequired}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registrationRequired: !!checked }))}
                />
                <Label htmlFor="registrationRequired" className="text-xs text-foreground cursor-pointer">
                  Require attendee registration
                </Label>
              </div>

              {formData.registrationRequired && (
                <div className="col-span-12 sm:col-span-4 space-y-2">
                  <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                  <DatePicker
                    id="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={(date) => setFormData(prev => ({ ...prev, registrationDeadline: date }))}
                    placeholder="Select deadline"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Organizer Information */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Organizer Information</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="organizer">Organizer Name *</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                  placeholder="Pastor David Appiah"
                />
                {errors.organizer && <p className="text-xs text-destructive">{errors.organizer}</p>}
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="organizer@example.com"
                />
                {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+233 24 123 4567"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Linked Groups & Notes */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Linked Groups & Special Notes</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 space-y-2">
                <Label className="text-xs text-muted-foreground">Linked Groups / Departments</Label>
                <div className="grid grid-cols-12 gap-3 pt-1">
                  {groups.map((group) => (
                    <div key={group.id} className="col-span-12 sm:col-span-6 lg:col-span-3 flex items-center space-x-2 p-2.5 rounded-lg border border-border/50 bg-muted/20">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={formData.linkedGroups.includes(group.id)}
                        onCheckedChange={() => handleGroupToggle(group.id)}
                      />
                      <Label htmlFor={`group-${group.id}`} className="text-xs font-medium cursor-pointer">
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-12 space-y-2 pt-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special instructions, setup requirements, or equipment needs..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/events/${params.id}`)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}