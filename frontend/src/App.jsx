import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
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

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
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
    </BrowserRouter>
  );
}
