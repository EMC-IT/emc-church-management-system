'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Save,
  X,
  Plus,
  Loader2
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { TeacherFormData } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function AddTeacherPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    phone: '',
    qualifications: [],
    bio: '',
    experience: '',
    specializations: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [newQualification, setNewQualification] = useState('');

  const handleInputChange = (field: keyof TeacherFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addQualification = () => {
    if (newQualification.trim() && !formData.qualifications.includes(newQualification.trim())) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const removeQualification = (qualification: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q !== qualification)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await sundaySchoolService.createTeacher(formData);
      if (response.success) {
        toast.success('Teacher registered successfully');
        router.push('/dashboard/sunday-school/teachers');
      } else {
        toast.error(response.message || 'Failed to create teacher');
      }
    } catch {
      toast.error('Failed to create teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href="/dashboard/sunday-school/teachers" aria-label="Back to Teachers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Register Teacher</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Teacher Information</h2>

            <div className="grid grid-cols-12 gap-5">
              {/* Full Name */}
              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Grace Mensah"
                  required
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Experience */}
              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience || ''}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="5 years Children Ministry teaching"
                />
              </div>

              {/* Email Address */}
              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="grace.mensah@church.org"
                  required
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+233 24 123 4567"
                  required
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              {/* Qualifications */}
              <div className="col-span-12 space-y-2">
                <Label>Qualifications / Certifications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    placeholder="Child Evangelism Fellowship Certified"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addQualification();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addQualification}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.qualifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.qualifications.map((q) => (
                      <Badge key={q} variant="neutral" className="gap-1.5 py-1">
                        {q}
                        <button
                          type="button"
                          onClick={() => removeQualification(q)}
                          className="hover:text-destructive text-muted-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="col-span-12 space-y-2">
                <Label htmlFor="bio">Bio & Ministry Background</Label>
                <Textarea
                  id="bio"
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Optional background and ministry notes..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/sunday-school/teachers')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Register Teacher
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}