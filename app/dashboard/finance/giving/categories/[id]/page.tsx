'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X,
  BadgeCent,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Extended category interface
interface CategoryData {
  id: string;
  name: string;
  description: string;
  category: GivingCategory;
  totalAmount: number;
  transactionCount: number;
  isActive: boolean;
  targetAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock category data
const mockCategory: CategoryData = {
  id: '1',
  name: 'Building Fund',
  description: 'Church building construction and maintenance projects',
  category: GivingCategory.BUILDING_FUND,
  totalAmount: 45000.00,
  transactionCount: 150,
  isActive: true,
  targetAmount: 100000.00,
  notes: 'Funds allocated for the new sanctuary construction project',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-01-20T10:30:00Z'
};

// Mock transactions for this category
const mockTransactions: Giving[] = [
  {
    id: '1',
    memberId: 'member1',
    type: GivingType.DONATION,
    amount: 5000.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    method: 'Transfer',
    date: '2024-01-20',
    description: 'Building fund donation',
    isAnonymous: false,
    receiptNumber: 'RCP-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    memberId: 'member2',
    type: GivingType.PLEDGE,
    amount: 2000.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    method: 'Cash',
    date: '2024-01-19',
    description: 'Monthly building pledge',
    isAnonymous: false,
    receiptNumber: 'RCP-002',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-19T14:20:00Z',
    updatedAt: '2024-01-19T14:20:00Z'
  },
  {
    id: '3',
    memberId: 'member3',
    type: GivingType.OFFERING,
    amount: 500.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    method: 'Online',
    date: '2024-01-18',
    description: 'Special building offering',
    isAnonymous: true,
    receiptNumber: 'RCP-003',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z'
  }
];

export default function CategoryDetailsPage() {
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [transactions, setTransactions] = useState<Giving[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<CategoryData>>({});
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const categoryId = params.id as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API calls:
        // const [categoryResponse, transactionsResponse] = await Promise.all([
        //   givingService.getCategory(categoryId),
        //   givingService.getCategoryTransactions(categoryId)
        // ]);
        // setCategory(categoryResponse);
        // setTransactions(transactionsResponse.data);
        setCategory(mockCategory);
        setTransactions(mockTransactions);
        setEditData(mockCategory);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load category details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId, toast]);

  const handleSave = async () => {
    try {
      // await givingService.updateCategory(categoryId, editData);
      setCategory({ ...category!, ...editData });
      setEditing(false);
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setEditData(category!);
    setEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeIcon = (type: GivingType) => {
    switch (type) {
      case GivingType.TITHE:
        return <BadgeCent className="h-4 w-4 text-blue-500" />;
      case GivingType.OFFERING:
        return <BadgeCent className="h-4 w-4 text-green-500" />;
      case GivingType.DONATION:
        return <BadgeCent className="h-4 w-4 text-red-500" />;
      case GivingType.PLEDGE:
        return <Target className="h-4 w-4 text-purple-500" />;
      default:
        return <BadgeCent className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: GivingStatus) => {
    switch (status) {
      case GivingStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case GivingStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case GivingStatus.FAILED:
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<Giving>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const giving = row.original;
        return (
          <div className="flex items-center space-x-2">
            {getTypeIcon(giving.type)}
            <span className="font-medium capitalize">{giving.type.replace('_', ' ')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.getValue('method') as string;
        return (
          <Badge variant="outline" className="capitalize">
            {method.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as GivingStatus;
        return getStatusBadge(status);
      },
    },
  ];

  if (loading || !category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const progress = category.targetAmount ? (category.totalAmount / category.targetAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/finance/giving/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(category.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{category.transactionCount}</div>
            <p className="text-xs text-muted-foreground">
              Total count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(category.totalAmount / category.transactionCount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {category.targetAmount ? `of ${formatCurrency(category.targetAmount)}` : 'No target set'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
              <CardDescription>
                {editing ? 'Edit category details' : 'View category information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded">{category.name}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  {editing ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editData.isActive}
                        onCheckedChange={(checked) => setEditData({ ...editData, isActive: checked })}
                      />
                      <span>{editData.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  ) : (
                    <div className="p-2">
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                {editing ? (
                  <Textarea
                    id="description"
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="min-h-[100px]"
                  />
                ) : (
                  <div className="p-2 bg-muted rounded min-h-[100px]">{category.description}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Amount</Label>
                {editing ? (
                  <Input
                    id="target"
                    type="number"
                    step="0.01"
                    value={editData.targetAmount || ''}
                    onChange={(e) => setEditData({ ...editData, targetAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                ) : (
                  <div className="p-2 bg-muted rounded">
                    {category.targetAmount ? formatCurrency(category.targetAmount) : 'No target set'}
                  </div>
                )}
              </div>

              {category.notes && (
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  {editing ? (
                    <Textarea
                      id="notes"
                      value={editData.notes || ''}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded">{category.notes}</div>
                  )}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span> {new Date(category.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(category.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Transactions</CardTitle>
              <CardDescription>
                All giving transactions for this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={transactions}
                searchKey="description"
                searchPlaceholder="Search transactions..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}