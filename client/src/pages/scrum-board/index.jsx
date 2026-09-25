import { useContext, useEffect, useState } from 'react';
import { TaskManagerContext } from '@/context';
import {
  getAllProjectsApi,
  getAllTaskApi,
  updateTaskApi,
  daleteTaskApi,
} from '@/services';
import { scrumBoardOptions } from '@/config';
import AddNewTask from '@/components/tasks/add-new-task';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Kanban,
  Filter,
  Plus,
  Briefcase,
  Flag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Edit3,
} from 'lucide-react';

const columnStyles = {
  todo: 'border-t-4 border-t-slate-400 bg-slate-50/70',
  inProgress: 'border-t-4 border-t-blue-500 bg-blue-50/40',
  blocked: 'border-t-4 border-t-rose-500 bg-rose-50/40',
  review: 'border-t-4 border-t-purple-500 bg-purple-50/40',
  done: 'border-t-4 border-t-emerald-500 bg-emerald-50/40',
};

const getPriorityClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    case 'low':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

function ScrumBoardPage() {
  const [showDialog, setShowDialog] = useState(false);

  const {
    taskList,
    setTaskList,
    projectList,
    setProjectList,
    loading,
    setLoading,
    user,
    taskFormData,
    currentEditedId,
    setCurrentEditedId,
    selectedProjectId,
    setSelectedProjectId,
  } = useContext(TaskManagerContext);

  const fetchProjects = async () => {
    if (!user?._id) return;
    try {
      const res = await getAllProjectsApi(user._id);
      if (res?.success) {
        setProjectList(res.projectsList || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await getAllTaskApi(
        user._id,
        selectedProjectId !== 'all' ? selectedProjectId : null
      );
      if (res?.success) {
        setTaskList(res.tasksList || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchProjects();
      fetchTasks();
    }
  }, [user, selectedProjectId]);

  const handleStatusChange = async (taskItem, newStatus) => {
    setLoading(true);
    try {
      const res = await updateTaskApi({
        ...taskItem,
        status: newStatus,
        userId: user?._id,
      });
      if (res?.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await daleteTaskApi(taskId);
      if (res?.success) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTask = (taskItem) => {
    setCurrentEditedId(taskItem._id);
    taskFormData.setValue('title', taskItem.title || '');
    taskFormData.setValue('description', taskItem.description || '');
    taskFormData.setValue('status', taskItem.status || 'todo');
    taskFormData.setValue('priority', taskItem.priority || 'medium');
    taskFormData.setValue('projectId', taskItem.projectId || '');
    setShowDialog(true);
  };

  const handleTaskSubmit = async (getData) => {
    setLoading(true);
    try {
      const payload = {
        ...getData,
        userId: user?._id,
      };

      const res = currentEditedId
        ? await updateTaskApi({ ...payload, _id: currentEditedId })
        : await updateTaskApi(payload);

      if (res?.success) {
        fetchTasks();
        taskFormData.reset();
        setCurrentEditedId(null);
        setShowDialog(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && taskList.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header & Project Filter */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Kanban className="w-6 h-6 text-indigo-600" />
            Project Scrum Board
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Drag workflow progression by moving tasks across To Do, In Progress, Blocked, Review & Done.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-sm">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer"
            >
              <option value="all">All Projects</option>
              {projectList.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {scrumBoardOptions.map((column) => {
          const colTasks = taskList.filter((task) => task.status === column.id);

          return (
            <div
              key={column.id}
              className={`rounded-xl p-3 border border-gray-200 flex flex-col min-h-[500px] ${
                columnStyles[column.id] || 'bg-gray-50'
              }`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-200/60 mb-3">
                <h3 className="font-bold text-gray-800 text-sm">{column.label}</h3>
                <span className="bg-white text-gray-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-gray-200 shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => {
                  const taskProj = projectList.find(
                    (p) => p._id.toString() === task?.projectId?.toString()
                  );

                  return (
                    <div
                      key={task._id}
                      className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between gap-2.5 group"
                    >
                      {/* Project Tag & Title */}
                      <div className="space-y-1.5">
                        {taskProj && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 max-w-full">
                            <Briefcase className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate">{taskProj.name}</span>
                          </div>
                        )}
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-2">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Footer Badge & Move Actions */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${getPriorityClass(
                            task.priority
                          )}`}
                        >
                          <Flag className="w-2.5 h-2.5" />
                          {task.priority || 'Normal'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1 text-gray-400 hover:text-emerald-600 rounded transition"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Status Quick Switch Buttons */}
                      <div className="flex gap-1 pt-1 justify-between">
                        {scrumBoardOptions.map((opt) => (
                          <button
                            key={opt.id}
                            disabled={opt.id === task.status}
                            onClick={() => handleStatusChange(task, opt.id)}
                            className={`flex-1 text-[9px] py-1 rounded font-semibold transition ${
                              opt.id === task.status
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                          >
                            {opt.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-400 font-medium">
                    No tasks in {column.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddNewTask
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        handleSubmit={handleTaskSubmit}
        taskFormData={taskFormData}
        currentEditedId={currentEditedId}
        setCurrentEditedId={setCurrentEditedId}
        projectList={projectList}
      />
    </div>
  );
}

export default ScrumBoardPage;
