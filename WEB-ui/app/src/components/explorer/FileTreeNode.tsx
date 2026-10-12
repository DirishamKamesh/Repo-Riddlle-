import { useState } from 'react';
import { FileTreeNode as IFileTreeNode, FileCategory } from '../../types';
import { CATEGORY_COLORS } from '../../lib/category-colors';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
} from 'lucide-react';

interface FileTreeNodeProps {
  node: IFileTreeNode;
  depth?: number;
  selectedFilePath: string | null;
  onSelectFile: (filePath: string) => void;
  filterCategory: FileCategory | null;
  searchFilter: string;
}

export function FileTreeNode({
  node,
  depth = 0,
  selectedFilePath,
  onSelectFile,
  filterCategory,
  searchFilter,
}: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);

  const isSelected = selectedFilePath === node.path;

  // Filter checking
  const matchesSearch =
    !searchFilter ||
    node.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    node.path.toLowerCase().includes(searchFilter.toLowerCase());

  const matchesCategory =
    !filterCategory ||
    node.isDirectory ||
    node.category === filterCategory;

  if (!node.isDirectory && (!matchesSearch || !matchesCategory)) {
    return null;
  }

  // File icon selection
  const getFileIcon = () => {
    if (node.path.endsWith('.json')) {
      return <FileJson className="w-3.5 h-3.5 text-accent-amber" />;
    }
    if (node.path.endsWith('.md')) {
      return <FileText className="w-3.5 h-3.5 text-text-muted" />;
    }
    return <FileCode className="w-3.5 h-3.5 text-accent-blue" />;
  };

  const categoryDef = node.category ? CATEGORY_COLORS[node.category] : null;

  if (node.isDirectory) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-1.5 px-2 py-1 text-left hover:bg-surface-elevated/70 text-text-secondary hover:text-text-primary transition-colors text-body-xs font-mono select-none"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
          )}
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-accent-amber/80 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-accent-amber/60 shrink-0" />
          )}
          <span className="truncate font-medium">{node.name}</span>
        </button>

        {isOpen && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedFilePath={selectedFilePath}
                onSelectFile={onSelectFile}
                filterCategory={filterCategory}
                searchFilter={searchFilter}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelectFile(node.path)}
      className={`w-full flex items-center justify-between px-2 py-1 text-left text-body-xs font-mono transition-colors group select-none ${
        isSelected
          ? 'bg-accent-blue/15 text-accent-blue font-semibold border-l-2 border-accent-blue'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated/60'
      }`}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      <div className="flex items-center gap-2 truncate">
        {getFileIcon()}
        <span className="truncate">{node.name}</span>
      </div>

      {categoryDef && node.category && (
        <span
          className="shrink-0 text-[9px] font-mono px-1.5 py-0.2 rounded border ml-1 opacity-80 group-hover:opacity-100"
          style={{
            color: categoryDef.solid,
            borderColor: `${categoryDef.solid}40`,
            backgroundColor: `${categoryDef.solid}15`,
          }}
        >
          {node.category.replace('_', ' ')}
        </span>
      )}
    </button>
  );
}
