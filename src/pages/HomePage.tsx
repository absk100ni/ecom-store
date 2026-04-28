import HeroBanner from '../components/home/HeroBanner';
import CategoryGrid from '../components/home/CategoryGrid';
import PromoBanners from '../components/home/PromoBanners';
import FeaturedProducts from '../components/home/FeaturedProducts';
import DealOfTheDay from '../components/home/DealOfTheDay';
import TrustBadges from '../components/home/TrustBadges';

export default function HomePage() {
  return (
    <div>
      <HeroBanner />
      <CategoryGrid />
      <PromoBanners />
      <FeaturedProducts />
      <DealOfTheDay />
      <TrustBadges />
    </div>
  );
}
