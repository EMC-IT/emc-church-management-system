'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { membersService } from '@/services';
import { Member } from '@/lib/types';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  Play,
  Pause,
  SkipForward,
  Users,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';

interface ImportRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  membershipStatus: string;
  joinDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  status: 'valid' | 'invalid' | 'pending';
  errors: string[];
}

export default function ImportMembersPage() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [validRows, setValidRows] = useState<ImportRow[]>([]);
  const [invalidRows, setInvalidRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'upload' | 'validate' | 'import'>('upload');
  const router = useRouter();
  const { toast } = useToast();

  // Mock validation function
  const validateRow = (row: any): ImportRow => {
    const errors: string[] = [];
    
    if (!row.firstName || row.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    if (!row.lastName || row.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push('Valid email address is required');
    }
    if (!row.phone || row.phone.length < 10) {
      errors.push('Phone number must be at least 10 digits');
    }
    if (!row.address || row.address.length < 10) {
      errors.push('Address must be at least 10 characters');
    }
    if (!row.dateOfBirth) {
      errors.push('Date of birth is required');
    }
    if (!row.gender || !['Male', 'Female'].includes(row.gender)) {
      errors.push('Gender must be Male or Female');
    }
    if (!row.membershipStatus || !['Active', 'New', 'Inactive'].includes(row.membershipStatus)) {
      errors.push('Membership status must be Active, New, or Inactive');
    }
    if (!row.joinDate) {
      errors.push('Join date is required');
    }
    if (!row.emergencyContactName || row.emergencyContactName.length < 2) {
      errors.push('Emergency contact name must be at least 2 characters');
    }
    if (!row.emergencyContactPhone || row.emergencyContactPhone.length < 10) {
      errors.push('Emergency contact phone must be at least 10 digits');
    }
    if (!row.emergencyContactRelationship || row.emergencyContactRelationship.length < 2) {
      errors.push('Emergency contact relationship must be at least 2 characters');
    }

    return {
      ...row,
      id: Math.random().toString(36).substr(2, 9),
      status: errors.length > 0 ? 'invalid' : 'valid',
      errors
    };
  };

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setImportFile(file);
      
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock CSV data
      const mockData = [
        {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@email.com',
          phone: '+233 24 123 4567',
          address: '123 Main Street, Accra, Ghana',
          dateOfBirth: '1988-05-15',
          gender: 'Male',
          membershipStatus: 'Active',
          joinDate: '2024-01-15',
          emergencyContactName: 'Jane Smith',
          emergencyContactPhone: '+233 24 123 4568',
          emergencyContactRelationship: 'Spouse'
        },
        {
          firstName: 'Mary',
          lastName: 'Johnson',
          email: 'mary.johnson@email.com',
          phone: '+233 24 234 5678',
          address: '456 Oak Avenue, Kumasi, Ghana',
          dateOfBirth: '1995-03-22',
          gender: 'Female',
          membershipStatus: 'New',
          joinDate: '2024-01-20',
          emergencyContactName: 'Robert Johnson',
          emergencyContactPhone: '+233 24 234 5679',
          emergencyContactRelationship: 'Father'
        },
        {
          firstName: 'David',
          lastName: 'Brown',
          email: 'david.brown@email.com',
          phone: '+233 24 345 6789',
          address: '789 Pine Street, Tamale, Ghana',
          dateOfBirth: '1981-07-10',
          gender: 'Male',
          membershipStatus: 'Active',
          joinDate: '2024-01-25',
          emergencyContactName: 'Sarah Brown',
          emergencyContactPhone: '+233 24 345 6790',
          emergencyContactRelationship: 'Sister'
        }
      ];

      const validatedData = mockData.map(validateRow);
      setImportData(validatedData);
      setValidRows(validatedData.filter(row => row.status === 'valid'));
      setInvalidRows(validatedData.filter(row => row.status === 'invalid'));
      setCurrentStep('validate');
      
      toast({
        title: 'File uploaded successfully',
        description: `Found ${validatedData.length} rows to import`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartImport = async () => {
    try {
      setImporting(true);
      setCurrentStep('import');
      
      const validData = importData.filter(row => row.status === 'valid');
      
      for (let i = 0; i < validData.length; i++) {
        const row = validData[i];
        setProgress(((i + 1) / validData.length) * 100);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock member creation
        const member: Member = {
          id: Math.random().toString(36).substr(2, 9),
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          address: row.address,
          dateOfBirth: row.dateOfBirth,
          gender: row.gender as 'Male' | 'Female',
          membershipStatus: row.membershipStatus as any,
          joinDate: row.joinDate,
          avatar: null,
          familyId: `fam_${Math.random().toString(36).substr(2, 9)}`,
          emergencyContact: {
            name: row.emergencyContactName,
            phone: row.emergencyContactPhone,
            relationship: row.emergencyContactRelationship
          },
          customFields: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Update import data with success status
        setImportData(prev => prev.map(item => 
          item.id === row.id ? { ...item, status: 'valid' as const } : item
        ));
      }
      
      toast({
        title: 'Import completed',
        description: `Successfully imported ${validData.length} members`,
      });
      
      // Redirect to members list after a delay
      setTimeout(() => {
        router.push('/dashboard/members');
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to import members',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create and download CSV template for both members and converts
    // Columns: fullName, contact1, gender, dateOfBirth, branch, serviceType, status, location (all required for both)
    // Member-only: title, contact2, email, ageGroup, lifeDevelopment, departments, groups, waterBaptism, holyGhostBaptism, leadershipRole, specialGuestInvitedBy, specialGuestInvitedByCustom
    // Note: departments and groups should be comma-separated lists in the CSV
    // The first row is a convert, the second is a full member
    const template = `# For converts, fill only the required fields. For full members, fill all fields.\n# Columns marked (member only) are ignored for converts.\nfullName,contact1,gender,dateOfBirth,branch,serviceType,status,location,title (member only),contact2 (member only),email (member only),ageGroup (member only),lifeDevelopment (member only),departments (member only),groups (member only),waterBaptism (member only),holyGhostBaptism (member only),leadershipRole (member only),specialGuestInvitedBy (member only),specialGuestInvitedByCustom (member only)\n"Kwame Mensah,+233241234567,Male,1990-01-01,Adenta (HQ),Empowerment,Attender,Accra,,,,,,,,,,,,\n"Abena Owusu,+233201234567,Female,1985-05-10,Somanya,Jesus Generation,Member,Koforidua,Ms.,+233501234567,abena.owusu@email.com,Adult,Maturity,"d1,d3","g2,g4",Yes,No,Music Director,m1,\n`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Add a wrapper to adapt FileUpload's onUpload signature
  const handleFilesUpload = (files: File[]) => {
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Table columns for import preview
  const columns: ColumnDef<ImportRow>[] = [
    {
      accessorKey: 'name',
      header: 'Member',
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div>
            <div className="font-medium">{data.firstName} {data.lastName}</div>
            <div className="text-sm text-muted-foreground">{data.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="text-sm">
            <div>{data.phone}</div>
            <div className="text-muted-foreground">{data.address}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'membershipStatus',
      header: 'Status',
      cell: ({ row }) => {
        const data = row.original;
        return <Badge variant="outline">{data.membershipStatus}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Validation',
      cell: ({ row }) => {
        const data = row.original;
        if (data.status === 'valid') {
          return <Badge variant="default" className="bg-green-500">Valid</Badge>;
        } else if (data.status === 'invalid') {
          return <Badge variant="destructive">Invalid</Badge>;
        } else {
          return <Badge variant="secondary">Pending</Badge>;
        }
      },
    },
    {
      accessorKey: 'errors',
      header: 'Errors',
      cell: ({ row }) => {
        const data = row.original;
        if (data.errors.length > 0) {
          return (
            <div className="text-sm text-destructive">
              {data.errors.slice(0, 2).join(', ')}
              {data.errors.length > 2 && ` +${data.errors.length - 2} more`}
            </div>
          );
        }
        return <span className="text-sm text-muted-foreground">No errors</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/members">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Members
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Import Members</h1>
            <p className="text-muted-foreground">Bulk import members from CSV file</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Import Steps */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className={currentStep === 'upload' ? 'ring-2 ring-primary' : ''}>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              Step 1: Upload File
              <Upload className="ml-2 h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStep === 'upload' ? '1' : '✓'}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload your CSV file with member data
            </p>
          </CardContent>
        </Card>
        
        <Card className={currentStep === 'validate' ? 'ring-2 ring-primary' : ''}>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              Step 2: Validate Data
              <FileText className="ml-2 h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStep === 'validate' ? '2' : currentStep === 'import' ? '✓' : '2'}
            </div>
            <p className="text-xs text-muted-foreground">
              Review and validate imported data
            </p>
          </CardContent>
        </Card>
        
        <Card className={currentStep === 'import' ? 'ring-2 ring-primary' : ''}>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              Step 3: Import Members
              <Users className="ml-2 h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStep === 'import' ? '3' : '3'}
            </div>
            <p className="text-xs text-muted-foreground">
              Import validated members to database
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Member Data</CardTitle>
            <CardDescription>
              Upload a CSV file containing member information. Make sure your file follows the template format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              onUpload={handleFilesUpload}
              accept=".csv"
              maxSize={10 * 1024 * 1024} // 10MB
              loading={loading}
            />
            {/* Upload UI below FileUpload, not as children */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your CSV file here, or click to browse
              </p>
              <Button disabled={loading} onClick={() => {}}>
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </>
                )}
              </Button>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure your CSV file includes all required fields: <b>fullName, contact1, gender, dateOfBirth, branch, serviceType, status, location</b> <br/>
                <span className="text-xs">(For full members, also include: <b>title, ageGroup, lifeDevelopment, waterBaptism, holyGhostBaptism</b>)</span>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Validation Section */}
      {currentStep === 'validate' && importData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Validate Import Data</CardTitle>
            <CardDescription>
              Review the data before importing. {validRows.length} valid rows, {invalidRows.length} invalid rows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invalidRows.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {invalidRows.length} rows have validation errors. Please fix them before importing.
                  </AlertDescription>
                </Alert>
              )}
              
              {validRows.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validRows.length} rows are ready for import.
                  </AlertDescription>
                </Alert>
              )}
              
              <DataTable
                columns={columns}
                data={importData}
                loading={false}
                searchKey="name"
                showSearch={true}
                showFilters={false}
                pagination={{
                  pageSize: 10,
                  pageSizeOptions: [10, 20, 50],
                }}
                className="bg-card"
              />
              
              <div className="flex items-center justify-end space-x-4">
                <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                  Back to Upload
                </Button>
                <Button 
                  onClick={handleStartImport}
                  disabled={validRows.length === 0}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Import ({validRows.length} members)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {currentStep === 'import' && (
        <Card>
          <CardHeader>
            <CardTitle>Importing Members</CardTitle>
            <CardDescription>
              Please wait while we import your members. Do not close this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Importing members... {Math.round(progress)}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 