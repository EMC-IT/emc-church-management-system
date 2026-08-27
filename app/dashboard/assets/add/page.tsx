'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Upload, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import { AssetCategory, AssetStatus, AssetCondition, AssetPriority, AssetFormData } from '@/lib/types/assets';

// Form validation schema
const assetFormSchema = z.object({
  name: z.string().min(2, 'Asset name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.nativeEnum(AssetCategory, {
    required_error: 'Please select an asset category',
  }),
  status: z.nativeEnum(AssetStatus, {
    required_error: 'Please select an asset status',
  }),
  condition: z.nativeEnum(AssetCondition, {
    required_error: 'Please select an asset condition',
  }),
  priority: z.nativeEnum(AssetPriority, {
    required_error: 'Please select an asset priority',
  }),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  currentValue: z.number().min(0, 'Current value must be positive'),
  depreciationRate: z.number().min(0).max(100).optional(),
  currency: z.enum(['GHS', 'USD', 'EUR', 'GBP']).default('GHS'),
  location: z.string().min(1, 'Location is required'),
  assignedDepartment: z.string().optional(),
  assignedGroup: z.string().optional(),
  purchaseDate: z.date({
    required_error: 'Purchase date is required',
  }),
  warrantyExpiry: z.date().optional(),
  nextMaintenance: z.date().optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  notes: z.string().optional(),
  barcode: z.string().optional(),
  qrCode: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

// Category options with display names
const categoryOptions = [
  { value: AssetCategory.EQUIPMENT, label: 'Equipment' },
  { value: AssetCategory.FURNITURE, label: 'Furniture' },
  { value: AssetCategory.TECHNOLOGY, label: 'Technology' },
  { value: AssetCategory.VEHICLES, label: 'Vehicles' },
  { value: AssetCategory.PROPERTY, label: 'Property' },
  { value: AssetCategory.MUSICAL_INSTRUMENTS, label: 'Musical Instruments' },
  { value: AssetCategory.AUDIO_VISUAL, label: 'Audio Visual' },
  { value: AssetCategory.KITCHEN_APPLIANCES, label: 'Kitchen Appliances' },
  { value: AssetCategory.OFFICE_SUPPLIES, label: 'Office Supplies' },
  { value: AssetCategory.BOOKS_MEDIA, label: 'Books & Media' },
  { value: AssetCategory.SPORTS_RECREATION, label: 'Sports & Recreation' },
  { value: AssetCategory.SAFETY_SECURITY, label: 'Safety & Security' },
  { value: AssetCategory.OTHER, label: 'Other' },
];

const statusOptions = [
  { value: AssetStatus.ACTIVE, label: 'Active' },
  { value: AssetStatus.MAINTENANCE, label: 'Maintenance' },
  { value: AssetStatus.RETIRED, label: 'Retired' },
  { value: AssetStatus.DISPOSED, label: 'Disposed' },
  { value: AssetStatus.LOST, label: 'Lost' },
  { value: AssetStatus.DAMAGED, label: 'Damaged' },
  { value: AssetStatus.RESERVED, label: 'Reserved' },
];

const conditionOptions = [
  { value: AssetCondition.EXCELLENT, label: 'Excellent' },
  { value: AssetCondition.GOOD, label: 'Good' },
  { value: AssetCondition.FAIR, label: 'Fair' },
  { value: AssetCondition.POOR, label: 'Poor' },
  { value: AssetCondition.DAMAGED, label: 'Damaged' },
  { value: AssetCondition.NEEDS_REPAIR, label: 'Needs Repair' },
];

const priorityOptions = [
  { value: AssetPriority.LOW, label: 'Low' },
  { value: AssetPriority.MEDIUM, label: 'Medium' },
  { value: AssetPriority.HIGH, label: 'High' },
  { value: AssetPriority.CRITICAL, label: 'Critical' },
];

const currencyOptions = [
  { value: 'GHS', label: 'Ghana Cedi (₵)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
];

// Mock departments and locations
const departments = [
  'Administration',
  'Media Ministry',
  'Music Ministry',
  'Children Ministry',
  'Youth Ministry',
  'Facilities',
  'Security',
  'Kitchen',
  'Transportation'
];

const locations = [
  'Main Sanctuary',
  'Fellowship Hall',
  'Administrative Office',
  'Media Room',
  'Music Room',
  'Children\'s Area',
  'Youth Center',
  'Kitchen',
  'Storage Room',
  'Parking Area',
  'Security Office'
];

export default function AddAssetPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      currency: 'GHS',
      status: AssetStatus.ACTIVE,
      condition: AssetCondition.GOOD,
      priority: AssetPriority.MEDIUM,
      purchaseDate: new Date(),
    },
  });

  const onSubmit = async (data: AssetFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      console.log('Asset data:', { ...data, tags });
      
      // Here you would typically make an API call to create the asset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      router.push('/dashboard/assets');
    } catch (error) {
      console.error('Error creating asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/assets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Add New Asset</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Basic Information</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Asset Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Sound Mixing Console / Yamaha Grand Piano" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Condition *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Priority *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Asset description, specifications, and included accessories..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Financial Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Financial & Valuation</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Purchase Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Current Value *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depreciationRate"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Depreciation Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="10.0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Location and Assignment */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Location & Custody</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Location *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedDepartment"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Assigned Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedGroup"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Assigned Group</FormLabel>
                      <FormControl>
                        <Input placeholder="Worship Team / Youth Ministry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Dates */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Timeline & Maintenance</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Purchase Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select purchase date"
                          maxDate={new Date()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warrantyExpiry"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Warranty Expiry</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select warranty expiry"
                          minDate={new Date()}
                          clearable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextMaintenance"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Next Maintenance</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select next maintenance"
                          minDate={new Date()}
                          clearable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Technical Details */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Technical Specifications</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input placeholder="Yamaha / Sony / Dell" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="CL5 / XPS 15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="YM2023CL5001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Barcode Number</FormLabel>
                      <FormControl>
                        <Input placeholder="BAR-889021" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qrCode"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>QR Code Identifier</FormLabel>
                      <FormControl>
                        <Input placeholder="QR-AST-009" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Notes & Tags</h2>

              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Operational or historical notes regarding this asset..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="sanctuary, audio, high-value..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="neutral" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/assets')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Asset...' : 'Create Asset'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}