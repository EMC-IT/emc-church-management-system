export interface MemberResource {
  id: string;
  title: string;
  category: 'Sermon Notes' | 'Study Guide' | 'Form & Policy' | 'Devotional' | 'Bulletin';
  description: string;
  format: 'PDF' | 'Audio' | 'Video' | 'Link';
  fileSize?: string;
  publishedDate: string;
  downloadUrl: string;
}

export interface MemberResourcesService {
  getMemberResources(): Promise<MemberResource[]>;
}

export class MockMemberResourcesService implements MemberResourcesService {
  async getMemberResources(): Promise<MemberResource[]> {
    return Promise.resolve([
      {
        id: 'res-001',
        title: 'Kingdom Stewardship & Giving Guide (2026)',
        category: 'Study Guide',
        description: 'Comprehensive biblical foundation and financial guidelines for church covenant members.',
        format: 'PDF',
        fileSize: '1.8 MB',
        publishedDate: '2026-01-10',
        downloadUrl: '#',
      },
      {
        id: 'res-002',
        title: 'Weekly Sunday Bulletin — August 30',
        category: 'Bulletin',
        description: 'Order of service, prayer highlights, and community announcements.',
        format: 'PDF',
        fileSize: '850 KB',
        publishedDate: '2026-08-30',
        downloadUrl: '#',
      },
      {
        id: 'res-003',
        title: 'Child Dedication & Blessing Request Form',
        category: 'Form & Policy',
        description: 'Application form and pastoral guidelines for infant dedication services.',
        format: 'PDF',
        fileSize: '420 KB',
        publishedDate: '2026-03-01',
        downloadUrl: '#',
      },
      {
        id: 'res-004',
        title: '30 Days of Supernatural Breakthrough Devotional',
        category: 'Devotional',
        description: 'Daily scripture readings, confession declarations, and guided prayer points.',
        format: 'PDF',
        fileSize: '3.2 MB',
        publishedDate: '2026-07-01',
        downloadUrl: '#',
      },
    ]);
  }
}

export const memberResourcesService = new MockMemberResourcesService();
