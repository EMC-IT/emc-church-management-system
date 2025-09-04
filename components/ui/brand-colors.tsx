'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const brandColors = [
  {
    name: 'Primary',
    hex: '#2E8DB0',
    description: 'Deep Blue - Main brand color',
    usage: 'Primary buttons, links, main actions',
    className: 'bg-brand-primary text-white',
  },
  {
    name: 'Secondary',
    hex: '#28ACD1',
    description: 'Light Blue - Secondary brand color',
    usage: 'Secondary buttons, highlights, accents',
    className: 'bg-brand-secondary text-white',
  },
  {
    name: 'Accent',
    hex: '#C49831',
    description: 'Gold - Accent color',
    usage: 'Warnings, special highlights, premium features',
    className: 'bg-brand-accent text-white',
  },
  {
    name: 'Success',
    hex: '#A5CF5D',
    description: 'Green - Success color',
    usage: 'Success states, positive actions, confirmations',
    className: 'bg-brand-success text-white',
  },
  {
    name: 'Dark',
    hex: '#080A09',
    description: 'Dark - Text and backgrounds',
    usage: 'Text, borders, dark backgrounds',
    className: 'bg-brand-dark text-white',
  },
];

export function BrandColors() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Brand Colors</h2>
        <p className="text-muted-foreground">
          The official color palette for ChurchMS
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brandColors.map((color) => (
          <Card key={color.name} className="overflow-hidden">
            <div className={`h-20 ${color.className} flex items-center justify-center`}>
              <span className="text-lg font-semibold">{color.name}</span>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{color.name}</CardTitle>
              <CardDescription className="text-xs">{color.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono">{color.hex}</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: color.hex }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{color.usage}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="bg-brand-primary text-white px-4 py-2 rounded-md text-sm">
                Primary Button
              </button>
              <button className="bg-brand-secondary text-white px-4 py-2 rounded-md text-sm">
                Secondary Button
              </button>
              <button className="bg-brand-accent text-white px-4 py-2 rounded-md text-sm">
                Accent Button
              </button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-brand-success"></div>
                <span className="text-sm">Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-brand-accent"></div>
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-brand-primary"></div>
                <span className="text-sm">In Progress</span>
              </div>
            </CardContent>image.png
          </Card>
        </div>
      </div>
    </div>
  );
} 