import Layout from '@/components/Layout';
import TermsContent from './TermsContent';

export const metadata = {
  title: 'Terms and Conditions – Eco-Business',
  description:
    'Read the Terms and Conditions governing the use of Eco-Business services and website.',
};

export default function TermsPage() {
  return (
    <Layout>
      <TermsContent />
    </Layout>
  );
}
