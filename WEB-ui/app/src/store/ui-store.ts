import { create } from 'zustand';

interface UIState {
  // Mobile / responsive panels
  activeMobileTab: 'files' | 'graph' | 'mission' | 'source';
  isSourceDrawerOpen: boolean;
  isLegendOpen: boolean;
  
  // Right panel tab in desktop
  inspectorTab: 'mission' | 'file';

  // Actions
  setActiveMobileTab: (tab: 'files' | 'graph' | 'mission' | 'source') => void;
  setSourceDrawerOpen: (open: boolean) => void;
  toggleSourceDrawer: () => void;
  setLegendOpen: (open: boolean) => void;
  setInspectorTab: (tab: 'mission' | 'file') => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeMobileTab: 'graph',
  isSourceDrawerOpen: false,
  isLegendOpen: false,
  inspectorTab: 'mission',

  setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),
  setSourceDrawerOpen: (open) => set({ isSourceDrawerOpen: open }),
  toggleSourceDrawer: () => set((state) => ({ isSourceDrawerOpen: !state.isSourceDrawerOpen })),
  setLegendOpen: (open) => set({ isLegendOpen: open }),
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
}));
