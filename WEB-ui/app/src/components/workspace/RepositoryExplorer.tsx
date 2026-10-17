import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Filter, 
  X
} from 'lucide-react';
import { useInvestigationStore } from '../../store/useInvestigationStore';
import { FileCategory, FileNodeItem } from '../../types';
import { CategoryBadge } from '../common/CategoryBadge';

interface FileTreeItemProps {
  item: FileNodeItem;
  level?: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { selectedFilePath, selectFile, selectedCategory, searchQuery } = useInvestigationStore();

  const isFolder = item.type === 'folder';
  const isSelected = selectedFilePath === item.path;

  if (selectedCategory !== 'all' && !isFolder && item.category !== selectedCategory) {
    return null;
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    const matchesSelf = item.name.toLowerCase().includes(query) || item.path.toLowerCase().includes(query);
    const hasMatchingChildren = isFolder && item.children?.some(child => 
      child.name.toLowerCase().includes(query) || child.path.toLowerCase().includes(query) ||
      (child.type === 'folder' && child.children?.some(c => c.name.toLowerCase().includes(query)))
    );
    if (!matchesSelf && !hasMatchingChildren) {
      return null;
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      selectFile(item.path);
    }
  };

  return (
    <div className="select-none">
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={isFolder ? isOpen : undefined}
        aria-label={isFolder ? `Folder ${item.name}` : `Inspect file ${item.name}`}
        style={{ paddingLeft: `${Math.max(8, level * 14)}px` }}
        className={`w-full group flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer transition-colors text-xs font-mono text-left ${
          isSelected
            ? 'bg-[#7695FF]/15 text-[var(--color-blue)] font-semibold ring-1 ring-[#7695FF]/30'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {isFolder ? (
            <span className="text-[var(--text-muted)] w-3.5 h-3.5 flex items-center justify-center shrink-0">
              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </span>
          ) : (
            <span className="w-3.5 shrink-0" />
          )}

          {isFolder ? (
            isOpen ? (
              <FolderOpen className="w-3.5 h-3.5 text-[var(--color-gold)] shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-[var(--color-gold)] shrink-0" />
            )
          ) : (
            <FileCode className="w-3.5 h-3.5 text-[var(--color-blue)] shrink-0" />
          )}

          <span className="truncate">{item.name}</span>
        </div>

        {!isFolder && item.category && (
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            {item.lines && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">
                {item.lines}L
              </span>
            )}
            <CategoryBadge category={item.category} dotOnly />
          </div>
        )}
      </button>

      {isFolder && isOpen && item.children && (
        <div className="flex flex-col">
          {item.children.map((child) => (
            <FileTreeItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const RepositoryExplorer: React.FC = () => {
  const { 
    fileTree, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    isLeftPanelOpen,
    toggleLeftPanel
  } = useInvestigationStore();

  const [showFilterBar, setShowFilterBar] = useState(false);

  const categories: Array<FileCategory | 'all'> = [
    'all',
    'entry',
    'route',
    'model',
    'component',
    'utility',
    'config',
  ];

  if (!isLeftPanelOpen) {
    return (
      <div 
        className="w-11 h-full border-r flex flex-col items-center py-3 select-none transition-colors shrink-0"
        style={{
          backgroundColor: 'var(--panel-primary)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <button
          type="button"
          onClick={toggleLeftPanel}
          aria-label="Expand Repository Explorer"
          title="Expand Repository Explorer"
          className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <Folder className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Repository Explorer"
      className="w-full md:w-64 h-full border-r flex flex-col select-none transition-colors shrink-0"
      style={{
        backgroundColor: 'var(--panel-primary)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="h-12 border-b flex items-center justify-between px-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-[var(--color-blue)]" />
          <span className="text-xs font-semibold tracking-wide font-display text-[var(--text-primary)]">
            Repository Explorer
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowFilterBar(!showFilterBar)}
            aria-label="Toggle category filters"
            title="Toggle category filters"
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              showFilterBar || selectedCategory !== 'all'
                ? 'bg-[#7695FF]/15 text-[var(--color-blue)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleLeftPanel}
            aria-label="Collapse Repository Explorer"
            title="Collapse Repository Explorer"
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            aria-label="Search files by path"
            placeholder="Search files by path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-md text-xs bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--color-blue)] font-mono transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear file search"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Interactive Filter Controls */}
        {showFilterBar && (
          <div className="flex items-center flex-wrap gap-1 mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[var(--color-blue)] text-white font-medium'
                    : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {fileTree.length === 0 ? (
          <div className="p-4 text-center text-xs text-[var(--text-muted)]">
            No files match the active filter.
          </div>
        ) : (
          fileTree.map((item) => <FileTreeItem key={item.id} item={item} />)
        )}
      </div>
    </aside>
  );
};
