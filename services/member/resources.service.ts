import {
  MemberResource,
  ResourceFilterOptions,
  ResourcePaginatedResult,
} from '@/lib/types/member';
import { mockMemberResourcesList } from '@/lib/mock/member';

export interface MemberResourcesService {
  getResources(filter?: ResourceFilterOptions): Promise<ResourcePaginatedResult>;
  getResourceById(id: string): Promise<MemberResource | null>;
  getFeaturedResources(): Promise<MemberResource[]>;
  getRecentResources(limit?: number): Promise<MemberResource[]>;
}

export class MockMemberResourcesService implements MemberResourcesService {
  private resources: MemberResource[] = [...mockMemberResourcesList];

  async getResources(
    filter?: ResourceFilterOptions
  ): Promise<ResourcePaginatedResult> {
    let list = [...this.resources];

    // Filter by Category
    if (filter?.category && filter.category !== 'all') {
      list = list.filter((r) => r.category === filter.category);
    }

    // Filter by Type
    if (filter?.type && filter.type !== 'all') {
      list = list.filter((r) => r.type === filter.type);
    }

    // Filter by Ministry
    if (filter?.ministry && filter.ministry !== 'all') {
      list = list.filter((r) => r.ministry === filter.ministry);
    }

    // Filter by Search Query
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
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

    // Sorting
    const sort = filter?.sort || 'newest';
    if (sort === 'newest') {
      list.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } else if (sort === 'oldest') {
      list.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      );
    } else if (sort === 'title_asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'title_desc') {
      list.sort((a, b) => b.title.localeCompare(a.title));
    }

    const total = list.length;
    const page = filter?.page || 1;
    const pageSize = filter?.pageSize || 6;
    const totalPages = Math.ceil(total / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const paginatedItems = list.slice(startIndex, startIndex + pageSize);

    return Promise.resolve({
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
    });
  }

  async getResourceById(id: string): Promise<MemberResource | null> {
    const item = this.resources.find((r) => r.id === id);
    return Promise.resolve(item ? { ...item } : null);
  }

  async getFeaturedResources(): Promise<MemberResource[]> {
    const featured = this.resources.filter((r) => r.isFeatured);
    return Promise.resolve([...featured]);
  }

  async getRecentResources(limit: number = 4): Promise<MemberResource[]> {
    const sorted = [...this.resources].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return Promise.resolve(sorted.slice(0, limit));
  }
}

export const memberResourcesService = new MockMemberResourcesService();
