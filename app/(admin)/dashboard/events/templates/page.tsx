'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EventCategoryBadge } from '@/components/ui/category-badges';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Clock,
  MapPin,
  Users,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  location: string;
  maxAttendees: number;
  defaultTime: string;
  createdAt: string;
  usageCount: number;
}

const mockTemplates: EventTemplate[] = [
  {
    id: '1',
    name: 'Sunday Service',
    description: 'Weekly Sunday worship service with sermon and communion',
    category: 'Worship',
    duration: '90 minutes',
    location: 'Main Sanctuary',
    maxAttendees: 500,
    defaultTime: '10:00 AM',
    createdAt: '2024-01-01',
    usageCount: 52
  },
  {
    id: '2',
    name: 'Bible Study',
    description: 'Weekly Bible study and discussion group',
    category: 'Study',
    duration: '60 minutes',
    location: 'Fellowship Hall',
    maxAttendees: 100,
    defaultTime: '7:00 PM',
    createdAt: '2024-01-01',
    usageCount: 48
  },
  {
    id: '3',
    name: 'Youth Conference',
    description: 'Annual youth conference with guest speakers and activities',
    category: 'Conference',
    duration: '8 hours',
    location: 'Youth Center',
    maxAttendees: 200,
    defaultTime: '9:00 AM',
    createdAt: '2024-01-01',
    usageCount: 1
  },
  {
    id: '4',
    name: 'Community Outreach',
    description: 'Food distribution and community service event',
    category: 'Outreach',
    duration: '4 hours',
    location: 'Community Center',
    maxAttendees: 50,
    defaultTime: '2:00 PM',
    createdAt: '2024-01-01',
    usageCount: 12
  }
];

const categories = ['All', 'Worship', 'Study', 'Conference', 'Outreach', 'Social', 'Training'];

export default function EventTemplatesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<EventTemplate | null>(null);
  const [templates, setTemplates] = useState<EventTemplate[]>(mockTemplates);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'Worship',
    duration: '',
    location: '',
    maxAttendees: 100,
    defaultTime: ''
  });
  const [editTemplate, setEditTemplate] = useState({
    name: '',
    description: '',
    category: 'Worship',
    duration: '',
    location: '',
    maxAttendees: 100,
    defaultTime: ''
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = () => {
    const newTemplateWithId: EventTemplate = {
      ...newTemplate,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    setTemplates([...templates, newTemplateWithId]);
    setShowCreateDialog(false);
    setNewTemplate({
      name: '',
      description: '',
      category: 'Worship',
      duration: '',
      location: '',
      maxAttendees: 100,
      defaultTime: ''
    });
    toast.success('Template created successfully');
  };

  const handleEditTemplate = (template: EventTemplate) => {
    setEditingTemplate(template);
    setEditTemplate({
      name: template.name,
      description: template.description,
      category: template.category,
      duration: template.duration,
      location: template.location,
      maxAttendees: template.maxAttendees,
      defaultTime: template.defaultTime
    });
    setShowEditDialog(true);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;
    const updatedTemplates = templates.map(template => 
      template.id === editingTemplate.id 
        ? { ...template, ...editTemplate }
        : template
    );
    setTemplates(updatedTemplates);
    setShowEditDialog(false);
    setEditingTemplate(null);
    toast.success('Template updated successfully');
  };

  const handleDeleteTemplate = (template: EventTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!templateToDelete) return;
    setTemplates(templates.filter(t => t.id !== templateToDelete.id));
    setShowDeleteDialog(false);
    setTemplateToDelete(null);
    toast.success('Template deleted successfully');
  };

  const handleUseTemplate = (template: EventTemplate) => {
    router.push(`/dashboard/events/add?template=${template.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/events" aria-label="Back to Events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Event Templates</h1>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Event Template</DialogTitle>
              <DialogDescription>
                Create a reusable template for recurring or standard events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Template Name *</label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="e.g. Sunday Service"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Category</label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'All').map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Description</label>
                <Textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Describe the event template..."
                  rows={3}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Duration</label>
                  <Input
                    value={newTemplate.duration}
                    onChange={(e) => setNewTemplate({...newTemplate, duration: e.target.value})}
                    placeholder="e.g. 90 mins"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Default Time</label>
                  <Input
                    value={newTemplate.defaultTime}
                    onChange={(e) => setNewTemplate({...newTemplate, defaultTime: e.target.value})}
                    placeholder="e.g. 10:00 AM"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Max Attendees</label>
                  <Input
                    type="number"
                    value={newTemplate.maxAttendees}
                    onChange={(e) => setNewTemplate({...newTemplate, maxAttendees: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Default Location</label>
                <Input
                  value={newTemplate.location}
                  onChange={(e) => setNewTemplate({...newTemplate, location: e.target.value})}
                  placeholder="e.g. Main Sanctuary"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateTemplate} disabled={!newTemplate.name.trim()}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="transition-colors hover:border-foreground/20">
            <CardHeader className="pb-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-base truncate">{template.name}</CardTitle>
                  <EventCategoryBadge category={template.category} />
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedTemplate(template); setShowPreviewDialog(true); }} aria-label="Preview template">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTemplate(template)} aria-label="Edit template">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive focus:text-destructive" onClick={() => handleDeleteTemplate(template)} aria-label="Delete template">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{template.duration} • {template.defaultTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{template.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>Up to {template.maxAttendees} attendees</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="text-[11px] text-muted-foreground">Used {template.usageCount} times</div>
                <Button size="sm" onClick={() => handleUseTemplate(template)}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm font-medium">No templates found matching your criteria.</p>
        </div>
      )}

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Event Template</DialogTitle>
            <DialogDescription>Update the template details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Template Name *</label>
                <Input value={editTemplate.name} onChange={(e) => setEditTemplate({...editTemplate, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Category</label>
                <Select value={editTemplate.category} onValueChange={(value) => setEditTemplate({...editTemplate, category: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All').map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description</label>
              <Textarea value={editTemplate.description} onChange={(e) => setEditTemplate({...editTemplate, description: e.target.value})} rows={3} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Duration</label>
                <Input value={editTemplate.duration} onChange={(e) => setEditTemplate({...editTemplate, duration: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Default Time</label>
                <Input value={editTemplate.defaultTime} onChange={(e) => setEditTemplate({...editTemplate, defaultTime: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Max Attendees</label>
                <Input type="number" value={editTemplate.maxAttendees} onChange={(e) => setEditTemplate({...editTemplate, maxAttendees: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Location</label>
              <Input value={editTemplate.location} onChange={(e) => setEditTemplate({...editTemplate, location: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleUpdateTemplate} disabled={!editTemplate.name.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>Details of the selected template</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-3 py-2 text-xs">
              <div>
                <h3 className="font-semibold text-sm text-foreground">{selectedTemplate.name}</h3>
                <p className="text-muted-foreground mt-1">{selectedTemplate.description}</p>
              </div>
              <div className="pt-1"><EventCategoryBadge category={selectedTemplate.category} /></div>
              <div className="space-y-2 pt-2 border-t border-border/50 text-muted-foreground">
                <div className="flex justify-between"><span>Duration:</span><span className="font-medium text-foreground">{selectedTemplate.duration}</span></div>
                <div className="flex justify-between"><span>Default Time:</span><span className="font-medium text-foreground">{selectedTemplate.defaultTime}</span></div>
                <div className="flex justify-between"><span>Location:</span><span className="font-medium text-foreground">{selectedTemplate.location}</span></div>
                <div className="flex justify-between"><span>Max Attendees:</span><span className="font-medium text-foreground">{selectedTemplate.maxAttendees}</span></div>
                <div className="flex justify-between"><span>Usage Count:</span><span className="font-medium text-foreground">{selectedTemplate.usageCount} times</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            {selectedTemplate && (
              <Button size="sm" onClick={() => {
                setShowPreviewDialog(false);
                handleUseTemplate(selectedTemplate);
              }}>
                Use Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{templateToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}