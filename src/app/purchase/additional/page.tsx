"use client";

import dynamic from "next/dynamic";
import Layout from "@/components/Layout";

const AdditionalServicePurchaseClient = dynamic(
  () => import("@/components/purchase/AdditionalServicePurchaseClient"),
  { ssr: false }
);

export default function AdditionalServicePurchasePage() {
  return (
    <Layout>
      <AdditionalServicePurchaseClient />
    </Layout>
  );
}
