'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Edit,
  Wrench,
  Users,
  Calendar,
  Package,
  MapPin,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Camera,
  Download,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Asset, AssetStatus, AssetCondition, AssetCategory, AssetMaintenance, AssetAssignment } from '@/lib/types/assets';



// Mock asset data
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
  photos: [
    '/api/placeholder/400/300',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300'
  ],
  documents: [
    'Manual_YamahaCL5.pdf',
    'Warranty_Certificate.pdf',
    'Purchase_Receipt.pdf'
  ],
  notes: 'Purchased for the new sanctuary audio upgrade project. Requires monthly calibration and quarterly deep cleaning.',
  tags: ['audio', 'professional', 'sanctuary', 'digital'],
  barcode: '1234567890123',
  qrCode: 'QR123456789',
  createdBy: 'admin',
  updatedBy: 'john.smith',
  createdAt: '2023-08-15T10:00:00Z',
  updatedAt: '2024-01-15T14:30:00Z'
};

// Mock maintenance history
const mockMaintenanceHistory: AssetMaintenance[] = [
  {
    id: '1',
    assetId: '1',
    type: 'preventive' as any,
    status: 'completed' as any,
    priority: 'medium' as any,
    title: 'Quarterly Maintenance Check',
    description: 'Routine cleaning, calibration, and software updates',
    scheduledDate: '2023-12-01',
    completedDate: '2023-12-01',
    estimatedDuration: 2,
    actualDuration: 1.5,
    assignedTo: 'Mike Johnson',
    performedBy: 'Mike Johnson',
    estimatedCost: 200,
    actualCost: 150,
    currency: 'GHS',
    partsUsed: [
      {
        name: 'Cleaning Kit',
        quantity: 1,
        cost: 50,
        supplier: 'Audio Pro'
      }
    ],
    notes: 'All systems functioning properly. Updated firmware to latest version.',
    createdBy: 'admin',
    updatedBy: 'mike.johnson',
    createdAt: '2023-11-25T09:00:00Z',
    updatedAt: '2023-12-01T16:00:00Z'
  },
  {
    id: '2',
    assetId: '1',
    type: 'corrective' as any,
    status: 'completed' as any,
    priority: 'high' as any,
    title: 'Channel 5 Repair',
    description: 'Fixed intermittent audio dropout on channel 5',
    scheduledDate: '2023-09-15',
    completedDate: '2023-09-15',
    estimatedDuration: 3,
    actualDuration: 2,
    assignedTo: 'Mike Johnson',
    performedBy: 'Mike Johnson',
    estimatedCost: 300,
    actualCost: 250,
    currency: 'GHS',
    partsUsed: [
      {
        name: 'Input Module',
        quantity: 1,
        cost: 200,
        supplier: 'Yamaha Parts'
      }
    ],
    notes: 'Replaced faulty input module. Tested all channels - working perfectly.',
    createdBy: 'admin',
    updatedBy: 'mike.johnson',
    createdAt: '2023-09-10T11:00:00Z',
    updatedAt: '2023-09-15T15:30:00Z'
  }
];

// Mock assignment history
const mockAssignmentHistory: AssetAssignment[] = [
  {
    id: '1',
    assetId: '1',
    type: 'department' as any,
    status: 'active' as any,
    assignedTo: 'Media Ministry',
    assignedToType: 'department',
    assignedBy: 'admin',
    assignedDate: '2023-08-15',
    conditionAtAssignment: AssetCondition.EXCELLENT,
    assignmentNotes: 'Assigned for main sanctuary audio operations',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-08-15T10:30:00Z',
    updatedAt: '2023-08-15T10:30:00Z'
  }
];

export default function AssetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<AssetMaintenance[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch asset details
    const fetchAssetDetails = async () => {
      try {
        // In a real app, you would fetch data based on params.id
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAsset(mockAsset);
        setMaintenanceHistory(mockMaintenanceHistory);
        setAssignmentHistory(mockAssignmentHistory);
      } catch (error) {
        console.error('Error fetching asset details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.ACTIVE:
        return <Badge variant="default" className="bg-brand-success">Active</Badge>;
      case AssetStatus.MAINTENANCE:
        return <Badge variant="secondary" className="bg-brand-accent">Maintenance</Badge>;
      case AssetStatus.RETIRED:
        return <Badge variant="outline">Retired</Badge>;
      case AssetStatus.DAMAGED:
        return <Badge variant="destructive">Damaged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: AssetCondition) => {
    switch (condition) {
      case AssetCondition.EXCELLENT:
        return <Badge variant="default" className="bg-brand-success">Excellent</Badge>;
      case AssetCondition.GOOD:
        return <Badge variant="default" className="bg-brand-secondary">Good</Badge>;
      case AssetCondition.FAIR:
        return <Badge variant="secondary">Fair</Badge>;
      case AssetCondition.POOR:
        return <Badge variant="destructive">Poor</Badge>;
      case AssetCondition.DAMAGED:
        return <Badge variant="destructive">Damaged</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-brand-accent">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
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
          <p className="text-muted-foreground">The asset you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/assets">Back to Assets</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/assets')}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
            <Package className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
            <p className="text-gray-600">
              {asset.manufacturer} {asset.model} • {asset.serialNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/assets/${asset.id}/maintenance`}>
              <Wrench className="mr-2 h-4 w-4" />
              Maintenance
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/assets/${asset.id}/assignment`}>
              <Users className="mr-2 h-4 w-4" />
              Assignment
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/assets/${asset.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Camera className="mr-2 h-4 w-4" />
                Add Photos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Add Documents
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Asset Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(asset.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Condition</p>
                  <div className="mt-1">{getConditionBadge(asset.condition)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <div className="mt-1">{getPriorityBadge(asset.priority)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {asset.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{asset.description}</p>
              </div>

              {asset.tags && asset.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {asset.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm">{asset.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="maintenance" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
                  <TabsTrigger value="assignments">Assignment History</TabsTrigger>
                  <TabsTrigger value="documents">Documents & Photos</TabsTrigger>
                </TabsList>

                <TabsContent value="maintenance" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Maintenance History</h3>
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/assets/${asset.id}/maintenance`}>
                          <Wrench className="mr-2 h-4 w-4" />
                          Schedule Maintenance
                        </Link>
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {maintenanceHistory.map((maintenance) => (
                        <div key={maintenance.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{maintenance.title}</h4>
                            <Badge
                              variant={maintenance.status === 'completed' ? 'default' : 'secondary'}
                              className={maintenance.status === 'completed' ? 'bg-brand-success' : ''}
                            >
                              {maintenance.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {maintenance.description}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Type:</span> {maintenance.type}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {formatDate(maintenance.scheduledDate)}
                            </div>
                            <div>
                              <span className="font-medium">Cost:</span> {formatCurrency(maintenance.actualCost || 0)}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {maintenance.actualDuration}h
                            </div>
                          </div>
                          {maintenance.notes && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium">Notes:</span> {maintenance.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="assignments" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Assignment History</h3>
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/assets/${asset.id}/assignment`}>
                          <Users className="mr-2 h-4 w-4" />
                          Manage Assignment
                        </Link>
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {assignmentHistory.map((assignment) => (
                        <div key={assignment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">
                              Assigned to {assignment.assignedTo}
                            </h4>
                            <Badge
                              variant={assignment.status === 'active' ? 'default' : 'secondary'}
                              className={assignment.status === 'active' ? 'bg-brand-success' : ''}
                            >
                              {assignment.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Type:</span> {assignment.type}
                            </div>
                            <div>
                              <span className="font-medium">Date:</span> {formatDate(assignment.assignedDate)}
                            </div>
                            <div>
                              <span className="font-medium">Condition:</span> {assignment.conditionAtAssignment}
                            </div>
                          </div>
                          {assignment.assignmentNotes && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium">Notes:</span> {assignment.assignmentNotes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Documents & Photos</h3>

                    {/* Photos */}
                    {asset.photos && asset.photos.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Photos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {asset.photos.map((photo, index) => (
                            <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                              <img
                                src={photo}
                                alt={`Asset photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    {asset.documents && asset.documents.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Documents</h4>
                        <div className="space-y-2">
                          {asset.documents.map((document, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{document}</span>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Financial Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Price</p>
                <p className="text-lg font-semibold">{formatCurrency(asset.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                <p className="text-lg font-semibold">{formatCurrency(asset.currentValue)}</p>
              </div>
              {asset.depreciationRate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Depreciation Rate</p>
                  <p className="text-sm">{asset.depreciationRate}% annually</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Depreciation</p>
                <p className="text-sm text-red-600">
                  -{formatCurrency(asset.purchasePrice - asset.currentValue)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location & Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Location & Assignment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-sm">{asset.location}</p>
              </div>
              {asset.assignedDepartment && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-sm">{asset.assignedDepartment}</p>
                </div>
              )}
              {asset.assignedGroup && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Group</p>
                  <p className="text-sm">{asset.assignedGroup}</p>
                </div>
              )}
              {asset.assignedTo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                  <p className="text-sm">{asset.assignedTo}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Important Dates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                <p className="text-sm">{formatDate(asset.purchaseDate)}</p>
              </div>
              {asset.warrantyExpiry && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Warranty Expiry</p>
                  <p className="text-sm">{formatDate(asset.warrantyExpiry)}</p>
                  {new Date(asset.warrantyExpiry) < new Date() && (
                    <Badge variant="destructive" className="mt-1">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Expired
                    </Badge>
                  )}
                </div>
              )}
              {asset.lastMaintenance && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Maintenance</p>
                  <p className="text-sm">{formatDate(asset.lastMaintenance)}</p>
                </div>
              )}
              {asset.nextMaintenance && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Maintenance</p>
                  <p className="text-sm">{formatDate(asset.nextMaintenance)}</p>
                  {new Date(asset.nextMaintenance) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                    <Badge variant="secondary" className="mt-1 bg-brand-accent">
                      <Clock className="mr-1 h-3 w-3" />
                      Due Soon
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {asset.manufacturer && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                  <p className="text-sm">{asset.manufacturer}</p>
                </div>
              )}
              {asset.model && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Model</p>
                  <p className="text-sm">{asset.model}</p>
                </div>
              )}
              {asset.serialNumber && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                  <p className="text-sm font-mono">{asset.serialNumber}</p>
                </div>
              )}
              {asset.barcode && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Barcode</p>
                  <p className="text-sm font-mono">{asset.barcode}</p>
                </div>
              )}
              {asset.qrCode && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">QR Code</p>
                  <p className="text-sm font-mono">{asset.qrCode}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}