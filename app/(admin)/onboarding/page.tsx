'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Church,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChurchDetails {
  name: string;
  motto: string;
  founded: string;
  denomination: string;
  email: string;
  phone: string;
  alternativePhone: string;
  website: string;
}

interface AddressDetails {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface LeadershipDetails {
  seniorPastorName: string;
  seniorPastorEmail: string;
  seniorPastorPhone: string;
  assistantPastorName: string;
  assistantPastorEmail: string;
  assistantPastorPhone: string;
}

interface ChurchInfo {
  totalMembers: string;
  branches: string;
  serviceSchedule: string;
  establishmentType: string;
}

interface OnboardingData {
  churchDetails: ChurchDetails;
  addressDetails: AddressDetails;
  leadershipDetails: LeadershipDetails;
  churchInfo: ChurchInfo;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

const STEPS = [
  { id: 1, title: 'Church Details', icon: Church, description: 'Basic church information' },
  { id: 2, title: 'Location', icon: MapPin, description: 'Physical address details' },
  { id: 3, title: 'Leadership', icon: Users, description: 'Church leaders information' },
  { id: 4, title: 'Church Info', icon: Building2, description: 'Additional church details' },
  { id: 5, title: 'Review & Complete', icon: CheckCircle, description: 'Review and submit' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    churchDetails: {
      name: '',
      motto: '',
      founded: '',
      denomination: '',
      email: '',
      phone: '',
      alternativePhone: '',
      website: '',
    },
    addressDetails: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Ghana',
    },
    leadershipDetails: {
      seniorPastorName: '',
      seniorPastorEmail: '',
      seniorPastorPhone: '',
      assistantPastorName: '',
      assistantPastorEmail: '',
      assistantPastorPhone: '',
    },
    churchInfo: {
      totalMembers: '',
      branches: '1',
      serviceSchedule: '',
      establishmentType: 'Main',
    },
    agreeToTerms: false,
    agreeToMarketing: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateChurchDetails = (field: keyof ChurchDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      churchDetails: { ...prev.churchDetails, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateAddressDetails = (field: keyof AddressDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      addressDetails: { ...prev.addressDetails, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateLeadershipDetails = (field: keyof LeadershipDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      leadershipDetails: { ...prev.leadershipDetails, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateChurchInfo = (field: keyof ChurchInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      churchInfo: { ...prev.churchInfo, [field]: value }
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.churchDetails.name.trim()) newErrors.name = 'Church name is required';
        if (!formData.churchDetails.email.trim()) newErrors.email = 'Email is required';
        if (!formData.churchDetails.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.churchDetails.founded.trim()) newErrors.founded = 'Year founded is required';
        break;

      case 2:
        if (!formData.addressDetails.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!formData.addressDetails.city.trim()) newErrors.city = 'City is required';
        if (!formData.addressDetails.state.trim()) newErrors.state = 'State/Region is required';
        if (!formData.addressDetails.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        break;

      case 3:
        if (!formData.leadershipDetails.seniorPastorName.trim()) newErrors.seniorPastorName = 'Senior Pastor name is required';
        if (!formData.leadershipDetails.seniorPastorEmail.trim()) newErrors.seniorPastorEmail = 'Senior Pastor email is required';
        if (!formData.leadershipDetails.seniorPastorPhone.trim()) newErrors.seniorPastorPhone = 'Senior Pastor phone is required';
        break;

      case 4:
        if (!formData.churchInfo.totalMembers.trim()) newErrors.totalMembers = 'Total members is required';
        if (!formData.churchInfo.serviceSchedule.trim()) newErrors.serviceSchedule = 'Service schedule is required';
        break;

      case 5:
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to terms and conditions';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement API call to save onboarding data
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Welcome to EMC Church System! 🎉",
        description: "Your church account has been created successfully.",
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-[380px_1fr] h-[700px] max-h-[85vh]">
          {/* Left Sidebar - Steps */}
          <div className="relative bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary p-8 text-white overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400 rounded-full opacity-40 -mb-16 -ml-16" />
            <div className="absolute top-1/2 right-0 w-40 h-40 bg-pink-400 rounded-full opacity-40 -mr-20" />
            
            {/* Steps List */}
            <div className="relative z-10">
              {STEPS.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isLastStep = index === STEPS.length - 1;

                return (
                  <div key={step.id} className="relative">
                    <div
                      className={`flex items-center gap-4 transition-all ${
                        isActive ? 'scale-105' : 'opacity-60'
                      } ${!isLastStep ? 'mb-6' : ''}`}
                    >
                      <div className="relative">
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all relative z-10 ${
                            isCompleted
                              ? 'bg-white border-white text-brand-primary'
                              : isActive
                              ? 'bg-white/20 border-white text-white scale-110'
                              : 'bg-transparent border-white/40 text-white/60'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <span className="text-lg font-bold">{step.id}</span>
                          )}
                        </div>
                        {/* Vertical connecting line */}
                        {!isLastStep && (
                          <div className="absolute left-1/2 top-12 -translate-x-1/2 w-0.5 h-6 transition-all duration-500">
                            <div 
                              className={`w-full transition-all duration-500 ${
                                isCompleted ? 'bg-white h-full' : 'bg-white/30 h-full'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide opacity-80">
                          Step {step.id}
                        </p>
                        <p className={`font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>
                          {step.title}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Indicator */}
            <div className="relative z-10 mt-12">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex flex-col bg-white dark:bg-slate-950 h-full overflow-hidden">
            {/* Step Header */}
            <div className="p-8 lg:p-12 pb-6 border-b shrink-0">
              <h2 className="text-3xl font-bold mb-2">
                {STEPS[currentStep - 1].title}
              </h2>
              <p className="text-muted-foreground">
                {STEPS[currentStep - 1].description}
              </p>
            </div>

            {/* Step Content - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-8 lg:p-12 min-h-0">
              {/* Step 1: Church Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Church Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter church name"
                        value={formData.churchDetails.name}
                        onChange={(e) => updateChurchDetails('name', e.target.value)}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motto">Church Motto/Tagline</Label>
                      <Input
                        id="motto"
                        placeholder="e.g., Empowering Lives, Transforming Communities"
                        value={formData.churchDetails.motto}
                        onChange={(e) => updateChurchDetails('motto', e.target.value)}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="founded">
                          Year Founded <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="founded"
                          type="number"
                          placeholder="e.g., 1995"
                          value={formData.churchDetails.founded}
                          onChange={(e) => updateChurchDetails('founded', e.target.value)}
                          className={errors.founded ? 'border-destructive' : ''}
                        />
                        {errors.founded && (
                          <p className="text-sm text-destructive">{errors.founded}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="denomination">Denomination</Label>
                        <Select
                          value={formData.churchDetails.denomination}
                          onValueChange={(value) => updateChurchDetails('denomination', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select denomination" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                            <SelectItem value="Charismatic">Charismatic</SelectItem>
                            <SelectItem value="Baptist">Baptist</SelectItem>
                            <SelectItem value="Methodist">Methodist</SelectItem>
                            <SelectItem value="Catholic">Catholic</SelectItem>
                            <SelectItem value="Presbyterian">Presbyterian</SelectItem>
                            <SelectItem value="Anglican">Anglican</SelectItem>
                            <SelectItem value="Non-Denominational">Non-Denominational</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Church Email <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="church@example.com"
                            value={formData.churchDetails.email}
                            onChange={(e) => updateChurchDetails('email', e.target.value)}
                            className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Phone Number <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+233 XX XXX XXXX"
                            value={formData.churchDetails.phone}
                            onChange={(e) => updateChurchDetails('phone', e.target.value)}
                            className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-sm text-destructive">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="alternativePhone">Alternative Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="alternativePhone"
                            type="tel"
                            placeholder="+233 XX XXX XXXX"
                            value={formData.churchDetails.alternativePhone}
                            onChange={(e) => updateChurchDetails('alternativePhone', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website (Optional)</Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://www.yourchurch.org"
                          value={formData.churchDetails.website}
                          onChange={(e) => updateChurchDetails('website', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Address Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">
                        Address Line 1 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="addressLine1"
                        placeholder="Street address, P.O. box, company name, etc."
                        value={formData.addressDetails.addressLine1}
                        onChange={(e) => updateAddressDetails('addressLine1', e.target.value)}
                        className={errors.addressLine1 ? 'border-destructive' : ''}
                      />
                      {errors.addressLine1 && (
                        <p className="text-sm text-destructive">{errors.addressLine1}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                      <Input
                        id="addressLine2"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        value={formData.addressDetails.addressLine2}
                        onChange={(e) => updateAddressDetails('addressLine2', e.target.value)}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">
                          City <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="city"
                          placeholder="City"
                          value={formData.addressDetails.city}
                          onChange={(e) => updateAddressDetails('city', e.target.value)}
                          className={errors.city ? 'border-destructive' : ''}
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive">{errors.city}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">
                          State/Region <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="state"
                          placeholder="State or Region"
                          value={formData.addressDetails.state}
                          onChange={(e) => updateAddressDetails('state', e.target.value)}
                          className={errors.state ? 'border-destructive' : ''}
                        />
                        {errors.state && (
                          <p className="text-sm text-destructive">{errors.state}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">
                          Postal Code <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="postalCode"
                          placeholder="Postal code"
                          value={formData.addressDetails.postalCode}
                          onChange={(e) => updateAddressDetails('postalCode', e.target.value)}
                          className={errors.postalCode ? 'border-destructive' : ''}
                        />
                        {errors.postalCode && (
                          <p className="text-sm text-destructive">{errors.postalCode}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={formData.addressDetails.country}
                          onValueChange={(value) => updateAddressDetails('country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ghana">Ghana</SelectItem>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                            <SelectItem value="Kenya">Kenya</SelectItem>
                            <SelectItem value="South Africa">South Africa</SelectItem>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Leadership Details */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Senior Pastor */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5 text-brand-primary" />
                        Senior Pastor
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="seniorPastorName">
                            Full Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="seniorPastorName"
                            placeholder="Pastor John Doe"
                            value={formData.leadershipDetails.seniorPastorName}
                            onChange={(e) => updateLeadershipDetails('seniorPastorName', e.target.value)}
                            className={errors.seniorPastorName ? 'border-destructive' : ''}
                          />
                          {errors.seniorPastorName && (
                            <p className="text-sm text-destructive">{errors.seniorPastorName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seniorPastorEmail">
                            Email <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="seniorPastorEmail"
                            type="email"
                            placeholder="pastor@church.org"
                            value={formData.leadershipDetails.seniorPastorEmail}
                            onChange={(e) => updateLeadershipDetails('seniorPastorEmail', e.target.value)}
                            className={errors.seniorPastorEmail ? 'border-destructive' : ''}
                          />
                          {errors.seniorPastorEmail && (
                            <p className="text-sm text-destructive">{errors.seniorPastorEmail}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seniorPastorPhone">
                            Phone <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="seniorPastorPhone"
                            type="tel"
                            placeholder="+233 XX XXX XXXX"
                            value={formData.leadershipDetails.seniorPastorPhone}
                            onChange={(e) => updateLeadershipDetails('seniorPastorPhone', e.target.value)}
                            className={errors.seniorPastorPhone ? 'border-destructive' : ''}
                          />
                          {errors.seniorPastorPhone && (
                            <p className="text-sm text-destructive">{errors.seniorPastorPhone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Assistant Pastor */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5 text-brand-secondary" />
                        Assistant Pastor (Optional)
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="assistantPastorName">Full Name</Label>
                          <Input
                            id="assistantPastorName"
                            placeholder="Pastor Jane Smith"
                            value={formData.leadershipDetails.assistantPastorName}
                            onChange={(e) => updateLeadershipDetails('assistantPastorName', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assistantPastorEmail">Email</Label>
                          <Input
                            id="assistantPastorEmail"
                            type="email"
                            placeholder="assistant@church.org"
                            value={formData.leadershipDetails.assistantPastorEmail}
                            onChange={(e) => updateLeadershipDetails('assistantPastorEmail', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assistantPastorPhone">Phone</Label>
                          <Input
                            id="assistantPastorPhone"
                            type="tel"
                            placeholder="+233 XX XXX XXXX"
                            value={formData.leadershipDetails.assistantPastorPhone}
                            onChange={(e) => updateLeadershipDetails('assistantPastorPhone', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Church Info */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="totalMembers">
                          Total Members <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="totalMembers"
                          type="number"
                          placeholder="e.g., 500"
                          value={formData.churchInfo.totalMembers}
                          onChange={(e) => updateChurchInfo('totalMembers', e.target.value)}
                          className={errors.totalMembers ? 'border-destructive' : ''}
                        />
                        {errors.totalMembers && (
                          <p className="text-sm text-destructive">{errors.totalMembers}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="branches">Number of Branches</Label>
                        <Input
                          id="branches"
                          type="number"
                          placeholder="e.g., 1"
                          value={formData.churchInfo.branches}
                          onChange={(e) => updateChurchInfo('branches', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="establishmentType">Establishment Type</Label>
                      <Select
                        value={formData.churchInfo.establishmentType}
                        onValueChange={(value) => updateChurchInfo('establishmentType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main">Main/Headquarters</SelectItem>
                          <SelectItem value="Branch">Branch</SelectItem>
                          <SelectItem value="Plant">Church Plant</SelectItem>
                          <SelectItem value="Campus">Multi-Campus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serviceSchedule">
                        Service Schedule <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="serviceSchedule"
                        placeholder="e.g., Sunday Service: 8:00 AM & 10:00 AM&#10;Wednesday Bible Study: 6:00 PM&#10;Friday Prayer Meeting: 7:00 PM"
                        value={formData.churchInfo.serviceSchedule}
                        onChange={(e) => updateChurchInfo('serviceSchedule', e.target.value)}
                        rows={4}
                        className={errors.serviceSchedule ? 'border-destructive' : ''}
                      />
                      {errors.serviceSchedule && (
                        <p className="text-sm text-destructive">{errors.serviceSchedule}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Enter your regular service times (one per line)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review & Complete */}
              {currentStep === 5 && (
                <div className="space-y-6 pb-8">
                  <div className="bg-muted/50 rounded-lg p-6 space-y-6">
                    {/* Church Details Summary */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Church className="h-5 w-5 text-brand-primary" />
                        Church Details
                      </h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{formData.churchDetails.name}</span>
                        </div>
                        {formData.churchDetails.motto && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Motto:</span>
                            <span className="font-medium">{formData.churchDetails.motto}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Founded:</span>
                          <span className="font-medium">{formData.churchDetails.founded}</span>
                        </div>
                        {formData.churchDetails.denomination && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Denomination:</span>
                            <span className="font-medium">{formData.churchDetails.denomination}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{formData.churchDetails.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{formData.churchDetails.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Address Summary */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-brand-primary" />
                        Location
                      </h3>
                      <div className="text-sm">
                        <p className="font-medium">{formData.addressDetails.addressLine1}</p>
                        {formData.addressDetails.addressLine2 && (
                          <p>{formData.addressDetails.addressLine2}</p>
                        )}
                        <p>
                          {formData.addressDetails.city}, {formData.addressDetails.state}{' '}
                          {formData.addressDetails.postalCode}
                        </p>
                        <p>{formData.addressDetails.country}</p>
                      </div>
                    </div>

                    {/* Leadership Summary */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5 text-brand-primary" />
                        Leadership
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium">Senior Pastor: {formData.leadershipDetails.seniorPastorName}</p>
                          <p className="text-muted-foreground">{formData.leadershipDetails.seniorPastorEmail}</p>
                        </div>
                        {formData.leadershipDetails.assistantPastorName && (
                          <div>
                            <p className="font-medium">Assistant Pastor: {formData.leadershipDetails.assistantPastorName}</p>
                            <p className="text-muted-foreground">{formData.leadershipDetails.assistantPastorEmail}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Church Info Summary */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-brand-primary" />
                        Church Information
                      </h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Members:</span>
                          <span className="font-medium">{formData.churchInfo.totalMembers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Branches:</span>
                          <span className="font-medium">{formData.churchInfo.branches}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{formData.churchInfo.establishmentType}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                        }
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the Terms & Conditions{' '}
                          <span className="text-destructive">*</span>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          By checking this box, you agree to our terms of service and privacy policy.
                        </p>
                      </div>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-destructive">{errors.agreeToTerms}</p>
                    )}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="marketing"
                        checked={formData.agreeToMarketing}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ ...prev, agreeToMarketing: checked as boolean }))
                        }
                      />
                      <Label
                        htmlFor="marketing"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to receive marketing communications from EMC Church System
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons - Fixed at bottom */}
            <div className="border-t bg-muted/30 p-6 lg:px-12 shrink-0">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isSubmitting}
                  size="lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < STEPS.length ? (
                  <Button 
                    onClick={handleNext} 
                    className="bg-brand-primary hover:bg-brand-primary/90"
                    size="lg"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-brand-primary hover:bg-brand-primary/90"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
