'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { financeService } from '@/services';
import { Donation, Currency } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Receipt,
  User,
  DollarSign,
  Calendar,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  FileText,
  Download,
  Printer
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DonationDetailsPage() {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const donationId = params.id as string;

  // Load donation details
  useEffect(() => {
    const loadDonation = async () => {
      try {
        setLoading(true);
        const data = await financeService.getDonationById(donationId);
        if (data) {
          setDonation(data);
        } else {
          toast({
            title: 'Error',
            description: 'Donation not found',
            variant: 'destructive',
          });
          router.push('/dashboard/finance/donations');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load donation details',
          variant: 'destructive',
        });
        router.push('/dashboard/finance/donations');
      } finally {
        setLoading(false);
      }
    };

    if (donationId) {
      loadDonation();
    }
  }, [donationId, router, toast]);

  // Handle delete
  const handleDelete = async () => {
    if (!donation) return;

    try {
      await financeService.deleteDonation(donation.id);
      toast({
        title: 'Success',
        description: 'Donation deleted successfully',
      });
      router.push('/dashboard/finance/donations');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete donation',
        variant: 'destructive',
      });
    }
  };

  // Handle print receipt
  const handlePrintReceipt = () => {
    // Mock print functionality
    toast({
      title: 'Print Receipt',
      description: 'Receipt printing initiated',
    });
  };

  // Handle download receipt
  const handleDownloadReceipt = () => {
    // Mock download functionality
    toast({
      title: 'Download Receipt',
      description: 'Receipt download initiated',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/finance/donations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Donations
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/finance/donations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Donations
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Donation not found</h3>
              <p className="text-muted-foreground">The donation you're looking for doesn't exist.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-yellow-500';
      case 'Rejected':
        return 'bg-red-500';
      case 'Refunded':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/finance/donations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Donations
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Donation Details</h1>
            <p className="text-muted-foreground">Receipt #{donation.receiptNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrintReceipt}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownloadReceipt}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button asChild>
            <Link href={`/dashboard/finance/donations/${donation.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Donation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this donation? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Donor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Donor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Donor Name</label>
              <p className="text-lg font-semibold">{donation.donorName}</p>
            </div>
            
            {donation.donorEmail && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{donation.donorEmail}</span>
              </div>
            )}
            
            {donation.donorPhone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{donation.donorPhone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Donation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Amount</label>
              <p className="text-2xl font-bold text-green-600">
                <CurrencyDisplay 
                  amount={donation.amount} 
                />
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="font-medium">{donation.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Method</label>
                <p className="font-medium">{donation.method}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge className={`${getStatusColor(donation.status)} text-white`}>
                {donation.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Receipt Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Receipt Number</label>
              <p className="font-mono font-medium">{donation.receiptNumber}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {format(new Date(donation.date), 'EEEE, MMMM dd, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{donation.branch}</span>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Recorded By</label>
              <p className="font-medium">{donation.recordedBy}</p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {donation.description ? (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{donation.description}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No additional description provided.</p>
            )}
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">Created</label>
                <p>{format(new Date(donation.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Last Updated</label>
                <p>{format(new Date(donation.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 