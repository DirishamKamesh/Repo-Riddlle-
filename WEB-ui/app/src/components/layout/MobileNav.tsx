import { FolderTree, Network, Target, Code2 } from 'lucide-react';
import { useUIStore } from '../../store/ui-store';

export function MobileNav() {
  const { activeMobileTab, setActiveMobileTab } = useUIStore();

  const tabs = [
    { id: 'files' as const, label: 'Files', icon: FolderTree },
    { id: 'graph' as const, label: 'Graph', icon: Network },
    { id: 'mission' as const, label: 'Mission', icon: Target },
    { id: 'source' as const, label: 'Source', icon: Code2 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-primary/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 py-1.5 shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeMobileTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveMobileTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-accent-blue bg-accent-blue/10'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
