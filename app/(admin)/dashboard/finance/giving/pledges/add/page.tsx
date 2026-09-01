'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  ArrowLeft, 
  Save, 
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { PledgeFormData } from '@/lib/types';

// Mock members data for selection
const mockMembers = [
  { id: 'member1', name: 'John Doe', email: 'john@example.com' },
  { id: 'member2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: 'member3', name: 'Michael Johnson', email: 'michael@example.com' },
  { id: 'member4', name: 'Sarah Wilson', email: 'sarah@example.com' },
];

// Mock campaigns
const mockCampaigns = [
  { id: 'c1', name: 'New Sanctuary Building' },
  { id: 'c2', name: 'Missions Outreach 2024' },
  { id: 'c3', name: 'Youth Center Renovation' },
];

export default function AddPledgePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    memberId: string;
    campaignId: string;
    pledgedAmount: string;
    currency: string;
    pledgeDate: Date;
    completionDate: Date | undefined;
    notes: string;
  }>({
    memberId: '',
    campaignId: '',
    pledgedAmount: '',
    currency: 'GHS',
    pledgeDate: new Date(),
    completionDate: undefined,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.memberId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a member for the pledge',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(formData.pledgedAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid pledged amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const payload: PledgeFormData = {
        memberId: formData.memberId,
        campaignId: formData.campaignId || undefined,
        pledgedAmount: amount,
        currency: formData.currency,
        pledgeDate: formData.pledgeDate.toISOString().split('T')[0],
        completionDate: formData.completionDate ? formData.completionDate.toISOString().split('T')[0] : undefined,
        notes: formData.notes.trim() || undefined,
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: 'Pledge Created',
        description: 'The pledge commitment has been recorded successfully.',
      });

      router.push('/dashboard/finance/giving/pledges');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create pledge',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href="/dashboard/finance/giving/pledges" aria-label="Back to Pledges">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Create Pledge"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Pledge Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="memberId">Member <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.memberId}
                  onValueChange={(val) => setFormData({ ...formData, memberId: val })}
                >
                  <SelectTrigger id="memberId">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaignId">Campaign (Optional)</Label>
                <Select
                  value={formData.campaignId}
                  onValueChange={(val) => setFormData({ ...formData, campaignId: val })}
                >
                  <SelectTrigger id="campaignId">
                    <SelectValue placeholder="Select campaign (or general)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / General</SelectItem>
                    {mockCampaigns.map((camp) => (
                      <SelectItem key={camp.id} value={camp.id}>
                        {camp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pledgedAmount">Pledged Amount <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.currency}
                    onValueChange={(val) => setFormData({ ...formData, currency: val })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">GHS</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="pledgedAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.pledgedAmount}
                    onChange={(e) => setFormData({ ...formData, pledgedAmount: e.target.value })}
                    className="flex-1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pledge Date <span className="text-destructive">*</span></Label>
                <DatePicker
                  value={formData.pledgeDate}
                  onChange={(d) => d && setFormData({ ...formData, pledgeDate: d })}
                />
              </div>

              <div className="space-y-2">
                <Label>Expected Completion Date (Optional)</Label>
                <DatePicker
                  value={formData.completionDate}
                  onChange={(d) => setFormData({ ...formData, completionDate: d })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes / Commitment Purpose</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional details regarding the pledge agreement or schedule"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/finance/giving/pledges">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Pledge'}
          </Button>
        </div>
      </form>
    </div>
  );
}
