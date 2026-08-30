import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Zap, LogOut, Package } from 'lucide-react';
import { useStore } from '../../store/useStore';
import * as api from '../../services/api';
import SearchAutocomplete from '../ui/SearchAutocomplete';
import CategoryTreeDropdown from '../ui/CategoryTreeDropdown';
import CategoryAccordion from '../ui/CategoryAccordion';

export default function Header() {
  const { isAuth, user, logout } = useStore();
  const cartBadge = useStore((s) => s.isAuth ? s.cartCount : s.guestCartCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch flat categories for fallback
  useEffect(() => {
    api.getCategories()
      .then((r) => setCategories(r.data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <header className={`bg-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-xl text-gray-900 tracking-tight">Lucubra</span>
                <span className="font-extrabold text-xl text-primary-600 tracking-tight">Elec</span>
              </div>
            </Link>

            {/* Desktop Search Bar with Autocomplete */}
            <SearchAutocomplete
              className="hidden lg:flex flex-1 max-w-xl"
              onClose={() => {}}
            />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                Home
              </Link>
              <Link to="/products" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/products' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                Products
              </Link>
              <CategoryTreeDropdown flatCategories={categories} />
              {isAuth && (
                <Link to="/orders" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/orders' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  Orders
                </Link>
              )}
              {!isAuth && (
                <Link to="/track" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/track' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  Track Order
                </Link>
              )}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-1">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartBadge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce-gentle">
                    {cartBadge}
                  </span>
                )}
              </Link>

              {/* User / Auth */}
              {isAuth ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.phone?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-52 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.phone}</p>
                      </div>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700">
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-red-600 w-full"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden sm:inline-flex btn-primary !py-2 !px-5 text-sm">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Expand with Autocomplete */}
        {searchOpen && (
          <div className="lg:hidden border-t border-gray-100 px-4 py-3 bg-white">
            <SearchAutocomplete
              placeholder="Search products..."
              inputClassName="!bg-gray-50 !border-gray-100"
              onClose={() => setSearchOpen(false)}
            />
          </div>
        )}
      </header>

      {/* Mobile Slide Menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto animate-slide-in-left">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">LucubraElec</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4">
              <div className="space-y-1 mb-6">
                <Link to="/" className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Home</Link>
                <Link to="/products" className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">All Products</Link>
                {isAuth && <Link to="/orders" className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">My Orders</Link>}
                {!isAuth && <Link to="/track" className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Track Order</Link>}
              </div>

              {/* Mobile Category Accordion */}
              <div className="mb-6">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                <CategoryAccordion flatCategories={categories} onNavigate={() => setMenuOpen(false)} />
              </div>

              <div className="border-t border-gray-100 pt-4">
                {isAuth ? (
                  <button
                    onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 font-medium w-full rounded-xl hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                ) : (
                  <Link to="/login" className="block px-4 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-xl">
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
