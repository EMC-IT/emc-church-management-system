export interface MemberAnnouncementAction {
  label: string;
  href: string;
}

export interface MemberAnnouncement {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  category?: string;
  imageUrl?: string;
  isUrgent?: boolean;
  action?: MemberAnnouncementAction;
}
