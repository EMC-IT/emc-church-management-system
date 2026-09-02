import {
  FileText,
  Video,
  Headphones,
  ExternalLink,
  ClipboardList,
  Image as ImageIcon,
  File,
  type LucideIcon,
} from 'lucide-react';
import { ResourceCategory, ResourceType } from '@/lib/types/member';

export interface ResourceTypeConfig {
  label: string;
  actionLabel: string;
  icon: LucideIcon;
  badgeVariant: 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

export const RESOURCE_TYPE_CONFIG: Record<ResourceType, ResourceTypeConfig> = {
  PDF: {
    label: 'PDF Document',
    actionLabel: 'Download PDF',
    icon: FileText,
    badgeVariant: 'danger',
  },
  Document: {
    label: 'Document',
    actionLabel: 'View Document',
    icon: File,
    badgeVariant: 'neutral',
  },
  Audio: {
    label: 'Audio Sermon',
    actionLabel: 'Listen Audio',
    icon: Headphones,
    badgeVariant: 'info',
  },
  Video: {
    label: 'Video Message',
    actionLabel: 'Watch Video',
    icon: Video,
    badgeVariant: 'primary',
  },
  Form: {
    label: 'Church Form',
    actionLabel: 'Open Form',
    icon: ClipboardList,
    badgeVariant: 'warning',
  },
  Link: {
    label: 'External Link',
    actionLabel: 'Open Link',
    icon: ExternalLink,
    badgeVariant: 'neutral',
  },
  Image: {
    label: 'Image Asset',
    actionLabel: 'View Image',
    icon: ImageIcon,
    badgeVariant: 'neutral',
  },
};

export const RESOURCE_CATEGORIES: Array<{
  value: ResourceCategory | 'all';
  label: string;
}> = [
  { value: 'all', label: 'All Resources' },
  { value: 'Sermons', label: 'Sermons' },
  { value: 'Bible Studies', label: 'Bible Studies' },
  { value: 'Devotionals', label: 'Devotionals' },
  { value: 'Teaching', label: 'Teaching & Notes' },
  { value: 'Guides', label: 'Guides' },
  { value: 'Forms', label: 'Forms' },
  { value: 'Ministry', label: 'Ministry Resources' },
  { value: 'Documents', label: 'Church Documents' },
];

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hrs > 0) {
    return `${hrs} hr ${remainingMins} min`;
  }
  return `${mins} min`;
}
