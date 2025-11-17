import Layout from '@/components/Layout';
import RefundContent from './RefundContent';

export const metadata = {
  title: 'Refund Policy – Eco-Business',
  description:
    'Read Eco-Business refund policy for digital services, eligibility, process, and conditions.',
};

export default function RefundPage() {
  return (
    <Layout>
      <RefundContent />
    </Layout>
  );
}
