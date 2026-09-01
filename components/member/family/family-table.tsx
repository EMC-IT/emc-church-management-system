import { Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MemberAvatar } from '@/components/member/shared';
import { MemberFamilyMember } from '@/lib/types/member';

export interface FamilyTableProps {
  members: MemberFamilyMember[];
  onEditMember: (member: MemberFamilyMember) => void;
  currentMemberId?: string;
  className?: string;
}

export function FamilyTable({
  members,
  onEditMember,
  currentMemberId = 'member-001',
  className,
}: FamilyTableProps) {
  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '—';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? '—' : `${age} yrs`;
  };

  return (
    <Card className={className}>
      <div className="p-4 sm:p-5 border-b border-border">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Family Members ({members.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[200px]">Member</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="min-w-[180px]">Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((fam) => {
              const fullName = `${fam.firstName} ${fam.lastName}`;
              const isCurrentUser =
                fam.memberId === currentMemberId || fam.relationship === 'Head';

              return (
                <TableRow key={fam.id}>
                  {/* Member Column */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <MemberAvatar
                        name={fullName}
                        avatarUrl={fam.avatarUrl}
                        size="sm"
                        className="h-9 w-9 border border-border/50"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground text-sm truncate">
                            {fullName}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1 font-bold">
                              You
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground block">
                          {fam.gender || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Relationship Column */}
                  <TableCell className="text-sm font-medium text-foreground">
                    {fam.relationship}
                  </TableCell>

                  {/* Age Column */}
                  <TableCell className="text-sm text-muted-foreground">
                    {calculateAge(fam.dateOfBirth)}
                  </TableCell>

                  {/* Contact Column */}
                  <TableCell className="text-sm text-muted-foreground">
                    {fam.phone && (
                      <div className="text-foreground font-medium">{fam.phone}</div>
                    )}
                    {fam.email && (
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {fam.email}
                      </div>
                    )}
                    {!fam.phone && !fam.email && <span>—</span>}
                  </TableCell>

                  {/* Status Column */}
                  <TableCell>
                    <StatusBadge
                      status={fam.isRegisteredMember ? 'Active' : 'Non-Member'}
                      size="sm"
                    />
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditMember(fam)}
                      className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
