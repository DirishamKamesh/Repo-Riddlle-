import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Header } from '../components/common/Header';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-tactical-grid" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#7695FF]/15 text-[var(--color-blue)]">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
          Sector Not Found (404)
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-md">
          The requested coordinate does not correspond to an active repository scan or investigation route.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--color-blue)] hover:opacity-95 transition-opacity"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Launch Bay</span>
        </Link>
      </main>
    </div>
  );
};
