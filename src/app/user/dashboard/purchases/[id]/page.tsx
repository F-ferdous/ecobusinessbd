import { redirect } from 'next/navigation';

export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export default async function PurchaseDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/user/dashboard/purchases?view=${encodeURIComponent(id || '')}`);
}
