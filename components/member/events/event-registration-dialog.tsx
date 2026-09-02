'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check, Ticket, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MemberEvent, MemberEventRegistration } from '@/lib/types/member';
import {
  eventRegistrationSchema,
  EventRegistrationFormData,
} from '@/lib/validation/member';
import { memberEventsService } from '@/services/member';
import { mockCurrentMember } from '@/lib/mock/member';

export interface EventRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: MemberEvent | null;
  onSuccess?: (registration: MemberEventRegistration) => void;
}

export function EventRegistrationDialog({
  open,
  onOpenChange,
  event,
  onSuccess,
}: EventRegistrationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedRegistration, setConfirmedRegistration] =
    useState<MemberEventRegistration | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationSchema),
    values: {
      eventId: event?.id || '',
      fullName: mockCurrentMember.displayName || `${mockCurrentMember.firstName} ${mockCurrentMember.lastName}`,
      email: mockCurrentMember.email,
      phone: mockCurrentMember.phone,
      attendanceType: 'In-Person',
      answers: {},
      specialRequirements: '',
    },
  });

  const attendanceType = watch('attendanceType');

  const onSubmit = async (data: EventRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const res = await memberEventsService.registerForEvent(data);
      setConfirmedRegistration(res.registration);
      if (onSuccess) onSuccess(res.registration);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedRegistration(null);
    reset();
    onOpenChange(false);
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {confirmedRegistration ? (
          /* Confirmation Success State */
          <div className="py-4 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Check className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-bold text-lg text-foreground">
                Registration Confirmed!
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You are registered for{' '}
                <strong className="text-foreground">{event.title}</strong>.
              </p>
            </div>

            {/* Ticket Card Box */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border/50 text-left space-y-2 max-w-sm mx-auto text-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground text-[11px]">Ticket Code</span>
                <span className="font-mono font-bold text-primary text-sm tracking-wider">
                  {confirmedRegistration.ticketReference}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Attendee</span>
                <span className="font-medium text-foreground">
                  {confirmedRegistration.attendeeName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground">
                  {confirmedRegistration.attendanceType}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <Button type="button" size="sm" onClick={handleClose} className="min-w-28 font-medium">
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Registration Form State */
          <>
            <DialogHeader>
              <DialogTitle>Register for {event.title}</DialogTitle>
              <DialogDescription className="text-xs">
                {event.branch} • {event.venue}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
              <input type="hidden" {...register('eventId')} />

              {/* Event Fee Notice if applicable */}
              {event.fee && !event.fee.isFree && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">Registration Fee:</span>
                  <span className="font-bold text-primary text-sm">
                    {event.fee.currency} {event.fee.amount}
                  </span>
                </div>
              )}

              {/* Contact Info (Pre-populated) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="fullName" className="text-xs">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    className="h-9 text-xs"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-9 text-xs"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    className="h-9 text-xs"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Attendance Type */}
              <div className="space-y-1.5 text-xs">
                <Label htmlFor="attendanceType" className="text-xs">
                  Attendance Mode *
                </Label>
                <Select
                  value={attendanceType}
                  onValueChange={(val) =>
                    setValue('attendanceType', val as 'In-Person' | 'Online')
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select attendance mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-Person">In-Person (at {event.venue})</SelectItem>
                    {event.isOnline && (
                      <SelectItem value="Online">Online Livestream</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Event Questions if any */}
              {event.customQuestions && event.customQuestions.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Event Questions
                  </span>

                  {event.customQuestions.map((q) => (
                    <div key={q.id} className="space-y-1.5">
                      <Label className="text-xs">
                        {q.label} {q.required && '*'}
                      </Label>

                      {q.type === 'select' && q.options ? (
                        <Select
                          onValueChange={(val) =>
                            setValue(`answers.${q.id}`, val)
                          }
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {q.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder={q.placeholder || 'Your answer'}
                          className="h-9 text-xs"
                          onChange={(e) =>
                            setValue(`answers.${q.id}`, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Special Requirements / Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="specialRequirements" className="text-xs">
                  Special Notes or Dietary Requests (Optional)
                </Label>
                <Textarea
                  id="specialRequirements"
                  placeholder="Any extra details for the organizers..."
                  rows={2}
                  className="text-xs"
                  {...register('specialRequirements')}
                />
              </div>

              <DialogFooter className="pt-2 border-t border-border/40 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  Cancel
                </Button>

                <Button type="submit" size="sm" disabled={isSubmitting} className="font-medium">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Confirm Registration</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
