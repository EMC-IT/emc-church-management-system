'use client';

import { useState } from 'react';
import { FamilyHeader } from './family-header';
import { FamilyStats } from './family-stats';
import { FamilyTable } from './family-table';
import { AddFamilyDialog } from './add-family-dialog';
import { EditFamilyDialog } from './edit-family-dialog';
import { FamilyEmptyState } from './family-empty-state';
import { MemberFamilyUnit, MemberFamilyMember } from '@/lib/types/member';

export interface FamilyViewProps {
  initialFamily: MemberFamilyUnit;
  currentMemberId?: string;
}

export function FamilyView({ initialFamily, currentMemberId = 'member-001' }: FamilyViewProps) {
  const [family, setFamily] = useState<MemberFamilyUnit>(initialFamily);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberFamilyMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleMemberAdded = (newMember: MemberFamilyMember) => {
    setFamily((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));
  };

  const handleOpenEdit = (member: MemberFamilyMember) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  const handleMemberUpdated = (updatedMember: MemberFamilyMember) => {
    setFamily((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === updatedMember.id ? updatedMember : m
      ),
    }));
  };

  const hasMembers = family.members && family.members.length > 0;

  return (
    <div className="space-y-6">
      {/* 1. Household Overview Header (Single, non-redundant primary add button) */}
      <FamilyHeader
        family={family}
        onAddMemberClick={() => setIsAddDialogOpen(true)}
      />

      {/* 2. Family Summary Stat Cards */}
      {hasMembers && <FamilyStats members={family.members} />}

      {/* 3. Family Members Table with Edit action */}
      {hasMembers ? (
        <FamilyTable
          members={family.members}
          onEditMember={handleOpenEdit}
          currentMemberId={currentMemberId}
        />
      ) : (
        <FamilyEmptyState onAddMemberClick={() => setIsAddDialogOpen(true)} />
      )}

      {/* 4. Add Family Member Modal Dialog */}
      <AddFamilyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onMemberAdded={handleMemberAdded}
      />

      {/* 5. Edit Family Member Modal Dialog */}
      <EditFamilyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        member={editingMember}
        onMemberUpdated={handleMemberUpdated}
      />
    </div>
  );
}
