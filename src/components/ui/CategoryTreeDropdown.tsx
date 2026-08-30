import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Grid3X3 } from 'lucide-react';
import * as api from '../../services/api';

interface Category {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  level?: number;
  children?: Category[];
}

interface Props {
  /** Flat categories fallback if tree endpoint fails */
  flatCategories: any[];
}

export default function CategoryTreeDropdown({ flatCategories }: Props) {
  const [treeCategories, setTreeCategories] = useState<Category[]>([]);
  const [useTree, setUseTree] = useState(false);
  const [hoveredL1, setHoveredL1] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.getCategoryTree()
      .then((r) => {
        const cats = r.data.categories || [];
        if (cats.length > 0) {
          setTreeCategories(cats);
          setUseTree(true);
        }
      })
      .catch(() => {
        // Graceful fallback: use flat categories
        setUseTree(false);
      });
  }, []);

  const categories = useTree ? treeCategories : flatCategories;

  if (categories.length === 0) return null;

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredL1(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setHoveredL1(null), 150);
  };

  // Flat rendering (fallback)
  if (!useTree) {
    return (
      <div className="relative group">
        <button className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-1">
          Categories <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-72 max-h-[70vh] overflow-y-auto">
            {categories.map((cat: any) => (
              <Link
                key={cat.slug || cat.name}
                to={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <Grid3X3 className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm font-medium text-gray-700 truncate">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tree rendering with hover mega-menu
  const hoveredCategory = treeCategories.find((c) => (c.id || c.name) === hoveredL1);
  const hasSubcategories = hoveredCategory?.children && hoveredCategory.children.length > 0;

  return (
    <div className="relative group" onMouseLeave={handleMouseLeave}>
      <button className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-1">
        Categories <ChevronDown className="w-3.5 h-3.5" />
      </button>

      <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="flex bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Level 1 column */}
          <div className="w-56 py-2 border-r border-gray-100 max-h-[70vh] overflow-y-auto">
            {treeCategories.map((cat) => {
              const key = cat.id || cat.name;
              const isHovered = hoveredL1 === key;
              return (
                <div
                  key={key}
                  onMouseEnter={() => handleMouseEnter(key)}
                >
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      isHovered ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.children && cat.children.length > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Level 2+3 mega panel */}
          {hasSubcategories && hoveredCategory && (
            <div
              className="w-[28rem] py-4 px-5 max-h-[70vh] overflow-y-auto"
              onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {hoveredCategory.name}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {hoveredCategory.children!.map((l2) => (
                  <div key={l2.id || l2.name}>
                    <Link
                      to={`/products?category=${encodeURIComponent(l2.slug || l2.name)}`}
                      className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {l2.name}
                    </Link>
                    {l2.children && l2.children.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {l2.children.map((l3) => (
                          <li key={l3.id || l3.name}>
                            <Link
                              to={`/products?category=${encodeURIComponent(l3.slug || l3.name)}`}
                              className="text-xs text-gray-500 hover:text-primary-600 transition-colors"
                            >
                              {l3.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
