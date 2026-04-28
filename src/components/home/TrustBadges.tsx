import { Truck, Shield, CreditCard, Headphones, Award, RefreshCw } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free shipping on orders above ₹999',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure payment gateway',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '7-day hassle-free returns',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Award,
    title: 'Genuine Products',
    description: '100% authentic & brand warranty',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer care',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: CreditCard,
    title: 'EMI Available',
    description: 'No-cost EMI on select products',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

export default function TrustBadges() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h2 className="section-heading">Why Shop With Us?</h2>
        <p className="section-subheading mx-auto">Experience premium electronics shopping with confidence</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.title}
              className="group flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 ${badge.bg} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${badge.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{badge.title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{badge.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
