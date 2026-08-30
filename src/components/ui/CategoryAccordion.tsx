import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Grid3X3 } from 'lucide-react';
import * as api from '../../services/api';

interface Category {
  id: string;
  name: string;
  slug?: string;
  children?: Category[];
}

interface Props {
  flatCategories: any[];
  onNavigate?: () => void;
}

function AccordionItem({ cat, level, onNavigate }: { cat: Category; level: number; onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = cat.children && cat.children.length > 0;

  return (
    <div>
      <div className="flex items-center" style={{ paddingLeft: `${level * 12}px` }}>
        <Link
          to={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
          onClick={onNavigate}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 truncate"
        >
          {level === 0 && <Grid3X3 className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
          <span className="truncate">{cat.name}</span>
        </Link>
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {cat.children!.map((child) => (
            <AccordionItem key={child.id || child.name} cat={child} level={level + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryAccordion({ flatCategories, onNavigate }: Props) {
  const [treeCategories, setTreeCategories] = useState<Category[]>([]);
  const [useTree, setUseTree] = useState(false);

  useEffect(() => {
    api.getCategoryTree()
      .then((r) => {
        const cats = r.data.categories || [];
        if (cats.length > 0) {
          setTreeCategories(cats);
          setUseTree(true);
        }
      })
      .catch(() => setUseTree(false));
  }, []);

  // Flat fallback
  if (!useTree) {
    return (
      <div className="space-y-1 max-h-[50vh] overflow-y-auto">
        {flatCategories.map((cat: any) => (
          <Link
            key={cat.slug || cat.name}
            to={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
            onClick={onNavigate}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            <Grid3X3 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{cat.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5 max-h-[50vh] overflow-y-auto">
      {treeCategories.map((cat) => (
        <AccordionItem key={cat.id || cat.name} cat={cat} level={0} onNavigate={onNavigate} />
      ))}
    </div>
  );
}
