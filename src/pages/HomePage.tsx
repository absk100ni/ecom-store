import { Helmet } from 'react-helmet-async';
import HeroBanner from '../components/home/HeroBanner';
import CategoryGrid from '../components/home/CategoryGrid';
import PromoBanners from '../components/home/PromoBanners';
import FeaturedProducts from '../components/home/FeaturedProducts';
import DealOfTheDay from '../components/home/DealOfTheDay';
import FollowUs from '../components/home/FollowUs';

export default function HomePage() {
  return (
    <div>
      <Helmet><title>LucubraElec - Your Electronics Store</title><meta name="description" content="Shop the latest electronics, smartphones, laptops, audio gear and more at LucubraElec" /></Helmet>
      <HeroBanner />
      <CategoryGrid />
      <PromoBanners />
      <FeaturedProducts />
      <DealOfTheDay />
      <FollowUs />
    </div>
  );
}
