import { describe, it, expect } from 'vitest';
import { memberResourcesService } from '@/services/member';
import { formatFileSize, formatDuration } from '@/lib/config/member/resources';

describe('Member Portal — Phase 10: Resources & Downloads', () => {
  it('retrieves paginated church resources', async () => {
    const res = await memberResourcesService.getResources({ page: 1, pageSize: 4 });

    expect(res).toBeDefined();
    expect(res.items.length).toBe(4);
    expect(res.total).toBeGreaterThan(4);
    expect(res.totalPages).toBeGreaterThan(1);
    expect(res.items[0]).toHaveProperty('title');
    expect(res.items[0]).toHaveProperty('category');
    expect(res.items[0]).toHaveProperty('type');
  });

  it('filters resources by category', async () => {
    const teachingRes = await memberResourcesService.getResources({ category: 'Teaching' });
    expect(teachingRes.items.length).toBeGreaterThan(0);
    expect(teachingRes.items.every((r) => r.category === 'Teaching')).toBe(true);

    const formsRes = await memberResourcesService.getResources({ category: 'Forms' });
    expect(formsRes.items.length).toBeGreaterThan(0);
    expect(formsRes.items.every((r) => r.category === 'Forms')).toBe(true);
  });

  it('filters resources by type', async () => {
    const audioRes = await memberResourcesService.getResources({ type: 'Audio' });
    expect(audioRes.items.length).toBeGreaterThan(0);
    expect(audioRes.items.every((r) => r.type === 'Audio')).toBe(true);

    const pdfRes = await memberResourcesService.getResources({ type: 'PDF' });
    expect(pdfRes.items.length).toBeGreaterThan(0);
    expect(pdfRes.items.every((r) => r.type === 'PDF')).toBe(true);
  });

  it('searches resources by keyword across title, description, speaker, and tags', async () => {
    const prayerSearch = await memberResourcesService.getResources({ search: 'Prayer' });
    expect(prayerSearch.items.length).toBeGreaterThan(0);

    const foundationSearch = await memberResourcesService.getResources({ search: 'Foundations' });
    expect(foundationSearch.items.length).toBeGreaterThan(0);
    expect(foundationSearch.items[0].title).toContain('Foundations');
  });

  it('sorts resources chronologically and alphabetically', async () => {
    const ascRes = await memberResourcesService.getResources({ sort: 'title_asc' });
    const titles = ascRes.items.map((r) => r.title);
    const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sortedTitles);
  });

  it('retrieves single resource by ID', async () => {
    const resource = await memberResourcesService.getResourceById('res-001');

    expect(resource).toBeDefined();
    expect(resource?.title).toBe('Foundations of Christian Faith (EMC 101 Study Notes)');
    expect(resource?.category).toBe('Teaching');
    expect(resource?.type).toBe('PDF');
  });

  it('retrieves featured resources', async () => {
    const featured = await memberResourcesService.getFeaturedResources();

    expect(featured).toBeDefined();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((r) => r.isFeatured)).toBe(true);
  });

  it('formats file sizes and media durations cleanly', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(3145728)).toBe('3.0 MB');

    expect(formatDuration(120)).toBe('2 min');
    expect(formatDuration(3660)).toBe('1 hr 1 min');
  });
});
