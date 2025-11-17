import Layout from '@/components/Layout';
import UKPurchaseClient from '@/components/purchase/UKPurchaseClient';
import { Suspense } from 'react';

export default function UKPurchasePage() {
  return (
    <Layout>
      <Suspense fallback={<div className="py-10 text-center">Loading...</div>}>
        <UKPurchaseClient />
      </Suspense>
    </Layout>
  );
}
