import { useInvestigationStore } from '../../store/investigation-store';
import { useUIStore } from '../../store/ui-store';
import { FileTreeNode } from './FileTreeNode';
import { FileSearch } from './FileSearch';
import { CategoryChips } from './CategoryChips';
import { FolderTree, RefreshCw } from 'lucide-react';

export function FileExplorer() {
  const {
    fileTree,
    selectedFilePath,
    selectFile,
    filterCategory,
    setCategoryFilter,
    searchFilter,
    setSearchFilter,
    repository,
  } = useInvestigationStore();

  const { setInspectorTab } = useUIStore();

  const handleSelectFile = (path: string) => {
    selectFile(path);
    setInspectorTab('file');
  };

  return (
    <div className="h-full flex flex-col bg-surface-primary border-r border-border overflow-hidden select-none">
      {/* Explorer header */}
      <div className="px-3.5 py-2.5 border-b border-border bg-surface-elevated/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-accent-blue" />
          <span className="font-semibold text-text-primary text-body-xs font-mono uppercase tracking-wider">
            Explorer
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          {repository?.fullName || 'Repo'}
        </span>
      </div>

      {/* Search and filters */}
      <FileSearch value={searchFilter} onChange={setSearchFilter} />
      <CategoryChips
        selectedCategory={filterCategory}
        onSelectCategory={setCategoryFilter}
      />

      {/* Tree scrollable area */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {fileTree ? (
          <FileTreeNode
            node={fileTree}
            selectedFilePath={selectedFilePath}
            onSelectFile={handleSelectFile}
            filterCategory={filterCategory}
            searchFilter={searchFilter}
          />
        ) : (
          <div className="p-4 text-center text-text-muted text-body-xs">
            No files available
          </div>
        )}
      </div>

      {/* Footer status */}
      <div className="px-3 py-1.5 border-t border-border bg-surface-elevated/40 text-[10px] font-mono text-text-muted flex items-center justify-between">
        <span>Files indexed: {repository?.fileCount ?? 0}</span>
        <span className="text-accent-emerald">Synced</span>
      </div>
    </div>
  );
}
