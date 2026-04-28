import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, ShoppingBag, Tag, Sparkles } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Premium Products, Best Prices',
    subtitle: 'New Collection Available',
    description: 'Discover our latest arrivals with guaranteed quality and unbeatable prices. Shop with confidence!',
    cta: 'Shop Now',
    link: '/products',
    bg: '#0369a1',
    icon: ShoppingBag,
  },
  {
    id: 2,
    title: 'Exclusive Deals & Offers',
    subtitle: 'Up to 40% OFF',
    description: "Don't miss out on our limited-time offers. Grab the best deals before they're gone!",
    cta: 'View Deals',
    link: '/products',
    bg: '#7c3aed',
    icon: Tag,
  },
  {
    id: 3,
    title: 'Quality You Can Trust',
    subtitle: 'Genuine & Authentic',
    description: '100% genuine products with manufacturer warranty. Free shipping on orders above ₹999.',
    cta: 'Explore',
    link: '/products',
    bg: '#ea580c',
    icon: Sparkles,
  },
  {
    id: 4,
    title: 'Fast & Reliable Delivery',
    subtitle: 'Free Shipping Above ₹999',
    description: 'Order today, get it delivered fast. Hassle-free returns and dedicated customer support.',
    cta: 'Start Shopping',
    link: '/products',
    bg: '#0d9488',
    icon: Zap,
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (idx: number) => {
    if (idx === current) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsTransitioning(false);
    }, 300);
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  const slide = slides[current];
  const SlideIcon = slide.icon;

  return (
    <div className="relative overflow-hidden">
      <div
        className="transition-all duration-700 ease-out"
        style={{ backgroundColor: slide.bg }}
      >
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 tracking-wide">
                🔥 {slide.subtitle}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                {slide.title}
              </h1>
              <p className="text-white/80 text-sm md:text-base mb-6 max-w-md leading-relaxed">
                {slide.description}
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to={slide.link}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                >
                  {slide.cta} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/25 transition-all border border-white/20"
                >
                  View All
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className={`hidden lg:flex items-center justify-center transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="relative">
                <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <SlideIcon className="w-32 h-32 text-white/80" strokeWidth={1} />
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full animate-float" />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hidden md:flex"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hidden md:flex"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
}
