import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/analysis/:id" element={<AnalysisPage />} />
      <Route path="/investigation/:id" element={<InvestigationPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
