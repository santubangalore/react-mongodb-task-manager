import { BookOpen, CheckCircle2, Clock, Circle, ChevronDown, ChevronRight, Edit3, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

const getStatusConfig = (status) => {
  switch (status) {
    case 'done':
      return {
        label: 'Done',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    case 'inProgress':
      return {
        label: 'In Progress',
        icon: <Clock className="w-3.5 h-3.5" />,
        className: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    default:
      return {
        label: 'To Do',
        icon: <Circle className="w-3.5 h-3.5" />,
        className: 'bg-slate-100 text-slate-700 border-slate-300',
      };
  }
};

const StoryItem = ({
  story,
  tasks = [],
  onEdit,
  onDelete,
  onAddTask,
}) => {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = getStatusConfig(story.status);

  const storyTasks = tasks.filter(
    (t) => t.storyId && t.storyId.toString() === story._id.toString()
  );
  const doneTasks = storyTasks.filter((t) => t.status === 'done').length;
  const progressPct = storyTasks.length > 0 ? Math.round((doneTasks / storyTasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Story Header Row */}
      <div className="flex items-center gap-3 p-4">
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-gray-400 hover:text-indigo-600 transition-colors shrink-0"
          aria-label="Toggle tasks"
        >
          {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Story icon */}
        <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
          <BookOpen className="w-4 h-4 text-indigo-600" />
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm truncate">{story.title}</h4>
          {story.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{story.description}</p>
          )}
        </div>

        {/* Status badge */}
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusCfg.className}`}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </span>

        {/* Task count pill */}
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
          {doneTasks}/{storyTasks.length} tasks
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onAddTask(story)}
            title="Add task to story"
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(story)}
            title="Edit story"
            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(story._id)}
            title="Delete story"
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {storyTasks.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 font-medium w-9 text-right">{progressPct}%</span>
          </div>
        </div>
      )}

      {/* Expanded task list */}
      {expanded && (
        <div className="border-t border-gray-100 bg-slate-50/50 px-4 py-3 space-y-2">
          {storyTasks.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">
              No tasks yet.{' '}
              <button
                className="text-indigo-600 font-semibold hover:underline"
                onClick={() => onAddTask(story)}
              >
                Add one
              </button>
            </p>
          ) : (
            storyTasks.map((task) => (
              <TaskRow key={task._id} task={task} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ── Inline task row inside the expanded story ─────────────────────────────────
const taskStatusMap = {
  todo: { label: 'To Do', color: 'bg-slate-200 text-slate-700' },
  inProgress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  blocked: { label: 'Blocked', color: 'bg-rose-100 text-rose-700' },
  review: { label: 'Review', color: 'bg-purple-100 text-purple-700' },
  done: { label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
};

const priorityColor = {
  high: 'text-red-600',
  medium: 'text-amber-600',
  low: 'text-emerald-600',
};

const TaskRow = ({ task }) => {
  const st = taskStatusMap[task.status] || taskStatusMap.todo;
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2 text-xs">
      <span className={`px-2 py-0.5 rounded-full font-semibold shrink-0 ${st.color}`}>
        {st.label}
      </span>
      <span className="flex-1 font-medium text-gray-800 truncate">{task.title}</span>
      <span className={`font-semibold shrink-0 ${priorityColor[task.priority] || 'text-gray-500'}`}>
        {task.priority || 'normal'}
      </span>
      {task.sprintId && (
        <span className="text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">
          In Sprint
        </span>
      )}
    </div>
  );
};

export default StoryItem;
