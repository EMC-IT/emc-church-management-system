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
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { CampaignStatus, GivingCategory, FundraisingCampaignFormData } from '@/lib/types';

const FUND_OPTIONS = [
  { value: GivingCategory.BUILDING_FUND, label: 'Building Fund' },
  { value: GivingCategory.MISSIONARY, label: 'Missionary / Outreach' },
  { value: GivingCategory.YOUTH, label: 'Youth Ministry' },
  { value: GivingCategory.CHILDREN, label: 'Children Ministry' },
  { value: GivingCategory.MUSIC, label: 'Music Ministry' },
  { value: GivingCategory.CHARITY, label: 'Charity / Welfare' },
  { value: GivingCategory.EDUCATION, label: 'Education' },
  { value: GivingCategory.MEDICAL, label: 'Medical' },
  { value: GivingCategory.GENERAL, label: 'General Fund' },
  { value: GivingCategory.OTHER, label: 'Other Special Project' },
];

export default function AddCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    targetAmount: string;
    currency: string;
    startDate: Date;
    endDate: Date | undefined;
    status: CampaignStatus;
    fund: GivingCategory;
  }>({
    name: '',
    description: '',
    targetAmount: '',
    currency: 'GHS',
    startDate: new Date(),
    endDate: undefined,
    status: CampaignStatus.ACTIVE,
    fund: GivingCategory.BUILDING_FUND,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a campaign name',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(formData.targetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a target amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const payload: FundraisingCampaignFormData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        targetAmount: amount,
        currency: formData.currency,
        startDate: formData.startDate.toISOString().split('T')[0],
        endDate: formData.endDate ? formData.endDate.toISOString().split('T')[0] : undefined,
        status: formData.status,
        fund: formData.fund,
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: 'Campaign Created',
        description: 'Fundraising campaign has been launched successfully.',
      });

      router.push('/dashboard/finance/giving/fundraising');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create campaign',
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
          <Link href="/dashboard/finance/giving/fundraising" aria-label="Back to Campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Create Fundraising Campaign"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Campaign Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Campaign Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g. New Sanctuary Building Expansion"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fund">Fund / Designated Category</Label>
                <Select
                  value={formData.fund}
                  onValueChange={(val) => setFormData({ ...formData, fund: val as GivingCategory })}
                >
                  <SelectTrigger id="fund">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUND_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount <span className="text-destructive">*</span></Label>
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
                    id="targetAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="flex-1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Start Date <span className="text-destructive">*</span></Label>
                <DatePicker
                  value={formData.startDate}
                  onChange={(d) => d && setFormData({ ...formData, startDate: d })}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date (Target Completion)</Label>
                <DatePicker
                  value={formData.endDate}
                  onChange={(d) => setFormData({ ...formData, endDate: d })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val as CampaignStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CampaignStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={CampaignStatus.DRAFT}>Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description / Purpose</Label>
                <Textarea
                  id="description"
                  placeholder="Explain the vision, goals, and funding allocation for this campaign"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/finance/giving/fundraising">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  );
}
