'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Plus,
  Search,
  FileBarChart,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Copy,
  Trash2,
  Calendar,
  BarChart3,
  TrendingUp,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Mock saved reports
const savedReports = [
  {
    id: '1',
    name: 'Monthly Attendance Summary',
    description: 'Comprehensive overview of attendance across all services',
    dataSource: 'Attendance',
    visualization: 'Bar Chart',
    lastRun: '2024-01-20T14:30:00Z',
    createdAt: '2024-01-10T10:00:00Z',
    createdBy: 'Admin User',
    runCount: 45,
    favorite: true,
    fields: 8,
  },
  {
    id: '2',
    name: 'Member Demographics Report',
    description: 'Age, gender, and marital status breakdown',
    dataSource: 'Members',
    visualization: 'Pie Chart',
    lastRun: '2024-01-19T09:15:00Z',
    createdAt: '2024-01-05T14:20:00Z',
    createdBy: 'Pastor John',
    runCount: 32,
    favorite: false,
    fields: 5,
  },
  {
    id: '3',
    name: 'Giving Trends Analysis',
    description: 'Year-over-year giving patterns and trends',
    dataSource: 'Giving & Finance',
    visualization: 'Line Chart',
    lastRun: '2024-01-21T08:45:00Z',
    createdAt: '2023-12-15T11:30:00Z',
    createdBy: 'Finance Officer',
    runCount: 78,
    favorite: true,
    fields: 6,
  },
  {
    id: '4',
    name: 'Department Engagement Metrics',
    description: 'Compare engagement levels across ministries',
    dataSource: 'Groups & Departments',
    visualization: 'Table',
    lastRun: '2024-01-18T16:00:00Z',
    createdAt: '2024-01-12T09:00:00Z',
    createdBy: 'Secretary Mary',
    runCount: 23,
    favorite: false,
    fields: 7,
  },
  {
    id: '5',
    name: 'New Members Growth',
    description: 'Track new member additions and retention',
    dataSource: 'Members',
    visualization: 'Area Chart',
    lastRun: '2024-01-21T10:20:00Z',
    createdAt: '2024-01-08T15:45:00Z',
    createdBy: 'Admin User',
    runCount: 56,
    favorite: true,
    fields: 4,
  },
];

export default function SavedReportsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSourceFilter, setDataSourceFilter] = useState('all');
  const [reportToDelete, setReportToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredReports = savedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDataSource = dataSourceFilter === 'all' || report.dataSource === dataSourceFilter;
    return matchesSearch && matchesDataSource;
  });

  const handleRunReport = (reportId: string) => {
    toast.success('Generating report...');
    // TODO: Implement actual report execution
  };

  const handleDuplicateReport = (reportId: string) => {
    toast.success('Report duplicated successfully');
    // TODO: Implement actual duplication
  };

  const handleDeleteReport = (report: any) => {
    setReportToDelete(report);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // TODO: Implement actual delete
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Report "${reportToDelete.name}" deleted`);
      setIsDeleteDialogOpen(false);
      setReportToDelete(null);
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.push('/dashboard/analytics')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <FileBarChart className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Saved Reports</h1>
            <p className="text-muted-foreground">Manage and run your custom reports</p>
          </div>
        </div>

        <Button
          onClick={() => router.push('/dashboard/analytics/report-builder')}
          className="bg-brand-primary hover:bg-brand-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedReports.length}</div>
            <p className="text-xs text-muted-foreground">
              {savedReports.filter(r => r.favorite).length} favorites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {savedReports.reduce((sum, r) => sum + r.runCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...savedReports.map(r => r.runCount))}
            </div>
            <p className="text-xs text-muted-foreground">Giving Trends Analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-bold">Today</div>
            <p className="text-xs text-muted-foreground">10:20 AM</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={dataSourceFilter} onValueChange={setDataSourceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Data Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="Members">Members</SelectItem>
            <SelectItem value="Attendance">Attendance</SelectItem>
            <SelectItem value="Giving & Finance">Giving & Finance</SelectItem>
            <SelectItem value="Events">Events</SelectItem>
            <SelectItem value="Groups & Departments">Groups & Departments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base line-clamp-1">{report.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {report.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleRunReport(report.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Run Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/analytics/reports/${report.id}/edit`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateReport(report.id)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteReport(report)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{report.dataSource}</Badge>
                <Badge variant="secondary">{report.visualization}</Badge>
                {report.favorite && <Badge>⭐ Favorite</Badge>}
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Fields:</span>
                  <span className="font-medium">{report.fields}</span>
                </div>
                <div className="flex justify-between">
                  <span>Run Count:</span>
                  <span className="font-medium">{report.runCount} times</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Run:</span>
                  <span className="font-medium">{formatDate(report.lastRun)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created By:</span>
                  <span className="font-medium">{report.createdBy}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="sm"
                onClick={() => handleRunReport(report.id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Run Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileBarChart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || dataSourceFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first custom report to get started'}
            </p>
            {!searchTerm && dataSourceFilter === 'all' && (
              <Button onClick={() => router.push('/dashboard/analytics/report-builder')}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Report
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{reportToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setReportToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
