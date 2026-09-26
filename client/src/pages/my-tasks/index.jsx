import { useContext, useEffect, useState } from 'react';
import { TaskManagerContext } from '@/context';
import { getTasksAssignedToUserApi, updateTaskStatusApi, getAllProjectsApi, daleteTaskApi } from '@/services';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClipboardList, Filter, CheckCircle2, Clock, AlertTriangle,
  Circle, Flag, Briefcase, ChevronDown,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { id: 'todo',       label: 'To Do',      color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'inProgress', label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'blocked',    label: 'Blocked',     color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { id: 'review',     label: 'Review',      color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'done',       label: 'Done',        color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
];

const PRIORITY_COLOR = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-emerald-100 text-emerald-700',
};

function MyTasksPage() {
  const { user, projectList, setProjectList } = useContext(TaskManagerContext);

  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [alertMsg, setAlertMsg]     = useState('');

  // Fetch projects for filter dropdown + task project labels
  useEffect(() => {
    if (user?._id && projectList.length === 0) {
      getAllProjectsApi(user._id).then((res) => {
        if (res?.success) setProjectList(res.projectsList || []);
      });
    }
  }, [user]);

  const fetchMyTasks = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await getTasksAssignedToUserApi(
        user._id,
        projectFilter !== 'all' ? projectFilter : null
      );
      if (res?.success) setTasks(res.tasksList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyTasks(); }, [user, projectFilter]);

  // ── Status change ─────────────────────────────────────────────────────────
  const handleStatusChange = async (task, newStatus) => {
    if (!task.sprintId) {
      setAlertMsg(`"${task.title}" must be in an active sprint before you can change its status.`);
      setTimeout(() => setAlertMsg(''), 4000);
      return;
    }
    try {
      const res = await updateTaskStatusApi(task._id, newStatus);
      if (res?.success) {
        setTasks((prev) => prev.map((t) => (t._id === task._id ? res.task : t)));
      } else {
        setAlertMsg(res?.message || 'Failed to update status.');
        setTimeout(() => setAlertMsg(''), 4000);
      }
    } catch (err) { console.error(err); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter((t) =>
    statusFilter === 'all' ? true : t.status === statusFilter
  );

  const counts = {
    total:      tasks.length,
    todo:       tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'inProgress').length,
    done:       tasks.filter((t) => t.status === 'done').length,
  };

  const getProjectName = (projectId) =>
    projectList.find((p) => p._id === projectId)?.name || 'Unknown Project';

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-1">
          <ClipboardList className="w-6 h-6" /> My Tasks
        </h1>
        <p className="text-teal-100 text-sm">Tasks assigned to you across all projects.</p>
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold">{counts.total}</p>
            <p className="text-xs text-teal-200 mt-0.5">Total</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold">{counts.inProgress}</p>
            <p className="text-xs text-teal-200 mt-0.5">In Progress</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold">{counts.done}</p>
            <p className="text-xs text-teal-200 mt-0.5">Done</p>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alertMsg && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 text-amber-700 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {alertMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-500">Status:</span>
          {[{ id: 'all', label: 'All' }, ...STATUS_OPTIONS].map((opt) => (
            <button key={opt.id} onClick={() => setStatusFilter(opt.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === opt.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Project filter */}
        <div className="flex items-center gap-2 ml-auto">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}
            className="text-sm font-semibold text-indigo-700 outline-none cursor-pointer bg-transparent">
            <option value="all">All Projects</option>
            {projectList.map((p) => (<option key={p._id} value={p._id}>{p.name}</option>))}
          </select>
        </div>
      </div>

      {/* Task cards */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center gap-3">
          <ClipboardList className="w-12 h-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600">No tasks found</h3>
          <p className="text-sm text-gray-400">
            {tasks.length === 0 ? 'No tasks are assigned to you yet.' : 'No tasks match this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <MyTaskCard
              key={task._id}
              task={task}
              projectName={getProjectName(task.projectId)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Task card with inline status dropdown ─────────────────────────────────────
const MyTaskCard = ({ task, projectName, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const current = STATUS_OPTIONS.find((s) => s.id === task.status) || STATUS_OPTIONS[0];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-0 overflow-hidden">
      {/* Priority stripe */}
      <div className={`h-1 w-full ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Project tag */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md w-fit">
          <Briefcase className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-[180px]">{projectName}</span>
        </div>

        {/* Sprint indicator */}
        {task.sprintId ? (
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded w-fit">
            In Sprint
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">Not in a sprint yet</span>
        )}

        <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
        )}

        {/* Priority badge */}
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded w-fit ${PRIORITY_COLOR[task.priority] || 'bg-gray-100 text-gray-600'}`}>
          <Flag className="w-3 h-3" /> {task.priority || 'normal'}
        </span>
      </div>

      {/* Status selector footer */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
        <div className="relative">
          <button
            onClick={() => task.sprintId && setOpen((v) => !v)}
            title={!task.sprintId ? 'Add this task to a sprint first' : 'Change status'}
            className={`w-full flex items-center justify-between gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${current.color} ${
              task.sprintId ? 'cursor-pointer hover:opacity-80' : 'opacity-60 cursor-not-allowed'
            }`}
          >
            <span>{current.label}</span>
            {task.sprintId && <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {open && task.sprintId && (
            <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              {STATUS_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => { onStatusChange(task, opt.id); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 ${opt.id === task.status ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}>
                  {opt.id === task.status && <CheckCircle2 className="w-3 h-3 text-indigo-600" />}
                  <span className={opt.id !== task.status ? 'pl-5' : ''}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasksPage;
