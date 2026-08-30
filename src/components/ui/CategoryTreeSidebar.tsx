import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import * as api from '../../services/api';

interface Category {
  id: string;
  name: string;
  slug?: string;
  children?: Category[];
}

interface Props {
  selectedCategory: string;
  onSelectCategory: (name: string) => void;
  flatCategories: any[];
}

function TreeNode({ cat, level, selectedCategory, onSelectCategory, expandedSet, toggleExpand }: {
  cat: Category;
  level: number;
  selectedCategory: string;
  onSelectCategory: (name: string) => void;
  expandedSet: Set<string>;
  toggleExpand: (key: string) => void;
}) {
  const key = cat.id || cat.name;
  const hasChildren = cat.children && cat.children.length > 0;
  const isExpanded = expandedSet.has(key);
  const isSelected = selectedCategory === (cat.slug || cat.name);

  return (
    <div>
      <div className="flex items-center">
        {hasChildren && (
          <button
            onClick={() => toggleExpand(key)}
            className="p-0.5 mr-1 rounded hover:bg-gray-100 transition-colors shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        )}
        {!hasChildren && <span className="w-5 shrink-0" />}
        <button
          onClick={() => onSelectCategory(cat.slug || cat.name)}
          className={`flex-1 text-left px-2 py-1.5 rounded-lg text-sm transition-colors truncate ${
            isSelected ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${level * 8 + 8}px` }}
        >
          {cat.name}
        </button>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {cat.children!.map((child) => (
            <TreeNode
              key={child.id || child.name}
              cat={child}
              level={level + 1}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              expandedSet={expandedSet}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTreeSidebar({ selectedCategory, onSelectCategory, flatCategories }: Props) {
  const [treeCategories, setTreeCategories] = useState<Category[]>([]);
  const [useTree, setUseTree] = useState(false);
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.getCategoryTree()
      .then((r) => {
        const cats = r.data.categories || [];
        if (cats.length > 0) {
          setTreeCategories(cats);
          setUseTree(true);
          // Auto-expand level-1 categories
          setExpandedSet(new Set(cats.map((c: Category) => c.id || c.name)));
        }
      })
      .catch(() => setUseTree(false));
  }, []);

  const toggleExpand = (key: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Flat fallback
  if (!useTree) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => onSelectCategory('')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            !selectedCategory ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Products
        </button>
        {flatCategories.map((c: any) => (
          <button
            key={c.slug || c.name}
            onClick={() => onSelectCategory(c.name)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === c.name ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => onSelectCategory('')}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
          !selectedCategory ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        All Products
      </button>
      {treeCategories.map((cat) => (
        <TreeNode
          key={cat.id || cat.name}
          cat={cat}
          level={0}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          expandedSet={expandedSet}
          toggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
}
