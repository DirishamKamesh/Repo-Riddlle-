import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { RepoCard } from '../components/dashboard/RepoCard';
import { EmptyState } from '../components/dashboard/EmptyState';
import { useDashboardStore } from '../store/dashboard-store';

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    repositories,
    filterQuery,
    setFilterQuery,
    removeRepository,
    loadDashboard,
  } = useDashboardStore();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.repository.fullName
        .toLowerCase()
        .includes(filterQuery.toLowerCase()) ||
      repo.repository.description
        .toLowerCase()
        .includes(filterQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <DashboardHeader
          searchQuery={filterQuery}
          onSearchChange={setFilterQuery}
          onNewInvestigation={() => navigate('/')}
          totalRepos={repositories.length}
        />

        <div className="mt-8">
          {filteredRepos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRepos.map((item) => (
                <RepoCard
                  key={item.repositoryId}
                  item={item}
                  onDelete={removeRepository}
                />
              ))}
            </div>
          ) : (
            <EmptyState onNewInvestigation={() => navigate('/')} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
