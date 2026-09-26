import { Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth';
import CommonLayout from './components/common-layout';
import ProjectsPage from './pages/projects';
import TasksPage from './pages/tasks';
import ScrumBoardPage from './pages/scrum-board';
import SprintsPage from './pages/sprints';
import ProjectDetailPage from './pages/project-detail';
import MyTasksPage from './pages/my-tasks';
import SprintHistoryPage from './pages/sprint-history';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />

        <Route element={<CommonLayout />}>
          <Route path="/projects"                element={<ProjectsPage />} />
          <Route path="/projects/:projectId"     element={<ProjectDetailPage />} />
          <Route path="/tasks/list"              element={<TasksPage />} />
          <Route path="/tasks/scrum-board"       element={<ScrumBoardPage />} />
          <Route path="/sprints"                 element={<SprintsPage />} />
          <Route path="/sprint-history"          element={<SprintHistoryPage />} />
          <Route path="/my-tasks"                element={<MyTasksPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </div>
  );
}

export default App;
