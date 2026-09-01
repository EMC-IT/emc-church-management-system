'use client';

import { useState } from 'react';
import { ProfileHeaderCard } from './profile-header-card';
import { PersonalInfoCard } from './personal-info-card';
import { ChurchInfoCard } from './church-info-card';
import { EmergencyContactCard } from './emergency-contact-card';
import { EditProfileDialog } from './edit-profile-dialog';
import { MemberProfile } from '@/lib/types/member';

export interface ProfileViewProps {
  initialMember: MemberProfile;
}

export function ProfileView({ initialMember }: ProfileViewProps) {
  const [member, setMember] = useState<MemberProfile>(initialMember);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleProfileUpdated = (updated: MemberProfile) => {
    setMember(updated);
  };

  return (
    <div className="space-y-6">
      {/* Main Two-Column Layout matching Admin Portal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Member Overview & Contact Card */}
        <div className="lg:col-span-4 xl:col-span-4">
          <ProfileHeaderCard
            member={member}
            onEditClick={() => setIsEditDialogOpen(true)}
          />
        </div>

        {/* Right Column: Member Information Details */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Member Information
            </h2>
          </div>

          <PersonalInfoCard member={member} />
          <ChurchInfoCard member={member} />
          <EmergencyContactCard member={member} />
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        member={member}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
}
