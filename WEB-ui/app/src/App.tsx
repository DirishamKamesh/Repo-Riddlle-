/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LaunchBay } from './pages/LaunchBay';
import { Dashboard } from './pages/Dashboard';
import { ScanningSequence } from './pages/ScanningSequence';
import { InvestigationWorkspace } from './pages/InvestigationWorkspace';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LaunchBay />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analysis/:id" element={<ScanningSequence />} />
        <Route path="/investigation/:id" element={<InvestigationWorkspace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
