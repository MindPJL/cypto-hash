import { CryptoOverview } from '../../components/crypto/CryptoOverview';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crypto Chart',
  description: 'Cryptocurrency data visualization dashboard showing prices and historical trends',
};

export default function OverviewPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl pt-20">
      <CryptoOverview />
    </main>
  );
}
