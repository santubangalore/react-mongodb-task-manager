import { useContext, useEffect, useState } from 'react';
import { TaskManagerContext } from '@/context';
import { getAllProjectsApi, getSprintHistoryApi } from '@/services';
import { Skeleton } from '@/components/ui/skeleton';
import {
  History, Filter, Briefcase, BookOpen, CheckCircle2, Circle,
  Clock, ChevronDown, ChevronRight, CalendarDays, Target,
} from 'lucide-react';

const statusColor = {
  todo:       'bg-slate-100 text-slate-700',
  inProgress: 'bg-blue-100 text-blue-700',
  blocked:    'bg-rose-100 text-rose-700',
  review:     'bg-purple-100 text-purple-700',
  done:       'bg-emerald-100 text-emerald-700',
};

const priorityColor = {
  high:   'text-red-600',
  medium: 'text-amber-600',
  low:    'text-emerald-600',
};

function SprintHistoryPage() {
  const { user, projectList, setProjectList, selectedProjectId, setSelectedProjectId } =
    useContext(TaskManagerContext);

  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [expandedSprints, setExpandedSprints]   = useState({});
  const [expandedStories, setExpandedStories]   = useState({});

  useEffect(() => {
    if (user?._id && projectList.length === 0) {
      getAllProjectsApi(user._id).then((res) => {
        if (res?.success) setProjectList(res.projectsList || []);
      });
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!selectedProjectId || selectedProjectId === 'all') { setHistory([]); return; }
    setLoading(true);
    try {
      const res = await getSprintHistoryApi(selectedProjectId);
      if (res?.success) {
        setHistory(res.history || []);
        // Default-expand all sprints
        const exp = {};
        (res.history || []).forEach((s) => { exp[s._id] = true; });
        setExpandedSprints(exp);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [selectedProjectId]);

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        {[1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-gray-700 to-zinc-700 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold flex items-center gap-2 mb-1">
          <History className="w-6 h-6" /> Sprint History
        </h1>
        <p className="text-gray-300 text-sm">Review all completed sprints — their stories, tasks, and outcomes.</p>
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold">{history.length}</p>
            <p className="text-xs text-gray-300 mt-0.5">Closed Sprints</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold">{history.reduce((a, s) => a + (s.tasksCount || 0), 0)}</p>
            <p className="text-xs text-gray-300 mt-0.5">Total Tasks</p>
          </div>
        </div>
      </div>

      {/* Project selector */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-xs">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-semibold text-gray-600">Project:</span>
        <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}
          className="flex-1 text-sm font-bold text-gray-700 outline-none cursor-pointer bg-transparent">
          <option value="all">— Select a project —</option>
          {projectList.map((p) => (<option key={p._id} value={p._id}>{p.name}</option>))}
        </select>
      </div>

      {/* No project */}
      {(!selectedProjectId || selectedProjectId === 'all') && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center gap-3">
          <Briefcase className="w-12 h-12 text-gray-300" />
          <p className="text-gray-500 font-semibold">Select a project to view its sprint history.</p>
        </div>
      )}

      {/* No history */}
      {selectedProjectId && selectedProjectId !== 'all' && history.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center gap-3">
          <History className="w-12 h-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600">No closed sprints yet</h3>
          <p className="text-sm text-gray-400">Completed sprints will appear here after they are closed.</p>
        </div>
      )}

      {/* Sprint history list */}
      {history.map((sprint) => {
        const sprintExpanded = expandedSprints[sprint._id] !== false;
        const progressPct = sprint.tasksCount > 0
          ? Math.round((sprint.doneTasksCount / sprint.tasksCount) * 100) : 0;

        return (
          <div key={sprint._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Sprint header */}
            <button
              onClick={() => setExpandedSprints((p) => ({ ...p, [sprint._id]: !sprintExpanded }))}
              className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50 transition-colors">
              <div className="mt-0.5">
                {sprintExpanded
                  ? <ChevronDown className="w-5 h-5 text-gray-400" />
                  : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-base">{sprint.name}</h3>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Closed
                  </span>
                </div>

                {sprint.goal && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{sprint.goal}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                    {fmt(sprint.startDate)} – {fmt(sprint.endDate)}
                  </span>
                  <span className="font-semibold text-gray-700">
                    {sprint.doneTasksCount}/{sprint.tasksCount} tasks done
                  </span>
                </div>

                {/* Progress bar */}
                {sprint.tasksCount > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 font-medium w-9 text-right">{progressPct}%</span>
                  </div>
                )}
              </div>
            </button>

            {/* Story groups */}
            {sprintExpanded && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {sprint.storyGroups?.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No tasks were assigned to this sprint.</p>
                ) : (
                  sprint.storyGroups?.map((group, gi) => {
                    const groupKey = group.story?._id || `__none_${gi}`;
                    const storyExpanded = expandedStories[groupKey] !== false;
                    return (
                      <div key={groupKey}>
                        <button
                          onClick={() => setExpandedStories((p) => ({ ...p, [groupKey]: !storyExpanded }))}
                          className="w-full flex items-center gap-3 px-5 py-3 bg-gray-50/70 hover:bg-gray-100 transition-colors text-left">
                          {storyExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                          <BookOpen className={`w-4 h-4 shrink-0 ${group.story ? 'text-indigo-500' : 'text-amber-400'}`} />
                          <span className="text-sm font-semibold text-gray-800 flex-1 truncate">
                            {group.story ? group.story.title : 'Unassigned tasks'}
                          </span>
                          <span className="text-xs text-gray-400 shrink-0">{group.tasks.length} tasks</span>
                          {group.story && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              group.story.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                              group.story.status === 'inProgress' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {group.story.status === 'done' ? 'Done' : group.story.status === 'inProgress' ? 'In Progress' : 'To Do'}
                            </span>
                          )}
                        </button>

                        {storyExpanded && (
                          <div className="divide-y divide-gray-50 pl-12">
                            {group.tasks.map((task) => (
                              <div key={task._id} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                                <span className={`px-2 py-0.5 rounded-full font-semibold shrink-0 ${statusColor[task.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {task.status || 'todo'}
                                </span>
                                <span className="flex-1 font-medium text-gray-800 truncate">{task.title}</span>
                                {task.assignedToName && (
                                  <span className="text-indigo-600 font-semibold shrink-0">{task.assignedToName}</span>
                                )}
                                <span className={`font-semibold shrink-0 capitalize ${priorityColor[task.priority] || 'text-gray-500'}`}>
                                  {task.priority || 'normal'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SprintHistoryPage;
