'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Clock,
  MapPin,
  Users,
  Calendar
} from 'lucide-react';

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
    setEditTemplate({
      name: '',
      description: '',
      category: 'Worship',
      duration: '',
      location: '',
      maxAttendees: 100,
      defaultTime: ''
    });
  };

  const handleDeleteTemplate = (template: EventTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTemplate = () => {
    if (!templateToDelete) return;
    
    const updatedTemplates = templates.filter(template => template.id !== templateToDelete.id);
    setTemplates(updatedTemplates);
    setShowDeleteDialog(false);
    setTemplateToDelete(null);
  };

  const handleUseTemplate = (template: EventTemplate) => {
    // In a real implementation, this would navigate to create event with template data
    router.push(`/dashboard/events/add?template=${template.id}`);
  };



  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'worship': return 'bg-blue-100 text-blue-800';
      case 'study': return 'bg-green-100 text-green-800';
      case 'conference': return 'bg-purple-100 text-purple-800';
      case 'outreach': return 'bg-orange-100 text-orange-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Event Templates</h1>
            <p className="text-muted-foreground">Manage reusable event templates</p>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-brand-primary hover:bg-brand-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Event Template</DialogTitle>
              <DialogDescription>
                Create a reusable template for future events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name</label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="e.g., Sunday Service"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'All').map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  placeholder="Describe the event template..."
                  rows={3}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Input
                    value={newTemplate.duration}
                    onChange={(e) => setNewTemplate({...newTemplate, duration: e.target.value})}
                    placeholder="e.g., 90 minutes"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Time</label>
                  <Input
                    value={newTemplate.defaultTime}
                    onChange={(e) => setNewTemplate({...newTemplate, defaultTime: e.target.value})}
                    placeholder="e.g., 10:00 AM"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Attendees</label>
                  <Input
                    type="number"
                    value={newTemplate.maxAttendees}
                    onChange={(e) => setNewTemplate({...newTemplate, maxAttendees: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Location</label>
                <Input
                  value={newTemplate.location}
                  onChange={(e) => setNewTemplate({...newTemplate, location: e.target.value})}
                  placeholder="e.g., Main Sanctuary"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} className="bg-brand-primary hover:bg-brand-primary/90">
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowPreviewDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteTemplate(template)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{template.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{template.duration} • {template.defaultTime}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{template.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Up to {template.maxAttendees} attendees</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  Used {template.usageCount} times
                </div>
                
                <Button 
                  size="sm" 
                  className="bg-brand-primary hover:bg-brand-primary/90"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event Template</DialogTitle>
            <DialogDescription>
              Update the template details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={editTemplate.name}
                  onChange={(e) => setEditTemplate({...editTemplate, name: e.target.value})}
                  placeholder="e.g., Sunday Service"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={editTemplate.category} onValueChange={(value) => setEditTemplate({...editTemplate, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All').map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editTemplate.description}
                onChange={(e) => setEditTemplate({...editTemplate, description: e.target.value})}
                placeholder="Describe the event template..."
                rows={3}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input
                  value={editTemplate.duration}
                  onChange={(e) => setEditTemplate({...editTemplate, duration: e.target.value})}
                  placeholder="e.g., 90 minutes"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Time</label>
                <Input
                  value={editTemplate.defaultTime}
                  onChange={(e) => setEditTemplate({...editTemplate, defaultTime: e.target.value})}
                  placeholder="e.g., 10:00 AM"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Attendees</label>
                <Input
                  type="number"
                  value={editTemplate.maxAttendees}
                  onChange={(e) => setEditTemplate({...editTemplate, maxAttendees: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Location</label>
              <Input
                value={editTemplate.location}
                onChange={(e) => setEditTemplate({...editTemplate, location: e.target.value})}
                placeholder="e.g., Main Sanctuary"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate} className="bg-brand-primary hover:bg-brand-primary/90">
                Update Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the template "{templateToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTemplate}>
              Delete Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview of the {selectedTemplate?.name} template
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Template Name</label>
                  <p className="font-medium">{selectedTemplate.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <Badge className={getCategoryColor(selectedTemplate.category)}>
                    {selectedTemplate.category}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p>{selectedTemplate.description}</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p>{selectedTemplate.duration}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Default Time</label>
                  <p>{selectedTemplate.defaultTime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Max Attendees</label>
                  <p>{selectedTemplate.maxAttendees}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Default Location</label>
                <p>{selectedTemplate.location}</p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setShowPreviewDialog(false);
                  }}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Use This Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || categoryFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first event template to get started'
              }
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}