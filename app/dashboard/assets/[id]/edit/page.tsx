'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Save,
  X,
  Upload,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  Package,
  MapPin,
  Users,
  FileText,
  ArrowLeft,
  Edit
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { Asset, AssetCategory, AssetStatus, AssetCondition, AssetFormData } from '@/lib/types/assets';



// Validation schema
const assetFormSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  category: z.nativeEnum(AssetCategory),
  status: z.nativeEnum(AssetStatus),
  condition: z.nativeEnum(AssetCondition),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  currentValue: z.number().min(0, 'Current value must be positive'),
  depreciationRate: z.number().min(0).max(100).optional(),
  currency: z.string().default('GHS'),
  location: z.string().min(1, 'Location is required'),
  assignedTo: z.string().optional(),
  assignedDepartment: z.string().optional(),
  assignedGroup: z.string().optional(),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  warrantyExpiry: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  barcode: z.string().optional(),
  qrCode: z.string().optional()
});

type AssetFormValues = z.infer<typeof assetFormSchema>;

// Mock data for dropdowns
const departments = [
  'Media Ministry',
  'Worship Ministry',
  'Children Ministry',
  'Youth Ministry',
  'Administration',
  'Facilities',
  'Security',
  'Kitchen Ministry'
];

const groups = [
  'Sound Team',
  'Video Team',
  'Lighting Team',
  'Worship Team',
  'Choir',
  'Ushers',
  'Security Team',
  'Cleaning Team'
];

const locations = [
  'Main Sanctuary',
  'Fellowship Hall',
  'Children Church',
  'Youth Center',
  'Office Building',
  'Kitchen',
  'Storage Room',
  'Parking Lot',
  'Prayer Garden'
];

const people = [
  'John Smith',
  'Mary Johnson',
  'David Wilson',
  'Sarah Brown',
  'Michael Davis',
  'Lisa Anderson',
  'Robert Taylor',
  'Jennifer Wilson'
];

// Mock existing asset data
const mockAsset: Asset = {
  id: '1',
  name: 'Sound Mixing Console',
  description: 'Professional digital mixing console for main sanctuary audio system. Features 32 input channels, built-in effects, and digital recording capabilities.',
  category: AssetCategory.AUDIO_VISUAL,
  status: AssetStatus.ACTIVE,
  condition: AssetCondition.EXCELLENT,
  priority: 'high' as any,
  purchasePrice: 25000,
  currentValue: 22000,
  depreciationRate: 10,
  currency: 'GHS',
  location: 'Main Sanctuary',
  assignedTo: 'John Smith',
  assignedDepartment: 'Media Ministry',
  assignedGroup: 'Sound Team',
  purchaseDate: '2023-08-15',
  warrantyExpiry: '2025-08-15',
  lastMaintenance: '2023-12-01',
  nextMaintenance: '2024-06-01',
  serialNumber: 'YM2023CL5001',
  model: 'CL5',
  manufacturer: 'Yamaha',
  notes: 'Purchased for the new sanctuary audio upgrade project. Requires monthly calibration and quarterly deep cleaning.',
  tags: ['audio', 'professional', 'sanctuary', 'digital'],
  barcode: '1234567890123',
  qrCode: 'QR123456789',
  createdBy: 'admin',
  updatedBy: 'john.smith',
  createdAt: '2023-08-15T10:00:00Z',
  updatedAt: '2024-01-15T14:30:00Z'
};

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [newTag, setNewTag] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      currency: 'GHS',
      tags: []
    }
  });

  useEffect(() => {
    // Simulate API call to fetch asset data
    const fetchAsset = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAsset(mockAsset);

        // Populate form with existing data
        form.reset({
          name: mockAsset.name,
          description: mockAsset.description || '',
          category: mockAsset.category,
          status: mockAsset.status,
          condition: mockAsset.condition,
          priority: mockAsset.priority as any,
          purchasePrice: mockAsset.purchasePrice,
          currentValue: mockAsset.currentValue,
          depreciationRate: mockAsset.depreciationRate,
          currency: mockAsset.currency,
          location: mockAsset.location,
          assignedTo: mockAsset.assignedTo || '',
          assignedDepartment: mockAsset.assignedDepartment || '',
          assignedGroup: mockAsset.assignedGroup || '',
          purchaseDate: mockAsset.purchaseDate,
          warrantyExpiry: mockAsset.warrantyExpiry || '',
          lastMaintenance: mockAsset.lastMaintenance || '',
          nextMaintenance: mockAsset.nextMaintenance || '',
          serialNumber: mockAsset.serialNumber || '',
          model: mockAsset.model || '',
          manufacturer: mockAsset.manufacturer || '',
          notes: mockAsset.notes || '',
          tags: mockAsset.tags || [],
          barcode: mockAsset.barcode || '',
          qrCode: mockAsset.qrCode || ''
        });
      } catch (error) {
        console.error('Error fetching asset:', error);
        toast.error('Failed to load asset data');
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [params.id, form]);

  const onSubmit = async (data: AssetFormValues) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Updated asset data:', data);
      toast.success('Asset updated successfully!');
      router.push(`/dashboard/assets/${params.id}`);
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error('Failed to update asset');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !form.getValues('tags')?.includes(newTag.trim())) {
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Asset not found</h3>
          <p className="text-muted-foreground">The asset you're trying to edit doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/assets">Back to Assets</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/assets/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Asset</h1>
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
                        <Input placeholder="Asset name" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(AssetCategory).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.replace('_', ' ')}
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(AssetStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace('_', ' ')}
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(AssetCondition).map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition.replace('_', ' ')}
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
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
                          placeholder="Asset description and operational purpose..."
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GHS">Ghana Cedi (₵)</SelectItem>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="GBP">British Pound (£)</SelectItem>
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
                      <FormLabel>Annual Depreciation (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
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

          {/* Location & Assignment */}
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Important Dates */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Timeline & Maintenance</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Purchase Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warrantyExpiry"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Warranty Expiry</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastMaintenance"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Last Maintenance</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextMaintenance"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Next Maintenance</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel>Barcode</FormLabel>
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
                      <FormLabel>QR Code</FormLabel>
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
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="sanctuary, audio, high-value..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Add Tag
                    </Button>
                  </div>
                  {form.watch('tags') && form.watch('tags')!.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {form.watch('tags')!.map((tag) => (
                        <Badge key={tag} variant="neutral" className="cursor-pointer flex items-center gap-1" onClick={() => handleRemoveTag(tag)}>
                          {tag}
                          <X className="h-3 w-3" />
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
              onClick={() => router.push(`/dashboard/assets/${params.id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}