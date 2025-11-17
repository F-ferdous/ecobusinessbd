import Layout from '@/components/Layout';
import PrivacyContent from './PrivacyContent';

export const metadata = {
  title: 'Privacy Policy – Eco-Business',
  description:
    'Learn how Eco-Business collects, uses, and protects your personal information when you use our services and website.',
};

export default function PrivacyPage() {
  return (
    <Layout>
      <PrivacyContent />
    </Layout>
  );
}
