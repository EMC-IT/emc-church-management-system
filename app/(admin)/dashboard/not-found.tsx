import { NotFoundView } from '@/components/errors';

export default function AdminNotFound() {
  return (
    <NotFoundView
      scope="admin"
      title="Admin Page Not Found"
      description="The administrative page, member record, or report you requested does not exist or has been archived."
    />
  );
}
