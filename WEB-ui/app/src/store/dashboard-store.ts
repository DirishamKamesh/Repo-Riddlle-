import { create } from 'zustand';
import { DashboardRepo } from '../types';
import { DEMO_DASHBOARD_REPOS } from '../mock/repository';
import { realApi } from '../api';

interface DashboardState {
  repositories: DashboardRepo[];
  isLoading: boolean;
  filterQuery: string;

  loadDashboard: () => Promise<void>;
  setFilterQuery: (query: string) => void;
  removeRepository: (id: string) => void;
  addRepository: (repo: DashboardRepo) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  repositories: DEMO_DASHBOARD_REPOS,
  isLoading: false,
  filterQuery: '',

  loadDashboard: async () => {
    set({ isLoading: true });
    try {
      const realRepos = await realApi.getDashboardRepos();
      if (realRepos && realRepos.length > 0) {
        // Merge real repos with demo repos, avoiding duplicates
        const currentDemo = DEMO_DASHBOARD_REPOS;
        const realIds = new Set(realRepos.map((r) => r.repositoryId));
        const filteredDemo = currentDemo.filter((d) => !realIds.has(d.repositoryId));
        set({
          repositories: [...realRepos, ...filteredDemo],
          isLoading: false,
        });
        return;
      }
    } catch (err) {
      // Backend not yet reached or no sessions yet; retain demo repos
      console.info('Using local dashboard fixtures:', err);
    }
    set({ isLoading: false });
  },

  setFilterQuery: (query) => set({ filterQuery: query }),
  removeRepository: (id) =>
    set((state) => ({
      repositories: state.repositories.filter((r) => r.repositoryId !== id),
    })),
  addRepository: (repo) =>
    set((state) => ({
      repositories: [repo, ...state.repositories],
    })),
}));
