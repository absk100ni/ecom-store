import { Helmet } from 'react-helmet-async';
import HeroBanner from '../components/home/HeroBanner';
import CategoryGrid from '../components/home/CategoryGrid';
import FeaturedProducts from '../components/home/FeaturedProducts';

export default function HomePage() {
  return (
    <div>
      <Helmet><title>LucubraElec - Hardware & Electronics Marketplace</title><meta name="description" content="Shop electrical supplies, electronic components, lighting and practical hardware with clear pricing and delivery information." /></Helmet>
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
    </div>
  );
}
