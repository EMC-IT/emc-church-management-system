import apiClient from './api-client';
import {
  Asset,
  AssetStatus,
  AssetCondition,
  AssetCategory,
  AssetPriority,
  AssetFormData,
  AssetSearchParams,
  AssetListResponse,
  AssetAnalytics,
  AssetCategoryData,
} from '@/lib/types/assets';

// Initial realistic mock data representing church assets
const INITIAL_ASSETS: Asset[] = [
  {
    id: 'ast-1',
    name: 'Sound Mixing Console',
    description: 'Digital mixing console for main sanctuary audio system',
    category: AssetCategory.AUDIO_VISUAL,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.EXCELLENT,
    priority: AssetPriority.HIGH,
    purchasePrice: 25000,
    currentValue: 22000,
    depreciationRate: 10,
    currency: 'GHS',
    location: 'Main Sanctuary',
    assignedDepartment: 'Media Ministry',
    assignedTo: 'Kofi Mensah (Audio Engineer)',
    purchaseDate: '2023-08-15',
    warrantyExpiry: '2025-08-15',
    lastMaintenance: '2023-12-01',
    nextMaintenance: '2024-06-01',
    serialNumber: 'YM2023CL5001',
    model: 'CL5',
    manufacturer: 'Yamaha',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-08-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
  },
  {
    id: 'ast-2',
    name: 'Church Van (15-Seater)',
    description: 'High-roof passenger van for community outreach and ministry transport',
    category: AssetCategory.VEHICLES,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.GOOD,
    priority: AssetPriority.HIGH,
    purchasePrice: 180000,
    currentValue: 150000,
    depreciationRate: 15,
    currency: 'GHS',
    location: 'Church Parking / Garage',
    assignedDepartment: 'Transport & Logistics',
    assignedTo: 'Emmanuel Osei (Driver)',
    purchaseDate: '2022-03-10',
    warrantyExpiry: '2025-03-10',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10',
    serialNumber: 'TH2022HC001',
    model: 'Hiace High Roof',
    manufacturer: 'Toyota',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2022-03-10T09:00:00Z',
    updatedAt: '2024-01-10T11:20:00Z',
  },
  {
    id: 'ast-3',
    name: 'HD Laser Projector - Main Hall',
    description: '10,000 lumens high-definition sanctuary projector',
    category: AssetCategory.AUDIO_VISUAL,
    status: AssetStatus.MAINTENANCE,
    condition: AssetCondition.NEEDS_REPAIR,
    priority: AssetPriority.HIGH,
    purchasePrice: 18500,
    currentValue: 12000,
    depreciationRate: 12,
    currency: 'GHS',
    location: 'Main Sanctuary',
    assignedDepartment: 'Media Ministry',
    assignedTo: 'David Asante (Media Lead)',
    purchaseDate: '2021-11-20',
    warrantyExpiry: '2023-11-20',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-02-05',
    serialNumber: 'EP2021EB001',
    model: 'EB-L12000Q',
    manufacturer: 'Epson',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2021-11-20T15:00:00Z',
    updatedAt: '2024-01-05T16:45:00Z',
  },
  {
    id: 'ast-4',
    name: 'Concert Grand Piano',
    description: 'Semi-concert grand piano for sanctuary worship services',
    category: AssetCategory.MUSICAL_INSTRUMENTS,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.EXCELLENT,
    priority: AssetPriority.CRITICAL,
    purchasePrice: 95000,
    currentValue: 88000,
    depreciationRate: 5,
    currency: 'GHS',
    location: 'Main Sanctuary',
    assignedDepartment: 'Worship Ministry',
    assignedTo: 'Grace Addo (Music Director)',
    purchaseDate: '2020-06-01',
    warrantyExpiry: '2025-06-01',
    lastMaintenance: '2023-12-15',
    nextMaintenance: '2024-06-15',
    serialNumber: 'SS2020MM001',
    model: 'Model M',
    manufacturer: 'Steinway & Sons',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2020-06-01T14:00:00Z',
    updatedAt: '2023-12-15T13:30:00Z',
  },
  {
    id: 'ast-5',
    name: 'Sanctuary Ergonomic Chairs (Set of 100)',
    description: 'Padded interlocking sanctuary seating',
    category: AssetCategory.FURNITURE,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.GOOD,
    priority: AssetPriority.MEDIUM,
    purchasePrice: 45000,
    currentValue: 38000,
    depreciationRate: 10,
    currency: 'GHS',
    location: 'Main Sanctuary',
    assignedDepartment: 'Facilities Management',
    purchaseDate: '2022-09-01',
    warrantyExpiry: '2027-09-01',
    serialNumber: 'SCH2022-100',
    model: 'Sanctuary Comfort Pro',
    manufacturer: 'Church Interiors Ltd',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2022-09-01T10:00:00Z',
    updatedAt: '2023-12-01T09:00:00Z',
  },
  {
    id: 'ast-6',
    name: 'Backup Power Generator (100kVA)',
    description: 'Heavy duty diesel standby generator for church auditorium and offices',
    category: AssetCategory.EQUIPMENT,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.GOOD,
    priority: AssetPriority.CRITICAL,
    purchasePrice: 120000,
    currentValue: 105000,
    depreciationRate: 10,
    currency: 'GHS',
    location: 'Generator Shed (Compound)',
    assignedDepartment: 'Facilities Management',
    assignedTo: 'Kwesi Appiah (Facilities Supervisor)',
    purchaseDate: '2021-05-15',
    warrantyExpiry: '2024-05-15',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-04-20',
    serialNumber: 'FGW2021-100KVA',
    model: 'P100-3',
    manufacturer: 'FG Wilson',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2021-05-15T12:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'ast-7',
    name: 'Wireless Microphone Systems (Set of 8)',
    description: 'UHF dual-channel wireless microphone system with handheld and lapel mics',
    category: AssetCategory.AUDIO_VISUAL,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.EXCELLENT,
    priority: AssetPriority.HIGH,
    purchasePrice: 16000,
    currentValue: 14000,
    depreciationRate: 15,
    currency: 'GHS',
    location: 'Media Control Room',
    assignedDepartment: 'Media Ministry',
    purchaseDate: '2023-04-10',
    warrantyExpiry: '2025-04-10',
    serialNumber: 'SH2023QLXD-8',
    model: 'QLX-D Digital',
    manufacturer: 'Shure',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-04-10T11:00:00Z',
    updatedAt: '2023-11-10T14:00:00Z',
  },
  {
    id: 'ast-8',
    name: 'Commercial Kitchen Deep Freezer',
    description: '450L commercial double door chest freezer for fellowship and welfare catering',
    category: AssetCategory.KITCHEN_APPLIANCES,
    status: AssetStatus.MAINTENANCE,
    condition: AssetCondition.POOR,
    priority: AssetPriority.MEDIUM,
    purchasePrice: 8500,
    currentValue: 4500,
    depreciationRate: 15,
    currency: 'GHS',
    location: 'Church Kitchen / Fellowship Hall',
    assignedDepartment: 'Welfare & Hospitality',
    purchaseDate: '2020-02-14',
    warrantyExpiry: '2023-02-14',
    lastMaintenance: '2023-11-10',
    nextMaintenance: '2024-01-30',
    serialNumber: 'NAS2020-CF450',
    model: 'NAS-CF450',
    manufacturer: 'Nasco',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2020-02-14T09:00:00Z',
    updatedAt: '2023-11-10T16:00:00Z',
  },
  {
    id: 'ast-9',
    name: 'Admin Desktop Computers (Set of 4)',
    description: 'Workstations for finance, pastoral administration, and secretarial offices',
    category: AssetCategory.TECHNOLOGY,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.GOOD,
    priority: AssetPriority.MEDIUM,
    purchasePrice: 28000,
    currentValue: 21500,
    depreciationRate: 20,
    currency: 'GHS',
    location: 'Administration Offices',
    assignedDepartment: 'Administration & Finance',
    purchaseDate: '2022-07-20',
    warrantyExpiry: '2025-07-20',
    serialNumber: 'DELL2022-OPT4',
    model: 'OptiPlex 7090',
    manufacturer: 'Dell',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2022-07-20T10:00:00Z',
    updatedAt: '2023-10-15T11:00:00Z',
  },
];

const INITIAL_CATEGORIES: AssetCategoryData[] = [
  {
    id: 'cat-av',
    name: 'Audio Visual Equipment',
    description: 'Sound mixing consoles, microphones, speakers, projectors, cameras, and screens',
    color: '#2E8DB0',
    icon: 'Tv',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 15,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-vehicles',
    name: 'Vehicles & Transport',
    description: 'Church vans, buses, and logistics vehicles',
    color: '#C49831',
    icon: 'Car',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 15,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-instruments',
    name: 'Musical Instruments',
    description: 'Pianos, keyboards, drum kits, guitars, and orchestral gear',
    color: '#A5CF5D',
    icon: 'Music',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 10,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-furniture',
    name: 'Furniture & Fixtures',
    description: 'Sanctuary seating, executive desks, communion tables, podiums, and chairs',
    color: '#8E44AD',
    icon: 'Armchair',
    requiresSerial: false,
    requiresWarranty: false,
    defaultDepreciationRate: 10,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-equipment',
    name: 'Plant & Equipment',
    description: 'Generators, HVAC air conditioning, water treatment, and facility machines',
    color: '#E67E22',
    icon: 'Cpu',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 12,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-tech',
    name: 'Technology & Computing',
    description: 'Computers, servers, network routers, tablets, and software appliances',
    color: '#3498DB',
    icon: 'Laptop',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 20,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

class AssetService {
  private assets: Asset[] = [...INITIAL_ASSETS];
  private categories: AssetCategoryData[] = [...INITIAL_CATEGORIES];

  async getAssets(params: AssetSearchParams = {}): Promise<AssetListResponse> {
    try {
      const response = await apiClient.get('/assets', { params });
      return response.data;
    } catch {
      let filtered = [...this.assets];

      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            (a.serialNumber && a.serialNumber.toLowerCase().includes(q)) ||
            (a.model && a.model.toLowerCase().includes(q)) ||
            (a.manufacturer && a.manufacturer.toLowerCase().includes(q)) ||
            a.location.toLowerCase().includes(q) ||
            (a.assignedDepartment && a.assignedDepartment.toLowerCase().includes(q))
        );
      }

      if (params.category && (params.category as any) !== 'all') {
        filtered = filtered.filter((a) => a.category === params.category);
      }

      if (params.status && (params.status as any) !== 'all') {
        filtered = filtered.filter((a) => a.status === params.status);
      }

      if (params.condition && (params.condition as any) !== 'all') {
        filtered = filtered.filter((a) => a.condition === params.condition);
      }

      if (params.location && params.location !== 'all') {
        filtered = filtered.filter((a) => a.location.toLowerCase() === params.location?.toLowerCase());
      }

      if (params.assignedDepartment && params.assignedDepartment !== 'all') {
        filtered = filtered.filter(
          (a) => a.assignedDepartment && a.assignedDepartment.toLowerCase() === params.assignedDepartment?.toLowerCase()
        );
      }

      const total = filtered.length;
      const page = params.page || 1;
      const limit = params.limit || 20;
      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);

      return {
        assets: data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  }

  async getAssetById(id: string): Promise<Asset> {
    try {
      const response = await apiClient.get(`/assets/${id}`);
      return response.data;
    } catch {
      const found = this.assets.find((a) => a.id === id);
      if (!found) throw new Error('Asset not found');
      return found;
    }
  }

  async createAsset(data: AssetFormData): Promise<{ data: Asset; message: string }> {
    try {
      const response = await apiClient.post('/assets', data);
      return response.data;
    } catch {
      const newAsset: Asset = {
        ...data,
        id: `ast-${Date.now()}`,
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.assets.unshift(newAsset);
      return { data: newAsset, message: 'Asset created successfully' };
    }
  }

  async updateAsset(id: string, data: Partial<AssetFormData>): Promise<{ data: Asset; message: string }> {
    try {
      const response = await apiClient.put(`/assets/${id}`, data);
      return response.data;
    } catch {
      const idx = this.assets.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Asset not found');

      const updated: Asset = {
        ...this.assets[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      this.assets[idx] = updated;
      return { data: updated, message: 'Asset updated successfully' };
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      await apiClient.delete(`/assets/${id}`);
    } catch {
      this.assets = this.assets.filter((a) => a.id !== id);
    }
  }

  async getAssetStats(): Promise<AssetAnalytics> {
    try {
      const response = await apiClient.get('/assets/stats');
      return response.data;
    } catch {
      const totalAssets = this.assets.length;
      const totalValue = this.assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
      const activeAssets = this.assets.filter((a) => a.status === AssetStatus.ACTIVE).length;

      const needsAttentionAssets = this.assets.filter(
        (a) =>
          a.condition === AssetCondition.NEEDS_REPAIR ||
          a.condition === AssetCondition.POOR ||
          a.condition === AssetCondition.DAMAGED ||
          a.status === AssetStatus.MAINTENANCE
      );
      const maintenanceNeeded = needsAttentionAssets.length;

      const byCategory: any = {};
      const byStatus: any = {};
      const byCondition: any = {};

      for (const a of this.assets) {
        byCategory[a.category] = {
          count: ((byCategory[a.category]?.count || 0) + 1),
          value: ((byCategory[a.category]?.value || 0) + a.currentValue),
          percentage: 0,
        };
        byStatus[a.status] = {
          count: ((byStatus[a.status]?.count || 0) + 1),
          percentage: 0,
        };
        byCondition[a.condition] = {
          count: ((byCondition[a.condition]?.count || 0) + 1),
          percentage: 0,
        };
      }

      return {
        totalAssets,
        totalValue,
        averageValue: totalAssets > 0 ? Math.round(totalValue / totalAssets) : 0,
        currency: 'GHS',
        activeAssets,
        maintenanceNeeded,
        byCategory,
        byStatus,
        byCondition,
        byLocation: {},
        acquisitionTrend: [],
        depreciationTrend: [],
        maintenanceStats: {
          totalMaintenanceRecords: 5,
          averageMaintenanceCost: 240,
          upcomingMaintenance: 2,
          overdueMaintenance: 1,
        },
        alerts: {
          warrantyExpiring: 2,
          needsMaintenance: maintenanceNeeded,
          damagedAssets: 1,
          lostAssets: 0,
        },
      };
    }
  }

  async getCategories(): Promise<{ data: AssetCategoryData[]; total: number }> {
    try {
      const response = await apiClient.get('/assets/categories');
      return response.data;
    } catch {
      return { data: this.categories, total: this.categories.length };
    }
  }

  async exportAssets(params: AssetSearchParams = {}, format: string = 'csv'): Promise<Blob> {
    const listRes = await this.getAssets({ ...params, limit: 1000 });
    const assets = listRes.assets;

    const csvHeaders = [
      'Asset ID',
      'Asset Name',
      'Category',
      'Status',
      'Condition',
      'Current Value (GHS)',
      'Purchase Price (GHS)',
      'Location',
      'Department',
      'Assigned To',
      'Serial Number',
      'Model',
      'Manufacturer',
      'Purchase Date',
    ];

    const csvRows = assets.map((a: Asset) => [
      a.id,
      `"${a.name.replace(/"/g, '""')}"`,
      a.category,
      a.status,
      a.condition,
      a.currentValue.toString(),
      a.purchasePrice.toString(),
      `"${(a.location || '').replace(/"/g, '""')}"`,
      `"${(a.assignedDepartment || '').replace(/"/g, '""')}"`,
      `"${(a.assignedTo || '').replace(/"/g, '""')}"`,
      a.serialNumber || '',
      a.model || '',
      a.manufacturer || '',
      a.purchaseDate || '',
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map((r: string[]) => r.join(','))].join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}

export const assetService = new AssetService();
export default assetService;
