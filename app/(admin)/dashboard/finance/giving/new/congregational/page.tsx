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
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Plus, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { GivingType, GivingCategory, GivingSource, IdentifiedContribution } from '@/lib/types';

// Mock members for identified contribution lookup
const mockMembers = [
  { id: 'm1', name: 'Kofi Mensah' },
  { id: 'm2', name: 'Abena Owusu' },
  { id: 'm3', name: 'Kweku Asante' },
  { id: 'm4', name: 'Ama Boateng' },
];

const GIVING_TYPE_OPTIONS = [
  { value: GivingType.OFFERING, label: 'Offering' },
  { value: GivingType.TITHE, label: 'Tithe' },
  { value: GivingType.THANKSGIVING, label: 'Thanksgiving' },
  { value: GivingType.FIRST_FRUITS, label: 'First Fruits' },
  { value: GivingType.SPECIAL, label: 'Special' },
  { value: GivingType.FUNDRAISING, label: 'Fundraising' },
  { value: GivingType.WELFARE, label: 'Welfare' },
  { value: GivingType.OTHER, label: 'Other' },
];

const GIVING_CATEGORY_OPTIONS = [
  { value: GivingCategory.GENERAL, label: 'General' },
  { value: GivingCategory.BUILDING_FUND, label: 'Building Fund' },
  { value: GivingCategory.MISSIONARY, label: 'Missionary' },
  { value: GivingCategory.YOUTH, label: 'Youth' },
  { value: GivingCategory.CHILDREN, label: 'Children' },
  { value: GivingCategory.MUSIC, label: 'Music' },
  { value: GivingCategory.OUTREACH, label: 'Outreach' },
  { value: GivingCategory.WELFARE, label: 'Welfare' },
  { value: GivingCategory.OTHER, label: 'Other' },
];

interface ContributionRow {
  id: string;
  memberId: string;
  memberName: string;
  amount: string;
  isAnonymous: boolean;
}

export default function CongregatinalGivingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [form, setForm] = useState({
    type: GivingType.OFFERING,
    serviceEvent: '',
    totalAmount: '',
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash' as string,
    date: new Date(),
    description: '',
  });

  const [contributions, setContributions] = useState<ContributionRow[]>([]);

  const identifiedTotal = contributions.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const totalAmount = parseFloat(form.totalAmount) || 0;
  const unidentifiedAmount = Math.max(0, totalAmount - identifiedTotal);

  const addContribution = () => {
    setContributions([
      ...contributions,
      { id: crypto.randomUUID(), memberId: '', memberName: '', amount: '', isAnonymous: false },
    ]);
  };

  const updateContribution = (id: string, field: keyof ContributionRow, value: any) => {
    setContributions(contributions.map(c => {
      if (c.id !== id) return c;
      if (field === 'memberId') {
        const member = mockMembers.find(m => m.id === value);
        return { ...c, memberId: value, memberName: member?.name ?? '' };
      }
      return { ...c, [field]: value };
    }));
  };

  const removeContribution = (id: string) => {
    setContributions(contributions.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.serviceEvent.trim()) {
      toast({ title: 'Validation Error', description: 'Service / Event name is required', variant: 'destructive' });
      return;
    }
    if (!totalAmount || totalAmount <= 0) {
      toast({ title: 'Validation Error', description: 'Total amount must be greater than 0', variant: 'destructive' });
      return;
    }
    if (showBreakdown && identifiedTotal > totalAmount) {
      toast({
        title: 'Validation Error',
        description: 'Identified contributions cannot exceed the total amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      toast({ title: 'Success', description: 'Congregational giving recorded successfully' });
      router.push('/dashboard/finance/giving/donations');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to record giving', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href="/dashboard/finance/giving" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title="Congregational Giving" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Giving Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Giving Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serviceEvent">Service / Event <span className="text-destructive">*</span></Label>
              <Input
                id="serviceEvent"
                placeholder="e.g. Sunday Morning Service"
                value={form.serviceEvent}
                onChange={(e) => setForm({ ...form, serviceEvent: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Giving Type <span className="text-destructive">*</span></Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as GivingType })}>
                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GIVING_TYPE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">GHS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Fund / Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as GivingCategory })}>
                <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GIVING_CATEGORY_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                <SelectTrigger id="method"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Online">Online / Mobile Money</SelectItem>
                  <SelectItem value="Check">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date <span className="text-destructive">*</span></Label>
              <DatePicker
                value={form.date}
                onChange={(d) => d && setForm({ ...form, date: d })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description / Purpose</Label>
              <Textarea
                id="description"
                placeholder="Optional notes about this collection"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Identified Contributions — optional breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Identified Contributions</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Optional. Break down who contributed what within this total. These records are for attribution only and will not be independently summed in any financial totals.
                </p>
              </div>
              <Switch
                checked={showBreakdown}
                onCheckedChange={setShowBreakdown}
                aria-label="Enable identified contributions"
              />
            </div>
          </CardHeader>

          {showBreakdown && (
            <CardContent className="space-y-4">
              {/* Running total summary */}
              {totalAmount > 0 && (
                <div className="flex items-center gap-6 rounded-md border bg-muted/40 px-4 py-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-medium">{form.currency} {totalAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Identified: </span>
                    <span className={`font-medium ${identifiedTotal > totalAmount ? 'text-destructive' : ''}`}>
                      {form.currency} {identifiedTotal.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Unidentified: </span>
                    <span className="font-medium">{form.currency} {unidentifiedAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Contribution rows */}
              {contributions.length > 0 && (
                <div className="space-y-3">
                  {contributions.map((contrib) => (
                    <div key={contrib.id} className="flex items-end gap-3">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Member</Label>
                        {contrib.isAnonymous ? (
                          <Input value="Anonymous" disabled className="bg-muted/40" />
                        ) : (
                          <Select
                            value={contrib.memberId}
                            onValueChange={(v) => updateContribution(contrib.id, 'memberId', v)}
                          >
                            <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                            <SelectContent>
                              {mockMembers.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="w-32 space-y-1">
                        <Label className="text-xs text-muted-foreground">Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={contrib.amount}
                          onChange={(e) => updateContribution(contrib.id, 'amount', e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2 pb-2">
                        <Switch
                          checked={contrib.isAnonymous}
                          onCheckedChange={(v) => updateContribution(contrib.id, 'isAnonymous', v)}
                          aria-label="Anonymous"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Anonymous</span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => removeContribution(contrib.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button type="button" variant="outline" size="sm" onClick={addContribution}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Contribution
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/finance/giving">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-1.5 h-4 w-4" />
            {isSubmitting ? 'Saving…' : 'Record Giving'}
          </Button>
        </div>
      </form>
    </div>
  );
}
