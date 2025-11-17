import Layout from '@/components/Layout';
import AboutContent from './AboutContent';

export const metadata = {
  title: 'About Us – Eco-Business',
  description:
    'Eco-Business is a trusted global platform for company formation, consultancy, and international compliance services.',
};

export default function About() {
  return (
    <Layout>
      <AboutContent />
    </Layout>
  );
}