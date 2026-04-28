import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function MobileBottomNav() {
  const location = useLocation();
  const { cartCount, isAuth } = useStore();
  const path = location.pathname;

  const navItems = [
    { label: 'Home', icon: Home, to: '/', active: path === '/' },
    { label: 'Categories', icon: Grid3X3, to: '/products', active: path === '/products' },
    { label: 'Cart', icon: ShoppingCart, to: '/cart', active: path === '/cart', badge: cartCount },
    { label: 'Account', icon: User, to: isAuth ? '/orders' : '/login', active: path === '/orders' || path === '/login' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 py-1.5 pb-safe">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative
                ${item.active ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 ${item.active ? 'stroke-[2.5]' : ''}`} />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-medium ${item.active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {item.active && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-600 rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
