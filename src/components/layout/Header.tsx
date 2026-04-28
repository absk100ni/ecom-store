import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Zap, ChevronDown, LogOut, Package, Grid3X3 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import * as api from '../../services/api';

export default function Header() {
  const { isAuth, cartCount, user, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch categories from backend
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
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

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
                <span className="font-extrabold text-xl text-gray-900 tracking-tight">Electro</span>
                <span className="font-extrabold text-xl text-primary-600 tracking-tight">Mart</span>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, components, modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm
                    focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                Home
              </Link>
              <Link to="/products" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/products' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                Products
              </Link>
              {categories.length > 0 && (
                <div className="relative group">
                  <button className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-1">
                    Categories <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-72 max-h-[70vh] overflow-y-auto">
                      {categories.map((cat: any) => (
                        <Link
                          key={cat.slug || cat.name}
                          to={`/products?category=${encodeURIComponent(cat.name)}`}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                        >
                          <Grid3X3 className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm font-medium text-gray-700 truncate">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {isAuth && (
                <Link to="/orders" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/orders' ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  Orders
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
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce-gentle">
                    {cartCount}
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

        {/* Mobile Search Expand */}
        {searchOpen && (
          <div className="lg:hidden border-t border-gray-100 px-4 py-3 bg-white">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm
                  focus:border-primary-400 focus:bg-white outline-none transition-all"
              />
            </form>
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
                <span className="font-bold text-lg">ElectroMart</span>
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
              </div>

              {categories.length > 0 && (
                <div className="mb-6">
                  <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                  <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                    {categories.map((cat: any) => (
                      <Link
                        key={cat.slug || cat.name}
                        to={`/products?category=${encodeURIComponent(cat.name)}`}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                      >
                        <Grid3X3 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

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
