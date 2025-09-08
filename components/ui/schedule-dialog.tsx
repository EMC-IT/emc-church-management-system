'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Repeat, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScheduleData {
  date: string;
  time: string;
  timezone: string;
  recurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  recurringEnd?: string;
}

export interface ScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scheduleData: ScheduleData) => void;
  title?: string;
  description?: string;
  initialData?: Partial<ScheduleData>;
  loading?: boolean;
  className?: string;
}

const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

const recurringTypes = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function ScheduleDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title = 'Schedule Item',
  description = 'Choose when to send this item',
  initialData = {},
  loading = false,
  className,
}: ScheduleDialogProps) {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    date: '',
    time: '',
    timezone: 'UTC',
    recurring: false,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof ScheduleData, value: string | boolean) => {
    setScheduleData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!scheduleData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(`${scheduleData.date}T${scheduleData.time || '00:00'}`);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.date = 'Please select a future date and time';
      }
    }

    if (!scheduleData.time) {
      newErrors.time = 'Time is required';
    }

    if (scheduleData.recurring && !scheduleData.recurringType) {
      newErrors.recurringType = 'Please select recurring frequency';
    }

    if (scheduleData.recurring && scheduleData.recurringEnd) {
      const endDate = new Date(scheduleData.recurringEnd);
      const startDate = new Date(`${scheduleData.date}T${scheduleData.time}`);
      if (endDate <= startDate) {
        newErrors.recurringEnd = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm(scheduleData);
    }
  };

  const getPreviewText = () => {
    if (!scheduleData.date || !scheduleData.time) return 'Please select date and time';
    
    const dateTime = new Date(`${scheduleData.date}T${scheduleData.time}`);
    const formattedDate = dateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = dateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let preview = `${formattedDate} at ${formattedTime}`;
    
    if (scheduleData.timezone !== 'UTC') {
      const timezone = timezones.find(tz => tz.value === scheduleData.timezone);
      preview += ` (${timezone?.label || scheduleData.timezone})`;
    }

    if (scheduleData.recurring && scheduleData.recurringType) {
      preview += ` - Repeats ${scheduleData.recurringType}`;
      if (scheduleData.recurringEnd) {
        const endDate = new Date(scheduleData.recurringEnd).toLocaleDateString();
        preview += ` until ${endDate}`;
      }
    }

    return preview;
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-[500px]', className)}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-brand-primary" />
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={scheduleData.date}
                min={getTodayDate()}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={scheduleData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={errors.time ? 'border-destructive' : ''}
              />
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={scheduleData.timezone}
              onValueChange={(value) => handleInputChange('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {timezone.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={scheduleData.recurring}
                onCheckedChange={(checked) => handleInputChange('recurring', checked)}
              />
              <Label htmlFor="recurring" className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Make this recurring
              </Label>
            </div>

            {scheduleData.recurring && (
              <div className="space-y-4 pl-6 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="recurringType">Frequency *</Label>
                  <Select
                    value={scheduleData.recurringType || ''}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                      handleInputChange('recurringType', value)
                    }
                  >
                    <SelectTrigger className={errors.recurringType ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {recurringTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.recurringType && (
                    <p className="text-sm text-destructive">{errors.recurringType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurringEnd">End Date (Optional)</Label>
                  <Input
                    id="recurringEnd"
                    type="date"
                    value={scheduleData.recurringEnd || ''}
                    min={scheduleData.date}
                    onChange={(e) => handleInputChange('recurringEnd', e.target.value)}
                    className={errors.recurringEnd ? 'border-destructive' : ''}
                  />
                  {errors.recurringEnd && (
                    <p className="text-sm text-destructive">{errors.recurringEnd}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{getPreviewText()}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !scheduleData.date || !scheduleData.time}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

ScheduleDialog.displayName = 'ScheduleDialog';

// Hook for managing schedule dialog state
export function useScheduleDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState<Partial<ScheduleData>>({});

  const openDialog = (initialData?: Partial<ScheduleData>) => {
    setScheduleData(initialData || {});
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setScheduleData({});
    setLoading(false);
  };

  const handleConfirm = async (onSchedule: (data: ScheduleData) => Promise<void>) => {
    try {
      setLoading(true);
      await onSchedule(scheduleData as ScheduleData);
      closeDialog();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return {
    isOpen,
    loading,
    scheduleData,
    openDialog,
    closeDialog,
    handleConfirm,
  };
}