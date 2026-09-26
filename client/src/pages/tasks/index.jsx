import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskManagerContext } from '@/context';
import {
  daleteTaskApi,
  getAllProjectsApi,
  getAllTaskApi,
} from '@/services';
import { Skeleton } from '@/components/ui/skeleton';
import TaskItem from '@/components/tasks/task-item';
import { Briefcase, Filter, ListTodo, BookOpen, ArrowRight } from 'lucide-react';

function TasksPage() {
  const navigate = useNavigate();

  const {
    taskList,
    setTaskList,
    projectList,
    setProjectList,
    loading,
    setLoading,
    user,
    selectedProjectId,
    setSelectedProjectId,
  } = useContext(TaskManagerContext);

  const fetchListOfProjects = async () => {
    if (!user?._id) return;
    try {
      const result = await getAllProjectsApi(user._id);
      if (result?.success) setProjectList(result.projectsList || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchListOfTasks = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const result = await getAllTaskApi(
        user._id,
        selectedProjectId !== 'all' ? selectedProjectId : null
      );
      if (result?.success) setTaskList(result.tasksList || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const result = await daleteTaskApi(taskId);
      if (result?.success) fetchListOfTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchListOfProjects();
      fetchListOfTasks();
    }
  }, [user, selectedProjectId]);

  const activeProject = projectList.find((p) => p._id === selectedProjectId);

  if (loading && taskList.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="w-full h-16 rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-blue-600" />
            Task Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {activeProject
              ? `Showing tasks for project: "${activeProject.name}"`
              : 'Showing all tasks across all projects'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Project Filter */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-sm">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600">Filter Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-blue-700 outline-none cursor-pointer"
            >
              <option value="all">All Projects</option>
              {projectList.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Link to project backlog for task creation */}
          {selectedProjectId && selectedProjectId !== 'all' ? (
            <button
              onClick={() => navigate(`/projects/${selectedProjectId}`)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Open Backlog to Add Tasks
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 text-gray-500 font-semibold px-4 py-2.5 rounded-xl text-xs">
              <BookOpen className="w-4 h-4" />
              Select a project to add tasks via its backlog
            </div>
          )}
        </div>
      </div>

      {/* Info banner — tasks are story-scoped */}
      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl px-4 py-3 text-sm">
        <BookOpen className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Tasks must be created inside a <strong>story</strong> on the project backlog.
          Open a project's backlog and click the <strong>+</strong> icon on any story to add tasks.
        </span>
      </div>

      {/* Task List Grid — read-only; edit/delete only */}
      <div className="mt-2 flex flex-col">
        {taskList.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {taskList.map((taskItem) => (
              <TaskItem
                key={taskItem._id}
                item={taskItem}
                // No edit handler — editing happens from the project backlog
                setShowDialog={() => {}}
                taskFormData={null}
                setCurrentEditedId={() => {}}
                handleDelete={handleDelete}
                projectList={projectList}
                readOnly
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center gap-3">
            <Briefcase className="w-12 h-12 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">No Tasks Found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {selectedProjectId !== 'all'
                ? 'No tasks in this project yet. Go to the project backlog to create stories and tasks.'
                : 'No tasks yet. Open a project and create stories to start adding tasks.'}
            </p>
            {selectedProjectId && selectedProjectId !== 'all' && (
              <button
                onClick={() => navigate(`/projects/${selectedProjectId}`)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm mt-1"
              >
                <BookOpen className="w-4 h-4" /> Go to Project Backlog
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TasksPage;
