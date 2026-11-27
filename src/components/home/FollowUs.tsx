import { ArrowUpRight, Facebook, Instagram, Youtube } from 'lucide-react';
import { SOCIAL_CHANNELS, SocialChannel } from '../../config/social';

const icons: Record<SocialChannel['name'], React.ElementType> = {
  Instagram,
  YouTube: Youtube,
  Facebook,
};

export default function FollowUs() {
  if (SOCIAL_CHANNELS.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="border border-slate-200 bg-white p-6 md:p-8">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-center">
          <div>
            <p className="eyebrow">Product guides and updates</p>
            <h2 className="section-heading">Find us on social</h2>
            <p className="section-subheading">Open a channel to view the content published there.</p>
          </div>
          <div className="grid sm:grid-cols-3 border-t sm:border-t-0 sm:border-l border-slate-200">
            {SOCIAL_CHANNELS.map((channel) => {
              const Icon = icons[channel.name];
              return (
                <a key={channel.name} href={channel.url} target="_blank" rel="noopener noreferrer" className="group p-5 border-b sm:border-b-0 sm:border-r border-slate-200 hover:bg-slate-50">
                  <div className="flex justify-between items-start"><Icon className="w-5 h-5 text-slate-700" /><ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" /></div>
                  <p className="font-semibold text-slate-950 mt-4">{channel.name}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{channel.handle}</p>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
