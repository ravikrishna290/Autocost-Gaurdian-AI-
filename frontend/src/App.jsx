import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Anomalies from './pages/Anomalies';
import Actions from './pages/Actions';
import RawData from './pages/RawData';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import AiChat from './pages/AiChat';
import AgentPipeline from './pages/AgentPipeline';
import Forecast from './pages/Forecast';
import ExecutiveReport from './pages/ExecutiveReport';
import ScenarioSimulator from './pages/ScenarioSimulator';

import FeaturesPage from './pages/Features';
import ArchitecturePage from './pages/Architecture';
import ImpactPage from './pages/Impact';

function AppContent() {
  const location = useLocation();
  const landingRoutes = ['/', '/features', '/architecture', '/impact'];
  const isLanding = landingRoutes.includes(location.pathname);

  return (
    <div className={isLanding ? "" : "app-layout"}>
      {!isLanding && <Sidebar />}
      <main className={isLanding ? "" : "main-content"}>
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/features"  element={<FeaturesPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/impact"    element={<ImpactPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/anomalies" element={<Anomalies />} />
          <Route path="/actions"   element={<Actions />} />
          <Route path="/data"       element={<RawData />} />
          <Route path="/logs"       element={<Logs />} />
          <Route path="/settings"   element={<Settings />} />
          <Route path="/ai-chat"    element={<AiChat />} />
          <Route path="/pipeline"   element={<AgentPipeline />} />
          <Route path="/forecast"   element={<Forecast />} />
          <Route path="/report"     element={<ExecutiveReport />} />
          <Route path="/simulator"  element={<ScenarioSimulator />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
