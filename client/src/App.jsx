import { Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth';
import CommonLayout from './components/common-layout';
import ProjectsPage from './pages/projects';
import TasksPage from './pages/tasks';
import ScrumBoardPage from './pages/scrum-board';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 font-sans">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<CommonLayout />}>
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks/list" element={<TasksPage />} />
          <Route path="/tasks/scrum-board" element={<ScrumBoardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </div>
  );
}

export default App;
