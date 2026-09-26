import {
  CalendarDays,
  PlayCircle,
  XCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Circle,
  Target,
} from 'lucide-react';

const statusConfig = {
  planned: {
    label: 'Planned',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: <Circle className="w-3.5 h-3.5" />,
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-600 border-gray-300',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

const SprintItem = ({ sprint, onStart, onClose, onEdit, onDelete, onView }) => {
  const cfg = statusConfig[sprint.status] || statusConfig.planned;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  const daysLeft = (() => {
    if (sprint.status !== 'active') return null;
    const diff = new Date(sprint.endDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  })();

  const progressPct =
    sprint.tasksCount > 0
      ? Math.round((sprint.doneTasksCount / sprint.tasksCount) * 100)
      : 0;

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        sprint.status === 'active' ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900 text-base truncate">{sprint.name}</h4>
            <span
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${cfg.className}`}
            >
              {cfg.icon}
              {cfg.label}
            </span>
            {sprint.status === 'active' && daysLeft !== null && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  daysLeft < 0
                    ? 'bg-red-100 text-red-700'
                    : daysLeft <= 2
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
              </span>
            )}
          </div>

          {sprint.goal && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
              <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{sprint.goal}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
              {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
            </span>
            <span className="font-semibold text-gray-700">
              {sprint.doneTasksCount ?? 0}/{sprint.tasksCount ?? 0} tasks done
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {sprint.tasksCount > 0 && (
        <div className="px-4 pb-3">
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

      {/* Actions footer */}
      <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3 flex items-center justify-between gap-2">
        {/* Primary action */}
        <div className="flex gap-2">
          {sprint.status === 'planned' && (
            <button
              onClick={() => onStart(sprint._id)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Start Sprint
            </button>
          )}
          {sprint.status === 'active' && (
            <>
              <button
                onClick={() => onView(sprint)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                View Board
              </button>
              <button
                onClick={() => onClose(sprint._id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Close Sprint
              </button>
            </>
          )}
          {sprint.status === 'closed' && (
            <span className="text-xs text-gray-400 italic">Sprint ended</span>
          )}
        </div>

        {/* Edit / Delete */}
        <div className="flex gap-1.5">
          {sprint.status !== 'active' && (
            <button
              onClick={() => onEdit(sprint)}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          <button
            onClick={() => onDelete(sprint._id)}
            className="flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default SprintItem;
