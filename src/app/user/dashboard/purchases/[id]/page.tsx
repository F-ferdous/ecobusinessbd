import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function PurchaseDetailRedirect({ params }: { params: { id: string } }) {
  const id = params?.id || '';
  redirect(`/user/dashboard/purchases?view=${encodeURIComponent(id)}`);
}
