import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskManagerContext } from '@/context';
import {
  getAllProjectsApi,
  getSprintsByProjectApi,
  addNewSprintApi,
  updateSprintApi,
  deleteSprintApi,
  startSprintApi,
  closeSprintApi,
  getTasksByProjectIdApi,
  getStoriesByProjectApi,
  getProjectMembersApi,
  batchAssignTasksToSprintApi,
} from '@/services';
import AddNewSprint from '@/components/sprints/add-new-sprint';
import SprintItem from '@/components/sprints/sprint-item';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Zap, Filter, Plus, Briefcase, BookOpen,
  ChevronDown, ChevronRight, AlertCircle, Save, History, UserCheck,
} from 'lucide-react';

function SprintsPage() {
  const navigate = useNavigate();
  const {
    user, projectList, setProjectList, sprintList, setSprintList,
    sprintFormData, currentEditedSprintId, setCurrentEditedSprintId,
    selectedProjectId, setSelectedProjectId, loading, setLoading,
  } = useContext(TaskManagerContext);

  const [showSprintDialog, setShowSprintDialog] = useState(false);
  const [projectTasks, setProjectTasks]         = useState([]);
  const [projectStories, setProjectStories]     = useState([]);
  const [projectMembers, setProjectMembers]     = useState([]);
  const [assignPanelSprintId, setAssignPanelSprintId] = useState(null);
  const [expandedStories, setExpandedStories]   = useState({});
  const [alertMsg, setAlertMsg]                 = useState('');

  // draftChecked  : { [sprintId]: Set<taskId> }         — which tasks are checked
  // draftAssignees: { [sprintId]: { [taskId]: userId } } — per-task assignee in draft
  const [draftChecked, setDraftChecked]       = useState({});
  const [draftAssignees, setDraftAssignees]   = useState({});
  const [savingSprintId, setSavingSprintId]   = useState(null);

  // ── Fetch projects once ─────────────────────────────────────────────────
  useEffect(() => {
    if (user?._id && projectList.length === 0) {
      getAllProjectsApi(user._id).then((res) => {
        if (res?.success) setProjectList(res.projectsList || []);
      });
    }
  }, [user]);

  // ── Fetch sprints when project changes ──────────────────────────────────
  const fetchSprints = async () => {
    if (!selectedProjectId || selectedProjectId === 'all') { setSprintList([]); return; }
    setLoading(true);
    try {
      const res = await getSprintsByProjectApi(selectedProjectId);
      if (res?.success) setSprintList(res.sprints || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ── Fetch tasks, stories, members ───────────────────────────────────────
  const fetchTasksStoriesMembers = async () => {
    if (!selectedProjectId || selectedProjectId === 'all') return;
    try {
      const [tRes, sRes, mRes] = await Promise.all([
        getTasksByProjectIdApi(selectedProjectId),
        getStoriesByProjectApi(selectedProjectId),
        getProjectMembersApi(selectedProjectId),
      ]);
      if (tRes?.success) setProjectTasks(tRes.tasksList || []);
      if (sRes?.success) setProjectStories(sRes.stories || []);
      if (mRes?.success) setProjectMembers(mRes.teamMembers || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchSprints();
    setAssignPanelSprintId(null);
    setDraftChecked({});
    setDraftAssignees({});
  }, [selectedProjectId]);

  useEffect(() => { fetchTasksStoriesMembers(); }, [selectedProjectId]);

  // Seed draft state whenever tasks or sprints load/refresh
  useEffect(() => {
    if (projectTasks.length === 0 && sprintList.length === 0) return;
    const checked   = {};
    const assignees = {};
    sprintList.forEach((sprint) => {
      const sprintTasks = projectTasks.filter((t) => t.sprintId === sprint._id);
      checked[sprint._id]   = new Set(sprintTasks.map((t) => t._id));
      assignees[sprint._id] = {};
      sprintTasks.forEach((t) => {
        if (t.assignedTo) assignees[sprint._id][t._id] = t.assignedTo;
      });
    });
    setDraftChecked(checked);
    setDraftAssignees(assignees);
  }, [sprintList, projectTasks]);

  // ── Sprint CRUD ─────────────────────────────────────────────────────────
  const handleSprintSubmit = async (data) => {
    if (!selectedProjectId || selectedProjectId === 'all') { setAlertMsg('Please select a project first.'); return; }
    setLoading(true); setAlertMsg('');
    try {
      const payload = { ...data, projectId: selectedProjectId, userId: user._id };
      const res = currentEditedSprintId
        ? await updateSprintApi({ ...payload, _id: currentEditedSprintId })
        : await addNewSprintApi(payload);
      if (res?.success) {
        await fetchSprints();
        sprintFormData.reset();
        setCurrentEditedSprintId(null);
        setShowSprintDialog(false);
      } else {
        setAlertMsg(res?.message || 'Failed to save sprint.');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleEdit = (sprint) => {
    setCurrentEditedSprintId(sprint._id);
    sprintFormData.setValue('name', sprint.name);
    sprintFormData.setValue('goal', sprint.goal || '');
    sprintFormData.setValue('startDate', new Date(sprint.startDate).toISOString().split('T')[0]);
    sprintFormData.setValue('endDate', new Date(sprint.endDate).toISOString().split('T')[0]);
    setShowSprintDialog(true);
  };

  const handleDelete = async (sprintId) => {
    if (!window.confirm('Delete this sprint? Tasks will be unassigned.')) return;
    setAlertMsg('');
    try {
      const res = await deleteSprintApi(sprintId);
      if (res?.success) { fetchSprints(); fetchTasksStoriesMembers(); }
      else setAlertMsg(res?.message || 'Failed to delete sprint.');
    } catch (err) { console.error(err); }
  };

  const handleStart = async (sprintId) => {
    setAlertMsg('');
    try {
      const res = await startSprintApi(sprintId);
      if (res?.success) fetchSprints();
      else setAlertMsg(res?.message || 'Could not start sprint.');
    } catch (err) { console.error(err); }
  };

  const handleClose = async (sprintId) => {
    if (!window.confirm('Close this sprint? It cannot be re-opened.')) return;
    setAlertMsg('');
    try {
      const res = await closeSprintApi(sprintId);
      if (res?.success) fetchSprints();
      else setAlertMsg(res?.message || 'Could not close sprint.');
    } catch (err) { console.error(err); }
  };

  // ── Draft: toggle task checked state ────────────────────────────────────
  const handleDraftToggle = (task, sprintId) => {
    const inOtherSprint = task.sprintId && task.sprintId !== sprintId;
    if (inOtherSprint) return;
    setDraftChecked((prev) => {
      const cur = new Set(prev[sprintId] || []);
      if (cur.has(task._id)) {
        cur.delete(task._id);
        // Also clear the assignee when unchecked
        setDraftAssignees((pa) => {
          const a = { ...(pa[sprintId] || {}) };
          delete a[task._id];
          return { ...pa, [sprintId]: a };
        });
      } else {
        cur.add(task._id);
      }
      return { ...prev, [sprintId]: cur };
    });
  };

  // ── Draft: change assignee for a task ───────────────────────────────────
  const handleAssigneeChange = (sprintId, taskId, userId) => {
    setDraftAssignees((prev) => ({
      ...prev,
      [sprintId]: { ...(prev[sprintId] || {}), [taskId]: userId },
    }));
  };

  // ── Validation helpers ──────────────────────────────────────────────────
  // Returns list of taskIds that are checked but have no assignee selected
  const unassignedCheckedTasks = (sprintId) => {
    const checked   = draftChecked[sprintId]   || new Set();
    const assignees = draftAssignees[sprintId] || {};
    return Array.from(checked).filter((taskId) => !assignees[taskId]);
  };

  const isDirty = (sprintId) => {
    // Checked set changed?
    const saved    = new Set(projectTasks.filter((t) => t.sprintId === sprintId).map((t) => t._id));
    const draft    = draftChecked[sprintId] || new Set();
    if (saved.size !== draft.size) return true;
    for (const id of saved) if (!draft.has(id)) return true;
    // Assignee changed for any saved task?
    const assignees = draftAssignees[sprintId] || {};
    for (const t of projectTasks.filter((t) => t.sprintId === sprintId)) {
      if (assignees[t._id] !== t.assignedTo) return true;
    }
    return false;
  };

  // ── Save assignments ────────────────────────────────────────────────────
  const handleSaveAssignments = async (sprintId) => {
    const missing = unassignedCheckedTasks(sprintId);
    if (missing.length > 0) {
      setAlertMsg(`${missing.length} checked task(s) have no assignee. Select a team member for each checked task before saving.`);
      return;
    }

    setSavingSprintId(sprintId);
    setAlertMsg('');
    try {
      const checkedIds = Array.from(draftChecked[sprintId] || []);
      const assignees  = draftAssignees[sprintId] || {};
      const assignments = checkedIds.map((taskId) => {
        const member = projectMembers.find((m) => m.userId === assignees[taskId]);
        return {
          taskId,
          assignedTo:     assignees[taskId] || '',
          assignedToName: member?.name || '',
        };
      });

      const res = await batchAssignTasksToSprintApi(sprintId, assignments, selectedProjectId);
      if (res?.success) {
        setProjectTasks(res.tasksList || []);
        await fetchSprints();
      } else {
        setAlertMsg(res?.message || 'Failed to save assignments.');
      }
    } catch (err) { console.error(err); }
    finally { setSavingSprintId(null); }
  };

  // ── Build story groups ──────────────────────────────────────────────────
  const buildStoryGroups = (sprintId) => {
    const selectedSet = draftChecked[sprintId] || new Set();
    const relevant = projectTasks.filter(
      (t) => !t.sprintId || t.sprintId === sprintId || selectedSet.has(t._id)
    );
    const groups = [];
    projectStories.forEach((story) => {
      const stTasks = relevant.filter((t) => t.storyId === story._id);
      if (stTasks.length > 0) groups.push({ story, tasks: stTasks });
    });
    const noStory = relevant.filter((t) => !t.storyId);
    if (noStory.length > 0) groups.push({ story: null, tasks: noStory });
    return groups;
  };

  const activeSprints  = sprintList.filter((s) => s.status === 'active');
  const plannedSprints = sprintList.filter((s) => s.status === 'planned');
  const closedSprints  = sprintList.filter((s) => s.status === 'closed');

  if (loading && sprintList.length === 0 && selectedProjectId !== 'all') {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Zap className="w-6 h-6" /> Sprint Management
            </h1>
            <p className="text-indigo-200 text-sm mt-1">Plan sprints, assign tasks, and track delivery.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/sprint-history')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2.5 rounded-xl transition-all">
              <History className="w-4 h-4" /> History
            </button>
            <button
              disabled={!selectedProjectId || selectedProjectId === 'all'}
              onClick={() => {
                const today    = new Date().toISOString().split('T')[0];
                const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                sprintFormData.reset({ name: '', goal: '', startDate: today, endDate: twoWeeks });
                setCurrentEditedSprintId(null);
                setShowSprintDialog(true);
              }}
              className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus className="w-4 h-4" /> New Sprint
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20">
          {[['Active', activeSprints.length], ['Planned', plannedSprints.length], ['Closed', closedSprints.length]].map(([label, count]) => (
            <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{count}</p>
              <p className="text-xs text-indigo-200 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Project selector */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-xs">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-semibold text-gray-600">Project:</span>
        <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}
          className="flex-1 text-sm font-bold text-indigo-700 outline-none cursor-pointer bg-transparent">
          <option value="all">— Select a project —</option>
          {projectList.map((p) => (<option key={p._id} value={p._id}>{p.name}</option>))}
        </select>
      </div>

      {/* Alert */}
      {alertMsg && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{alertMsg}</span>
          <button onClick={() => setAlertMsg('')} className="ml-auto text-red-400 hover:text-red-700">✕</button>
        </div>
      )}

      {(!selectedProjectId || selectedProjectId === 'all') && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center gap-3">
          <Briefcase className="w-12 h-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-600">Select a project</h3>
          <p className="text-sm text-gray-400">Choose a project above to view and manage its sprints.</p>
        </div>
      )}

      {selectedProjectId && selectedProjectId !== 'all' && (
        <div className="flex flex-col gap-6">
          {activeSprints.length > 0 && (
            <Section title="🏃 Active Sprint" accent="emerald">
              {activeSprints.map((sprint) => (
                <SprintWithPanel key={sprint._id} sprint={sprint}
                  assignPanelSprintId={assignPanelSprintId} onTogglePanel={setAssignPanelSprintId}
                  storyGroups={buildStoryGroups(sprint._id)}
                  expandedStories={expandedStories} setExpandedStories={setExpandedStories}
                  draftChecked={draftChecked} draftAssignees={draftAssignees}
                  projectMembers={projectMembers}
                  onDraftToggle={handleDraftToggle}
                  onAssigneeChange={handleAssigneeChange}
                  unassignedCount={unassignedCheckedTasks(sprint._id).length}
                  onSave={handleSaveAssignments} savingSprintId={savingSprintId}
                  isDirty={isDirty(sprint._id)}
                  onStart={handleStart} onClose={handleClose}
                  onEdit={handleEdit} onDelete={handleDelete}
                  onView={() => navigate('/tasks/scrum-board')}
                />
              ))}
            </Section>
          )}

          {plannedSprints.length > 0 && (
            <Section title="📋 Planned Sprints" accent="indigo">
              {plannedSprints.map((sprint) => (
                <SprintWithPanel key={sprint._id} sprint={sprint}
                  assignPanelSprintId={assignPanelSprintId} onTogglePanel={setAssignPanelSprintId}
                  storyGroups={buildStoryGroups(sprint._id)}
                  expandedStories={expandedStories} setExpandedStories={setExpandedStories}
                  draftChecked={draftChecked} draftAssignees={draftAssignees}
                  projectMembers={projectMembers}
                  onDraftToggle={handleDraftToggle}
                  onAssigneeChange={handleAssigneeChange}
                  unassignedCount={unassignedCheckedTasks(sprint._id).length}
                  onSave={handleSaveAssignments} savingSprintId={savingSprintId}
                  isDirty={isDirty(sprint._id)}
                  onStart={handleStart} onClose={handleClose}
                  onEdit={handleEdit} onDelete={handleDelete}
                  onView={() => navigate('/tasks/scrum-board')}
                />
              ))}
            </Section>
          )}

          {closedSprints.length > 0 && (
            <Section title="✅ Closed Sprints" accent="gray">
              {closedSprints.map((sprint) => (
                <SprintItem key={sprint._id} sprint={sprint}
                  onStart={handleStart} onClose={handleClose}
                  onEdit={handleEdit} onDelete={handleDelete}
                  onView={() => navigate('/tasks/scrum-board')} />
              ))}
            </Section>
          )}

          {sprintList.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center gap-3">
              <Zap className="w-12 h-12 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600">No sprints yet</h3>
              <p className="text-sm text-gray-400">Create your first sprint to start tracking work.</p>
            </div>
          )}
        </div>
      )}

      <AddNewSprint showDialog={showSprintDialog} setShowDialog={setShowSprintDialog}
        handleSubmit={handleSprintSubmit} sprintFormData={sprintFormData}
        currentEditedSprintId={currentEditedSprintId} setCurrentEditedSprintId={setCurrentEditedSprintId} />
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, accent = 'indigo', children }) => (
  <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden border-l-4 ${
    accent === 'emerald' ? 'border-l-emerald-500' : accent === 'gray' ? 'border-l-gray-300' : 'border-l-indigo-400'
  }`}>
    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60">
      <h2 className="font-bold text-gray-800 text-base">{title}</h2>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

// ── Sprint card + assignment panel ────────────────────────────────────────────
const SprintWithPanel = ({
  sprint, assignPanelSprintId, onTogglePanel, storyGroups,
  expandedStories, setExpandedStories,
  draftChecked, draftAssignees, projectMembers,
  onDraftToggle, onAssigneeChange,
  unassignedCount, onSave, savingSprintId, isDirty,
  ...sprintItemProps
}) => {
  const panelOpen   = assignPanelSprintId === sprint._id;
  const isSaving    = savingSprintId === sprint._id;
  const checkedSet  = draftChecked[sprint._id]   || new Set();
  const assignees   = draftAssignees[sprint._id] || {};
  const checkedCount = checkedSet.size;

  // Save is blocked when: no changes, or any checked task has no assignee
  const canSave = isDirty && unassignedCount === 0;

  return (
    <div className="flex flex-col">
      <SprintItem sprint={sprint} {...sprintItemProps} />

      {sprint.status !== 'closed' && (
        <button
          onClick={() => onTogglePanel(panelOpen ? null : sprint._id)}
          className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-b-xl transition-colors border border-t-0 border-indigo-100"
        >
          {panelOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {panelOpen ? 'Hide' : 'Show'} task assignment
          {checkedCount > 0 && (
            <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {checkedCount}
            </span>
          )}
          {isDirty && <span className="ml-1 text-amber-600 font-bold">(unsaved)</span>}
        </button>
      )}

      {panelOpen && (
        <div className="border border-t-0 border-indigo-100 rounded-b-xl bg-indigo-50/30 p-4 space-y-3">

          {/* Panel header: instructions + save button */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                Check tasks to include in this sprint. Each checked task <span className="text-red-600">must</span> have an assignee.
              </p>
              {unassignedCount > 0 && (
                <p className="text-xs text-red-600 font-semibold">
                  ⚠ {unassignedCount} checked task{unassignedCount > 1 ? 's are' : ' is'} missing an assignee.
                </p>
              )}
              {projectMembers.length === 0 && (
                <p className="text-xs text-amber-600 font-semibold">
                  ⚠ No team members found. Add members to this project first (Project → Team tab).
                </p>
              )}
            </div>
            <button
              onClick={() => onSave(sprint._id)}
              disabled={isSaving || !canSave}
              className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>

          {/* Story groups */}
          {storyGroups.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No available tasks for this project.</p>
          ) : (
            storyGroups.map(({ story, tasks }) => {
              const groupKey   = story?._id || '__noStory__';
              const isExpanded = expandedStories[groupKey] !== false;

              return (
                <div key={groupKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Story group header */}
                  <button
                    onClick={() => setExpandedStories((p) => ({ ...p, [groupKey]: !isExpanded }))}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-bold text-gray-700 flex-1 truncate">
                      {story ? story.title : 'Unassigned to story'}
                    </span>
                    <span className="text-xs text-gray-400">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
                  </button>

                  {/* Task rows */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 divide-y divide-gray-50">
                      {tasks.map((task) => {
                        const isChecked  = checkedSet.has(task._id);
                        const inOther    = task.sprintId && task.sprintId !== sprint._id && !isChecked;
                        const assigneeId = assignees[task._id] || '';
                        const needsUser  = isChecked && !assigneeId;

                        return (
                          <div
                            key={task._id}
                            className={`flex items-center gap-3 px-3 py-2.5 text-xs transition-colors ${
                              inOther ? 'opacity-40 bg-gray-50' : isChecked ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                            }`}
                          >
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={inOther}
                              onChange={() => onDraftToggle(task, sprint._id)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                            />

                            {/* Task title */}
                            <span className="flex-1 font-medium text-gray-800 truncate min-w-0">
                              {task.title}
                            </span>

                            {/* Priority */}
                            <span className={`px-1.5 py-0.5 rounded font-semibold capitalize shrink-0 ${
                              task.priority === 'high'   ? 'text-red-600' :
                              task.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {task.priority}
                            </span>

                            {/* In-other-sprint label */}
                            {inOther && (
                              <span className="text-gray-400 italic shrink-0">other sprint</span>
                            )}

                            {/* Assignee dropdown — shown only when checked, mandatory */}
                            {isChecked && !inOther && (
                              <select
                                value={assigneeId}
                                onChange={(e) => onAssigneeChange(sprint._id, task._id, e.target.value)}
                                className={`text-xs font-semibold rounded-lg border px-2 py-1 outline-none cursor-pointer shrink-0 transition-colors ${
                                  needsUser
                                    ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-400'
                                    : 'border-indigo-300 bg-indigo-50 text-indigo-700 focus:ring-indigo-400'
                                }`}
                                title="Assign to a team member (required)"
                              >
                                <option value="">— Assign to —</option>
                                {projectMembers.map((m) => (
                                  <option key={m.userId} value={m.userId}>{m.name}</option>
                                ))}
                              </select>
                            )}

                            {/* Already-assigned label when unchecked */}
                            {!isChecked && !inOther && task.assignedToName && (
                              <span className="text-gray-400 text-[10px] italic shrink-0">{task.assignedToName}</span>
                            )}
                          </div>
                        );
                      })}
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
};

export default SprintsPage;
