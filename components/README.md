# Components Documentation

This directory contains all the reusable UI components for the church management system. Components are organized by functionality and follow consistent design patterns.

## 📁 Component Structure

```
components/
├── ui/                    # Base UI components
│   ├── data-table.tsx    # Sortable, filterable table
│   ├── form-input.tsx    # Reusable form inputs
│   ├── search-input.tsx  # Search with filters
│   ├── file-upload.tsx   # File upload component
│   ├── status-badge.tsx  # Status indicators
│   └── [other shadcn/ui components]
├── forms/                 # Form components
│   ├── member-form.tsx   # Add/Edit member form
│   ├── donation-form.tsx # Donation entry form
│   ├── event-form.tsx    # Event creation form
│   └── prayer-form.tsx   # Prayer request form
├── charts/               # Chart components
│   ├── attendance-chart.tsx
│   ├── giving-chart.tsx
│   └── analytics-chart.tsx
└── layout/               # Layout components
    ├── dashboard-layout.tsx
    ├── header.tsx
    └── sidebar.tsx
```

## 🎨 UI Components

### DataTable (`ui/data-table.tsx`)

A comprehensive data table component with sorting, filtering, pagination, and search functionality.

**Features:**
- Sortable columns
- Global and column-specific search
- Pagination with customizable page sizes
- Column visibility toggle
- Export functionality
- Loading and error states
- Row selection
- Responsive design

**Usage:**
```typescript
import { DataTable } from '@/components/ui/data-table';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  // ... more data
];

<DataTable
  columns={columns}
  data={data}
  loading={false}
  showSearch={true}
  showFilters={true}
  showExport={true}
  pagination={{
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  }}
  onExport={() => handleExport()}
/>
```

### FormInput (`ui/form-input.tsx`)

A versatile form input component that supports multiple input types with validation.

**Supported Types:**
- `text` - Text input
- `email` - Email input
- `password` - Password with show/hide toggle
- `number` - Number input
- `date` - Date picker
- `select` - Dropdown select
- `textarea` - Multi-line text
- `checkbox` - Checkbox
- `radio` - Radio buttons
- `file` - File upload
- `phone` - Phone number
- `currency` - Currency input with symbol

**Usage:**
```typescript
import { FormInput, FormSection } from '@/components/ui/form-input';

<FormSection title="Personal Information" description="Basic member details">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormInput
      name="firstName"
      label="First Name"
      type="text"
      placeholder="Enter first name"
      required
      value={firstName}
      onChange={setFirstName}
      error={errors.firstName}
    />
    
    <FormInput
      name="gender"
      label="Gender"
      type="select"
      options={[
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ]}
      value={gender}
      onChange={setGender}
    />
    
    <FormInput
      name="dateOfBirth"
      label="Date of Birth"
      type="date"
      value={dateOfBirth}
      onChange={setDateOfBirth}
    />
  </div>
</FormSection>
```

### SearchInput (`ui/search-input.tsx`)

Advanced search component with filters and real-time search capabilities.

**Features:**
- Real-time search
- Multiple filter types (text, select, date, checkbox)
- Advanced search options
- Filter badges
- Loading states

**Usage:**
```typescript
import { SearchInput } from '@/components/ui/search-input';

const filters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  {
    key: 'date',
    label: 'Date',
    type: 'date',
  },
];

<SearchInput
  placeholder="Search members..."
  onSearch={(query, filters) => handleSearch(query, filters)}
  filters={filters}
  showFilters={true}
  showAdvanced={true}
/>
```

### FileUpload (`ui/file-upload.tsx`)

Comprehensive file upload component with drag-and-drop, validation, and progress tracking.

**Features:**
- Drag and drop support
- File validation (size, type)
- Progress tracking
- Multiple file uploads
- Image preview
- Error handling
- Customizable accept types

**Usage:**
```typescript
import { FileUpload, ImageUpload, DocumentUpload } from '@/components/ui/file-upload';

// General file upload
<FileUpload
  onUpload={handleFileUpload}
  accept="image/*,application/pdf"
  maxSize={5 * 1024 * 1024} // 5MB
  multiple={true}
  variant="drag-drop"
  showProgress={true}
/>

// Image-specific upload
<ImageUpload
  onUpload={handleImageUpload}
  maxWidth={1920}
  maxHeight={1080}
  showPreview={true}
/>

// Document upload
<DocumentUpload
  onUpload={handleDocumentUpload}
  allowedTypes={['application/pdf', 'application/msword']}
/>
```

### StatusBadge (`ui/status-badge.tsx`)

Comprehensive status badge component with predefined status types and icons.

**Supported Status Types:**
- **General**: active, inactive, pending, completed, cancelled, draft, published, archived
- **Process**: processing, success, error, warning, info
- **Member**: new, active, inactive, transferred, deceased
- **Financial**: paid, unpaid, overdue, refunded, pending
- **Event**: upcoming, ongoing, completed, cancelled
- **Attendance**: present, absent, late, excused
- **Communication**: sent, delivered, failed, pending
- **Priority**: low, medium, high, urgent

**Usage:**
```typescript
import { 
  StatusBadge, 
  MemberStatusBadge, 
  PaymentStatusBadge,
  PriorityBadge 
} from '@/components/ui/status-badge';

// General status badge
<StatusBadge status="active" size="md" showIcon={true} />

// Specialized badges
<MemberStatusBadge status="active" />
<PaymentStatusBadge status="paid" />
<PriorityBadge priority="high" />

// Status badge group
<StatusBadgeGroup
  statuses={[
    { status: 'active', count: 150 },
    { status: 'inactive', count: 25 },
    { status: 'new', count: 10 },
  ]}
  size="md"
/>
```

## 📝 Form Components

### MemberForm (`forms/member-form.tsx`)

Comprehensive member form with all necessary fields for adding and editing members.

**Features:**
- Photo upload with preview
- Form validation with Zod
- Emergency contact information
- Family associations
- Custom fields support
- Responsive layout
- Loading states

**Usage:**
```typescript
import { MemberForm, QuickMemberForm } from '@/components/forms/member-form';

// Full member form
<MemberForm
  member={existingMember}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  loading={isLoading}
/>

// Quick member form for basic info
<QuickMemberForm
  onSubmit={handleQuickSubmit}
  onCancel={handleCancel}
  loading={isLoading}
/>
```

## 📊 Chart Components

### Chart Components (Coming Soon)

Chart components will be created for:
- Attendance trends
- Giving analytics
- Member demographics
- Event statistics
- Financial reports

## 🎯 Best Practices

### 1. Component Usage

```typescript
// ✅ Good: Use proper TypeScript types
interface MyComponentProps {
  data: MyDataType[];
  loading?: boolean;
  onAction?: (id: string) => void;
}

// ✅ Good: Use consistent naming
export function MyComponent({ data, loading, onAction }: MyComponentProps) {
  // Component logic
}
```

### 2. Form Handling

```typescript
// ✅ Good: Use React Hook Form with Zod validation
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
    // Initial values
  },
});

// ✅ Good: Handle loading and error states
const handleSubmit = async (data: FormData) => {
  try {
    setLoading(true);
    await submitData(data);
    toast({ title: 'Success', description: 'Data saved successfully' });
  } catch (error) {
    toast({ 
      title: 'Error', 
      description: error.message, 
      variant: 'destructive' 
    });
  } finally {
    setLoading(false);
  }
};
```

### 3. Responsive Design

```typescript
// ✅ Good: Use responsive grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Form fields */}
</div>

// ✅ Good: Use responsive spacing
<div className="space-y-4 md:space-y-6">
  {/* Content */}
</div>
```

### 4. Accessibility

```typescript
// ✅ Good: Include proper ARIA labels
<Button aria-label="Save member data">
  <Save className="mr-2 h-4 w-4" />
  Save
</Button>

// ✅ Good: Use semantic HTML
<main role="main">
  <section aria-labelledby="form-title">
    <h2 id="form-title">Member Information</h2>
    {/* Form content */}
  </section>
</main>
```

## 🔧 Configuration

### Environment Variables

```env
# File upload configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/*,application/pdf

# API configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Theme Configuration

Components use the brand color scheme defined in `tailwind.config.ts`:

```typescript
// Brand colors
'--brand-primary': '46 141 176',    // Deep Blue
'--brand-secondary': '40 172 209',   // Light Blue
'--brand-accent': '196 152 49',      // Gold
'--brand-success': '165 207 93',     // Green
```

## 📚 Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

When adding new components:

1. **Follow Naming Conventions**: Use PascalCase for components, camelCase for props
2. **Include TypeScript Types**: Define proper interfaces for all props
3. **Add Validation**: Use Zod schemas for form validation
4. **Include Accessibility**: Add proper ARIA labels and semantic HTML
5. **Test Responsiveness**: Ensure components work on all screen sizes
6. **Add Documentation**: Include usage examples and prop descriptions
7. **Follow Design System**: Use consistent spacing, colors, and typography

## 📞 Support

For questions about components, refer to:
- Component documentation in this README
- Type definitions in `lib/types.ts`
- Example usage in dashboard pages
- shadcn/ui component library 