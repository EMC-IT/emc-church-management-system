import { Edit, Mail, Phone, Smartphone, Calendar, User, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MemberProfile } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface ProfileHeaderCardProps {
  member: MemberProfile;
  onEditClick: () => void;
  className?: string;
}

export function ProfileHeaderCard({ member, onEditClick, className }: ProfileHeaderCardProps) {
  const fullName = member.displayName || `${member.firstName} ${member.lastName}`;

  const getInitials = (name?: string) => {
    if (!name) return 'M';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'M';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '—';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? '—' : `${age} years old`;
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-3 flex items-center justify-center">
          {member.avatarUrl ? (
            <Avatar className="h-24 w-24">
              <AvatarImage src={member.avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold font-heading">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-semibold text-xl tracking-wide">
              {getInitials(fullName)}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="mb-2">
          <Badge variant="primary" size="sm">
            {member.membershipStatus || 'Active Member'}
          </Badge>
        </div>

        {/* Full Name */}
        <h2 className="font-heading text-lg font-bold text-foreground">
          {fullName}
        </h2>

        {/* Edit Profile Action */}
        <Button
          type="button"
          size="sm"
          onClick={onEditClick}
          className="mt-3.5 w-full gap-2 font-medium"
        >
          <Edit className="h-4 w-4" aria-hidden="true" />
          <span>Edit Profile</span>
        </Button>
      </div>

      {/* Contact Information Section Divider */}
      <div className="mt-6 mb-3 pt-6 border-t border-border">
        <h3 className="font-heading text-sm font-semibold text-foreground">
          Contact Information
        </h3>
      </div>

      {/* Contact Details List */}
      <div className="space-y-3 text-sm text-muted-foreground">
        {member.email && (
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span className="truncate text-foreground font-medium">{member.email}</span>
          </div>
        )}

        {member.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span className="text-foreground font-medium">{member.phone}</span>
          </div>
        )}

        {member.alternatePhone && (
          <div className="flex items-center gap-3">
            <Smartphone className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span className="text-foreground font-medium">{member.alternatePhone}</span>
          </div>
        )}

        <div className="pt-2 space-y-3 border-t border-border/50">
          {member.dateOfBirth && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span>{calculateAge(member.dateOfBirth)}</span>
            </div>
          )}

          {member.gender && (
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span>{member.gender}</span>
            </div>
          )}

          {member.campus && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span>{member.campus}</span>
            </div>
          )}

          {member.address?.city && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span>{member.address.city}, {member.address.country || 'Ghana'}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
