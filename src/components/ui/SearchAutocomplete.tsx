import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import * as api from '../../services/api';

interface Suggestion {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image?: string;
  category?: string;
}

interface Props {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  onClose?: () => void;
}

export default function SearchAutocomplete({ className = '', inputClassName = '', placeholder = 'Search products, components, modules...', onClose }: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestQueryRef = useRef('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback((q: string) => {
    latestQueryRef.current = q;
    setLoading(true);
    api.getSearchSuggestions(q)
      .then((r) => {
        if (latestQueryRef.current === q) {
          setSuggestions(r.data.suggestions || []);
          setOpen(true);
          setHighlightIdx(-1);
        }
      })
      .catch(() => {
        if (latestQueryRef.current === q) {
          setSuggestions([]);
          setOpen(true);
        }
      })
      .finally(() => {
        if (latestQueryRef.current === q) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query.trim()), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const goToProduct = (s: Suggestion) => {
    navigate(`/p/${s.slug || s.id}`);
    closeDropdown();
  };

  const goToSearch = () => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      closeDropdown();
    }
  };

  const closeDropdown = () => {
    setOpen(false);
    setQuery('');
    setSuggestions([]);
    setHighlightIdx(-1);
    onClose?.();
  };

  const totalItems = suggestions.length + (query.trim() ? 1 : 0); // +1 for "See all results"

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => (i + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => (i - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < suggestions.length) {
        goToProduct(suggestions[highlightIdx]);
      } else {
        goToSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlightIdx(-1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightIdx >= 0 && highlightIdx < suggestions.length) {
      goToProduct(suggestions[highlightIdx]);
    } else {
      goToSearch();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length > 0 && query.trim().length >= 2) setOpen(true); }}
          onKeyDown={handleKeyDown}
          className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm
            focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-500/10 outline-none transition-all ${inputClassName}`}
        />
      </form>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100] max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 shimmer rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 shimmer rounded w-3/4" />
                    <div className="h-3 shimmer rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">No products found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            <>
              {suggestions.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goToProduct(s)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    highlightIdx === i ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {s.image ? (
                    <img src={s.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-100 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center">
                      <Search className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      ₹{(s.price / 100).toLocaleString('en-IN')}
                      {s.category && <span className="ml-2 text-gray-400">in {s.category}</span>}
                    </p>
                  </div>
                </button>
              ))}
              {/* "See all results" footer */}
              <button
                onClick={goToSearch}
                className={`w-full px-4 py-3 text-left text-sm font-medium text-primary-600 border-t border-gray-100 transition-colors ${
                  highlightIdx === suggestions.length ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                See all results for "{query.trim()}"
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
