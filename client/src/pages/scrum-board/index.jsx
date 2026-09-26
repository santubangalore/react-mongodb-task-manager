import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskManagerContext } from '@/context';
import {
  getAllProjectsApi,
  getActiveSprintApi,
  getStoriesByProjectApi,
  updateTaskApi,
  daleteTaskApi,
} from '@/services';
import { scrumBoardOptions } from '@/config';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Kanban,
  Filter,
  Zap,
  BookOpen,
  Flag,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  ArrowRight,
  User,
} from 'lucide-react';

// ── Column accent colours ────────────────────────────────────────────────────
const columnStyles = {
  todo: 'border-t-4 border-t-slate-400 bg-slate-50/70',
  inProgress: 'border-t-4 border-t-blue-500 bg-blue-50/40',
  blocked: 'border-t-4 border-t-rose-500 bg-rose-50/40',
  review: 'border-t-4 border-t-purple-500 bg-purple-50/40',
  done: 'border-t-4 border-t-emerald-500 bg-emerald-50/40',
};

const getPriorityClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':   return 'bg-red-100 text-red-700';
    case 'medium': return 'bg-amber-100 text-amber-700';
    case 'low':    return 'bg-emerald-100 text-emerald-700';
    default:       return 'bg-gray-100 text-gray-700';
  }
};

function ScrumBoardPage() {
  const navigate = useNavigate();
  const {
    projectList,
    setProjectList,
    loading,
    setLoading,
    user,
    selectedProjectId,
    setSelectedProjectId,
  } = useContext(TaskManagerContext);

  // Local state — sprint board manages its own data independently
  const [activeSprint, setActiveSprint]   = useState(null);
  const [sprintTasks, setSprintTasks]     = useState([]);
  const [stories, setStories]             = useState([]);
  const [expandedStories, setExpandedStories] = useState({});

  // ── Fetch projects once ─────────────────────────────────────────────────
  useEffect(() => {
    if (user?._id && projectList.length === 0) {
      getAllProjectsApi(user._id).then((res) => {
        if (res?.success) setProjectList(res.projectsList || []);
      });
    }
  }, [user]);

  // ── Fetch active sprint + stories when project changes ──────────────────
  const fetchSprintData = async () => {
    if (!selectedProjectId || selectedProjectId === 'all') {
      setActiveSprint(null);
      setSprintTasks([]);
      setStories([]);
      return;
    }
    setLoading(true);
    try {
      const [sprintRes, storiesRes] = await Promise.all([
        getActiveSprintApi(selectedProjectId),
        getStoriesByProjectApi(selectedProjectId),
      ]);
      if (sprintRes?.success) {
        setActiveSprint(sprintRes.sprint);
        setSprintTasks(sprintRes.tasks || []);
      }
      if (storiesRes?.success) {
        setStories(storiesRes.stories || []);
        // Default all stories to expanded
        const expanded = {};
        (storiesRes.stories || []).forEach((s) => { expanded[s._id] = true; });
        expanded['__noStory__'] = true;
        setExpandedStories(expanded);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprintData();
  }, [selectedProjectId]);

  // ── Status change ───────────────────────────────────────────────────────
  const handleStatusChange = async (task, newStatus) => {
    // Guard: task must be in an active sprint to change status
    if (!task.sprintId) return;
    setLoading(true);
    try {
      const res = await updateTaskApi({ ...task, status: newStatus, userId: user._id });
      if (res?.success) fetchSprintData();
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
      if (res?.success) fetchSprintData();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Build story groups for the board ────────────────────────────────────
  // Each column shows tasks grouped by story
  const getTasksForColumnAndStory = (columnId, storyId) =>
    sprintTasks.filter(
      (t) =>
        t.status === columnId &&
        (storyId === '__noStory__'
          ? !t.storyId
          : t.storyId === storyId)
    );

  // Collect story IDs that appear in sprint tasks (+ a slot for unassigned)
  const sprintStoryIds = [...new Set(sprintTasks.map((t) => t.storyId || '__noStory__'))];
  const sprintStories = [
    ...stories.filter((s) => sprintStoryIds.includes(s._id)),
    ...(sprintStoryIds.includes('__noStory__') ? [{ _id: '__noStory__', title: 'Unassigned tasks' }] : []),
  ];

  if (loading && sprintTasks.length === 0) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Kanban className="w-6 h-6 text-indigo-600" />
            Sprint Board
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {activeSprint
              ? `Active sprint: "${activeSprint.name}" · ends ${new Date(activeSprint.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'No active sprint for the selected project.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project filter */}
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
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Shortcut to Sprints page */}
          <button
            onClick={() => navigate('/sprints')}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-xl transition-colors"
          >
            <Zap className="w-3.5 h-3.5" /> Manage Sprints
          </button>
        </div>
      </div>

      {/* No project or no active sprint */}
      {(!selectedProjectId || selectedProjectId === 'all') && (
        <NoSprintPlaceholder message="Select a project to view its active sprint board." />
      )}

      {selectedProjectId && selectedProjectId !== 'all' && !activeSprint && (
        <NoSprintPlaceholder
          message="This project has no active sprint."
          action={
            <button
              onClick={() => navigate('/sprints')}
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline mt-2"
            >
              Go to Sprint Management <ArrowRight className="w-4 h-4" />
            </button>
          }
        />
      )}

      {/* Sprint overdue warning */}
      {activeSprint && new Date(activeSprint.endDate) < new Date() && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-700 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          This sprint's end date has passed. Close it manually from the{' '}
          <button
            onClick={() => navigate('/sprints')}
            className="underline font-bold ml-1"
          >
            Sprints page
          </button>
          .
        </div>
      )}

      {/* Board columns */}
      {activeSprint && sprintTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {scrumBoardOptions.map((column) => {
            const colTotal = sprintTasks.filter((t) => t.status === column.id).length;

            return (
              <div
                key={column.id}
                className={`rounded-xl p-3 border border-gray-200 flex flex-col min-h-[500px] ${
                  columnStyles[column.id] || 'bg-gray-50'
                }`}
              >
                {/* Column header */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-200/60 mb-3">
                  <h3 className="font-bold text-gray-800 text-sm">{column.label}</h3>
                  <span className="bg-white text-gray-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-gray-200 shadow-xs">
                    {colTotal}
                  </span>
                </div>

                {/* Stories + tasks */}
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {sprintStories.map((story) => {
                    const colTasks = getTasksForColumnAndStory(column.id, story._id);
                    const storyExpanded = expandedStories[story._id] !== false;
                    const isVirtual = story._id === '__noStory__';

                    return (
                      <div key={story._id}>
                        {/* Story label row */}
                        <button
                          onClick={() =>
                            setExpandedStories((prev) => ({
                              ...prev,
                              [story._id]: !storyExpanded,
                            }))
                          }
                          className="flex items-center gap-1.5 w-full text-left mb-1.5 group"
                        >
                          {storyExpanded ? (
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          )}
                          <BookOpen
                            className={`w-3 h-3 shrink-0 ${
                              isVirtual ? 'text-amber-400' : 'text-indigo-400'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-bold truncate ${
                              isVirtual ? 'text-amber-600' : 'text-indigo-600'
                            }`}
                          >
                            {story.title}
                          </span>
                          {colTasks.length > 0 && (
                            <span className="ml-auto text-[9px] font-bold text-gray-400 shrink-0">
                              {colTasks.length}
                            </span>
                          )}
                        </button>

                        {/* Task cards */}
                        {storyExpanded && (
                          <div className="space-y-2 pl-1">
                            {colTasks.map((task) => (
                              <TaskCard
                                key={task._id}
                                task={task}
                                column={column}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                              />
                            ))}
                            {colTasks.length === 0 && (
                              <div className="text-center py-3 text-[10px] text-gray-300 font-medium italic">
                                none
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {colTotal === 0 && (
                    <div className="text-center py-6 text-xs text-gray-400 font-medium">
                      No tasks in {column.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active sprint but no tasks assigned yet */}
      {activeSprint && sprintTasks.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center gap-3">
          <Kanban className="w-12 h-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600">Sprint has no tasks yet</h3>
          <p className="text-sm text-gray-400">
            Assign tasks to this sprint from the{' '}
            <button
              onClick={() => navigate('/sprints')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sprints page
            </button>
            .
          </p>
        </div>
      )}
    </div>
  );
}

// ── Task card ────────────────────────────────────────────────────────────────
const TaskCard = ({ task, column, onStatusChange, onDelete }) => (
  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col gap-2 group">
    <h4 className="font-bold text-gray-900 text-xs line-clamp-2">{task.title}</h4>
    {task.description && (
      <p className="text-[10px] text-gray-500 line-clamp-2">{task.description}</p>
    )}

    {/* Assignee */}
    <div className="flex items-center gap-1">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
        task.assignedToName ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-gray-100 text-gray-400'
      }`}>
        {task.assignedToName ? task.assignedToName.charAt(0).toUpperCase() : '?'}
      </div>
      <span className={`text-[10px] font-semibold truncate ${
        task.assignedToName ? 'text-indigo-700' : 'text-gray-400 italic'
      }`}>
        {task.assignedToName || 'Unassigned'}
      </span>
    </div>

    {/* Priority + delete */}
    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
      <span
        className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${getPriorityClass(task.priority)}`}
      >
        <Flag className="w-2.5 h-2.5" />
        {task.priority || 'normal'}
      </span>
      <button
        onClick={() => onDelete(task._id)}
        className="p-0.5 text-gray-300 hover:text-rose-500 rounded transition"
        title="Delete"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>

    {/* Status quick-switch */}
    <div className="flex gap-0.5 pt-0.5">
      {scrumBoardOptions.map((opt) => (
        <button
          key={opt.id}
          disabled={opt.id === task.status}
          onClick={() => onStatusChange(task, opt.id)}
          title={opt.label}
          className={`flex-1 text-[8px] py-1 rounded font-semibold transition ${
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

// ── Empty state ──────────────────────────────────────────────────────────────
const NoSprintPlaceholder = ({ message, action }) => (
  <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center gap-2">
    <Kanban className="w-12 h-12 text-gray-300" />
    <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
    {action}
  </div>
);

export default ScrumBoardPage;
