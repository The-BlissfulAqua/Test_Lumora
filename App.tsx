
import React, { Suspense, useState } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';

import { ANALYST_PATH, COMMAND_PATH, FIELD_AGENT_PATH } from './constants';

const CommandDashboard = React.lazy(() => import('./pages/CommandDashboard'));
const FieldAgentView = React.lazy(() => import('./pages/FieldAgentView'));
const AnalystView = React.lazy(() => import('./pages/AnalystView'));

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-cyan"></div>
  </div>
);

const DashboardLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen h-screen flex bg-command-blue overflow-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-grow p-6 overflow-auto">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<DashboardLayout />}>
          <Route path={COMMAND_PATH} element={<CommandDashboard />} />
          <Route path={FIELD_AGENT_PATH} element={<FieldAgentView />} />
          <Route path={ANALYST_PATH} element={<AnalystView />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
