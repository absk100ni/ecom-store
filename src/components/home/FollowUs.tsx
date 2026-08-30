import { Instagram, Youtube, Facebook } from 'lucide-react';
import { SOCIAL_CHANNELS, SocialChannel } from '../../config/social';

const ICONS: Record<SocialChannel['name'], React.ReactNode> = {
  Instagram: <Instagram className="w-7 h-7" />,
  YouTube: <Youtube className="w-7 h-7" />,
  Facebook: <Facebook className="w-7 h-7" />,
};

// Brand accent per channel (gradient for the icon tile)
const ACCENTS: Record<SocialChannel['name'], string> = {
  Instagram: 'from-pink-500 via-purple-500 to-orange-400',
  YouTube: 'from-red-600 to-red-500',
  Facebook: 'from-blue-600 to-blue-500',
};

export default function FollowUs() {
  if (SOCIAL_CHANNELS.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50" aria-labelledby="follow-us-heading">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 id="follow-us-heading" className="text-2xl md:text-3xl font-bold text-gray-900">
            Follow Us for Deals & Reviews
          </h2>
          <p className="text-gray-500 mt-2">
            New product drops, unboxings, and exclusive offers -- first on our channels
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {SOCIAL_CHANNELS.map((channel) => (
            <a
              key={channel.name}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow us on ${channel.name} (opens in new tab)`}
              className="group flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${ACCENTS[channel.name]} flex items-center justify-center text-white shrink-0`}
              >
                {ICONS[channel.name]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {channel.name}
                </p>
                <p className="text-sm text-gray-500 truncate">{channel.handle}</p>
                <p className="text-xs text-gray-400">{channel.cta}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
