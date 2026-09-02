'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MemberPageHeader } from '@/components/member/shared';
import {
  MemberResource,
  ResourceCategory,
  ResourceType,
  ResourcePaginatedResult,
} from '@/lib/types/member';
import { RESOURCE_CATEGORIES } from '@/lib/config/member/resources';
import { ResourceOverview } from './resource-overview';
import { ResourceCard } from './resource-card';
import { FeaturedResources } from './featured-resources';
import { ResourceDetailsDialog } from './resource-details';
import { ResourceEmptyState } from './resource-empty-state';
import { cn } from '@/lib/utils';

export interface ResourcesViewProps {
  initialData: ResourcePaginatedResult;
  featuredResources: MemberResource[];
  className?: string;
}

const PAGE_SIZE = 6;

export function ResourcesView({
  initialData,
  featuredResources,
  className,
}: ResourcesViewProps) {
  const [allResources] = useState<MemberResource[]>(initialData.items);
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'title_asc' | 'title_desc'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResource, setSelectedResource] = useState<MemberResource | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter & Search
  const filteredResources = useMemo(() => {
    let list = [...allResources];

    if (selectedCategory !== 'all') {
      list = list.filter((r) => r.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      list = list.filter((r) => r.type === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.author && r.author.toLowerCase().includes(q)) ||
          (r.speaker && r.speaker.toLowerCase().includes(q)) ||
          (r.ministry && r.ministry.toLowerCase().includes(q)) ||
          (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    if (sortOption === 'newest') {
      list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortOption === 'oldest') {
      list.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    } else if (sortOption === 'title_asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'title_desc') {
      list.sort((a, b) => b.title.localeCompare(a.title));
    }

    return list;
  }, [allResources, selectedCategory, selectedType, searchQuery, sortOption]);

  const totalPages = Math.ceil(filteredResources.length / PAGE_SIZE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredResources.slice(start, start + PAGE_SIZE);
  }, [filteredResources, currentPage]);

  const handleViewDetails = (resource: MemberResource) => {
    setSelectedResource(resource);
    setIsDetailOpen(true);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const isFiltered = selectedCategory !== 'all' || selectedType !== 'all' || searchQuery.trim() !== '';

  return (
    <div className={cn('space-y-6', className)}>
      {/* Standalone Page Header */}
      <MemberPageHeader
        title="Resources"
        breadcrumbs={[{ label: 'Resources' }]}
      />

      {/* Overview Context Cards */}
      <ResourceOverview
        totalResources={allResources.length}
        featuredCount={featuredResources.length}
      />

      {/* Featured Resources Section (only on default view) */}
      {!isFiltered && featuredResources.length > 0 && (
        <FeaturedResources
          resources={featuredResources}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        {/* Search & Dropdown Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search sermons, studies, guides, topics..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              value={selectedType}
              onValueChange={(val) => {
                setSelectedType(val as ResourceType | 'all');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Formats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="PDF">PDF Documents</SelectItem>
                <SelectItem value="Audio">Audio Sermons</SelectItem>
                <SelectItem value="Video">Video Messages</SelectItem>
                <SelectItem value="Form">Church Forms</SelectItem>
                <SelectItem value="Document">Documents</SelectItem>
                <SelectItem value="Link">External Links</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3">
            <Select
              value={sortOption}
              onValueChange={(val) => {
                setSortOption(val as any);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title_asc">Title (A – Z)</SelectItem>
                <SelectItem value="title_desc">Title (Z – A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {RESOURCE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <Button
                key={cat.value}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setCurrentPage(1);
                }}
                className={cn(
                  'h-8 text-xs font-medium shrink-0 rounded-full px-3.5',
                  !isActive && 'text-muted-foreground hover:text-foreground'
                )}
              >
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Resource Grid Section */}
        <div className="pt-2">
          {paginatedItems.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedItems.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
                  <span>
                    Showing <strong>{paginatedItems.length}</strong> of{' '}
                    <strong>{filteredResources.length}</strong> resources
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="h-8 text-xs gap-1"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Previous</span>
                    </Button>

                    <span className="font-medium text-foreground px-2">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="h-8 text-xs gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ResourceEmptyState
              isSearchOrFilter={isFiltered}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>
      </div>

      {/* Resource Detail Modal */}
      <ResourceDetailsDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        resource={selectedResource}
      />
    </div>
  );
}
