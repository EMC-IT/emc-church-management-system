'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { incomeService } from '@/services';

const categorySuggestions = [
  { name: 'Hall Rental', code: 'HALL_RENTAL', description: 'Facility and auditorium rental revenue' },
  { name: 'Property Rental', code: 'PROPERTY_RENTAL', description: 'Church ground, room, or parking lease income' },
  { name: 'Book Sales', code: 'BOOK_SALES', description: 'Bookstore, literature, and hymnal sales' },
  { name: 'Merchandise Sales', code: 'MERCH_SALES', description: 'Apparel, media, and promotional material revenue' },
  { name: 'Grants', code: 'GRANTS', description: 'Institutional, civic, and foundation grant disbursements' },
  { name: 'Sponsorships', code: 'SPONSORSHIPS', description: 'Corporate and partner initiative sponsorships' },
  { name: 'Interest & Investment', code: 'INTEREST_INCOME', description: 'Bank yields and endowment investments' },
  { name: 'Other Income', code: 'OTHER_INCOME', description: 'Miscellaneous revenue' },
];

export default function AddIncomeCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  const selectSuggestion = (s: { name: string; code: string; description: string }) => {
    setForm({
      name: s.name,
      code: s.code,
      description: s.description,
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category Name is required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await incomeService.createCategory({
        name: form.name.trim(),
        code: form.code?.trim() || undefined,
        description: form.description?.trim() || undefined,
        isActive: form.isActive,
      });

      toast({
        title: 'Category Created',
        description: `Income category "${form.name}" has been created.`,
      });

      router.push('/dashboard/finance/income/categories');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create category.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href="/dashboard/finance/income/categories" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader title="New Income Category" />
        </div>
      </div>

      {/* Suggestions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Suggested Category Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categorySuggestions.map((s) => (
              <Button
                key={s.code}
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => selectSuggestion(s)}
              >
                + {s.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Facility Rental"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Category Code (Optional)</Label>
              <Input
                id="code"
                placeholder="e.g. FACILITY_RENTAL"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Explain what revenues are tracked under this category..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3.5 md:col-span-2">
              <div className="space-y-0.5">
                <Label htmlFor="active-status" className="text-sm font-medium cursor-pointer">
                  Active Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  Active categories are selectable when recording new income transactions.
                </p>
              </div>
              <Switch
                id="active-status"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                aria-label="Active Status"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/finance/income/categories">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  );
}
