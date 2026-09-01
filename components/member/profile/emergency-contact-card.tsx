import { Card } from '@/components/ui/card';
import { MemberProfile } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface EmergencyContactCardProps {
  member: MemberProfile;
  className?: string;
}

export function EmergencyContactCard({ member, className }: EmergencyContactCardProps) {
  const contact = member.emergencyContact;

  return (
    <Card className={cn('p-5', className)}>
      <h3 className="font-heading text-base font-semibold mb-4 text-foreground">
        Emergency Contact
      </h3>

      {contact ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3 text-sm">
          <div className="flex">
            <span className="w-24 text-muted-foreground shrink-0">Name:</span>
            <span className="font-medium text-foreground">{contact.name}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-muted-foreground shrink-0">Relationship:</span>
            <span className="font-medium text-foreground">{contact.relationship}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-muted-foreground shrink-0">Phone:</span>
            <span className="font-medium text-foreground">{contact.phone}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No emergency contact details provided.
        </p>
      )}
    </Card>
  );
}
