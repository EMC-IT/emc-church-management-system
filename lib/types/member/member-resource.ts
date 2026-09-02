export type ResourceCategory =
  | 'Sermons'
  | 'Bible Studies'
  | 'Devotionals'
  | 'Teaching'
  | 'Guides'
  | 'Forms'
  | 'Ministry'
  | 'Documents'
  | 'Media'
  | 'Other';

export type ResourceType =
  | 'PDF'
  | 'Document'
  | 'Audio'
  | 'Video'
  | 'Link'
  | 'Form'
  | 'Image';

export type ResourceAccessType =
  | 'Public'
  | 'Member'
  | 'Ministry'
  | 'Restricted';

export interface MemberResource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  accessType?: ResourceAccessType;
  publishedAt: string;
  fileSize?: number; // In bytes
  fileFormat?: string;
  duration?: number; // In seconds
  downloadUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  author?: string;
  speaker?: string;
  ministry?: string;
  tags?: string[];
  isFeatured?: boolean;
}

export interface ResourceFilterOptions {
  category?: ResourceCategory | 'all';
  type?: ResourceType | 'all';
  search?: string;
  ministry?: string;
  sort?: 'newest' | 'oldest' | 'title_asc' | 'title_desc';
  page?: number;
  pageSize?: number;
}

export interface ResourcePaginatedResult {
  items: MemberResource[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
