import { Briefcase, ListTodo, Kanban, LogOut, User as UserIcon } from 'lucide-react';
import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { callLogoutUserApi } from '@/services';
import { TaskManagerContext } from '@/context';

const Header = () => {
  const { user, setUser } = useContext(TaskManagerContext);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    const response = await callLogoutUserApi();
    if (response?.success) {
      setUser(null);
      navigate("/auth");
    }
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b border-gray-200 bg-white shadow-xs sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Branding */}
          <Link to="/projects" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Project Hub
              </h1>
              <p className="text-[10px] text-gray-500 font-medium leading-none">Project & Task Manager</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/projects"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                isActive('/projects')
                  ? 'bg-blue-50 text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Projects</span>
            </Link>

            <Link
              to="/tasks/list"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                isActive('/tasks/list')
                  ? 'bg-blue-50 text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Tasks</span>
            </Link>

            <Link
              to="/tasks/scrum-board"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                isActive('/tasks/scrum-board')
                  ? 'bg-blue-50 text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Scrum Board</span>
            </Link>
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <span className="text-sm font-semibold text-gray-700 hidden md:inline">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
