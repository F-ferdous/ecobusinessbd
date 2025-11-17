import Layout from "@/components/Layout";
import USBasicPurchaseClient from "@/components/purchase/USBasicPurchaseClient";
import { Suspense } from "react";

export default function USBasicPurchasePage() {
  return (
    <Layout>
      <Suspense fallback={<div className="py-10 text-center">Loading...</div>}>
        <USBasicPurchaseClient />
      </Suspense>
    </Layout>
  );
}
