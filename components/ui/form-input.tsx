"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Eye, EyeOff, Upload, X, ChevronDown } from "lucide-react";
import { format } from "date-fns";

export interface FormFieldProps {
  name: string;
  label?: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'phone' | 'currency';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
}

export function FormInput({
  name,
  label,
  type,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  value,
  onChange,
  onBlur,
  error,
  helpText,
  options = [],
  validation,
  className,
  size = 'md',
  variant = 'default',
}: FormFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined);

  const handleChange = (newValue: any) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (onChange) {
      onChange(newDate ? format(newDate, 'yyyy-MM-dd') : '');
    }
  };

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const variantClasses = {
    default: 'border-input bg-background',
    outline: 'border-2 border-input bg-transparent',
    filled: 'border-0 bg-muted',
  };

  const renderField = () => {
    switch (type) {
      case 'password':
        return (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              readOnly={readOnly}
              className={cn(
                sizeClasses[size],
                variantClasses[variant],
                error && 'border-destructive focus-visible:ring-destructive',
                className
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              sizeClasses[size],
              variantClasses[variant],
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={handleChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(
              sizeClasses[size],
              variantClasses[variant],
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  sizeClasses[size],
                  variantClasses[variant],
                  error && 'border-destructive focus-visible:ring-destructive',
                  'justify-start text-left font-normal',
                  className
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span className="text-muted-foreground">{placeholder}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={value || false}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
            {label && (
              <Label htmlFor={name} className="text-sm font-normal">
                {label}
              </Label>
            )}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={handleChange}
            disabled={disabled}
            className="space-y-2"
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                <Label htmlFor={`${name}-${option.value}`} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleChange(file);
              }}
              disabled={disabled}
              className={cn(
                sizeClasses[size],
                variantClasses[variant],
                error && 'border-destructive focus-visible:ring-destructive',
                className
              )}
            />
            {value && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Selected: {typeof value === 'string' ? value : value?.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChange(null)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );

      case 'phone':
        return (
          <Input
            type="tel"
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              sizeClasses[size],
              variantClasses[variant],
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              ₵
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder={placeholder}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              readOnly={readOnly}
              className={cn(
                sizeClasses[size],
                variantClasses[variant],
                error && 'border-destructive focus-visible:ring-destructive',
                'pl-8',
                className
              )}
            />
          </div>
        );

      default:
        return (
          <Input
            type={type}
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readOnly}
            min={validation?.min}
            max={validation?.max}
            pattern={validation?.pattern}
            className={cn(
              sizeClasses[size],
              variantClasses[variant],
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {label && type !== 'checkbox' && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {renderField()}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}

// Form Field Group Component
export interface FormFieldGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldGroup({ title, description, children, className }: FormFieldGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Form Section Component
export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className,
  collapsible = false,
  defaultOpen = true 
}: FormSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
} 