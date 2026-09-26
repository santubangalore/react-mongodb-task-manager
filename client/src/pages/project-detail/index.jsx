import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { TaskManagerContext } from '@/context';
import {
  getProjectDetailsApi,
  getStoriesByProjectApi,
  getTasksByProjectIdApi,
  addNewStoryApi,
  updateStoryApi,
  deleteStoryApi,
  addNewTaskApi,
  updateTaskApi,
  daleteTaskApi,
  getProjectMembersApi,
  addProjectMemberApi,
  removeProjectMemberApi,
} from '@/services';
import AddNewStory from '@/components/stories/add-new-story';
import StoryItem from '@/components/stories/story-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, BookOpen, ListTodo, CheckCircle2, Clock, Plus,
  Flag, Trash2, Edit3, Users, UserPlus, Crown, User as UserIcon,
  AlertCircle,
} from 'lucide-react';

const TABS = [
  { id: 'backlog',    label: 'Product Backlog', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'inProgress', label: 'In Progress',     icon: <Clock className="w-4 h-4" /> },
  { id: 'completed',  label: 'Completed',        icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'team',       label: 'Team',             icon: <Users className="w-4 h-4" /> },
];

const priorityOptions = ['low', 'medium', 'high'];

function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, storyFormData, currentEditedStoryId, setCurrentEditedStoryId } =
    useContext(TaskManagerContext);

  const [project, setProject]   = useState(null);
  const [stories, setStories]   = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('backlog');

  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog]   = useState(false);
  const [taskTargetStory, setTaskTargetStory] = useState(null);
  const [editingTask, setEditingTask]         = useState(null);

  // Team member add
  const [memberEmail, setMemberEmail]   = useState('');
  const [memberAlert, setMemberAlert]   = useState({ msg: '', type: '' });
  const [memberLoading, setMemberLoading] = useState(false);

  const taskForm = useForm({
    defaultValues: { title: '', description: '', priority: 'medium', assignedTo: '', assignedToName: '' },
  });

  // ── Fetch all data ──────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projRes, storiesRes, tasksRes, membersRes] = await Promise.all([
        getProjectDetailsApi(projectId),
        getStoriesByProjectApi(projectId),
        getTasksByProjectIdApi(projectId),
        getProjectMembersApi(projectId),
      ]);
      if (projRes?.success)    setProject(projRes.project);
      if (storiesRes?.success) setStories(storiesRes.stories || []);
      if (tasksRes?.success)   setTasks(tasksRes.tasksList || []);
      if (membersRes?.success) setMembers(membersRes.teamMembers || []);
    } catch (err) {
      console.error('fetchAll Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (projectId) fetchAll(); }, [projectId]);

  // ── Story CRUD ──────────────────────────────────────────────────────────
  const handleStorySubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data, projectId, userId: user._id };
      const res = currentEditedStoryId
        ? await updateStoryApi({ ...payload, _id: currentEditedStoryId })
        : await addNewStoryApi(payload);
      if (res?.success) { await fetchAll(); storyFormData.reset(); setCurrentEditedStoryId(null); setShowStoryDialog(false); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStoryEdit = (story) => {
    setCurrentEditedStoryId(story._id);
    storyFormData.setValue('title', story.title);
    storyFormData.setValue('description', story.description || '');
    setShowStoryDialog(true);
  };

  const handleStoryDelete = async (storyId) => {
    if (!window.confirm('Delete this story and all its tasks?')) return;
    const res = await deleteStoryApi(storyId);
    if (res?.success) fetchAll();
  };

  // ── Task CRUD ───────────────────────────────────────────────────────────
  const openAddTask = (story) => {
    setTaskTargetStory(story); setEditingTask(null);
    taskForm.reset({ title: '', description: '', priority: 'medium', assignedTo: '', assignedToName: '' });
    setShowTaskDialog(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task); setTaskTargetStory(null);
    taskForm.reset({
      title: task.title, description: task.description,
      priority: task.priority || 'medium',
      assignedTo: task.assignedTo || '', assignedToName: task.assignedToName || '',
    });
    setShowTaskDialog(true);
  };

  const handleTaskSubmit = async (data) => {
    setLoading(true);
    try {
      // Resolve assignedToName from members list
      const assignedMember = members.find((m) => m.userId === data.assignedTo);
      const assignedToName = assignedMember?.name || '';

      let res;
      if (editingTask) {
        res = await updateTaskApi({ ...editingTask, ...data, assignedToName, userId: user._id });
      } else {
        res = await addNewTaskApi({ ...data, assignedToName, userId: user._id, projectId, storyId: taskTargetStory?._id || '' });
      }
      if (res?.success) { await fetchAll(); setShowTaskDialog(false); setEditingTask(null); setTaskTargetStory(null); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    const res = await daleteTaskApi(taskId);
    if (res?.success) fetchAll();
  };

  // ── Team member management ──────────────────────────────────────────────
  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    setMemberLoading(true);
    setMemberAlert({ msg: '', type: '' });
    try {
      const res = await addProjectMemberApi(projectId, memberEmail.trim());
      if (res?.success) {
        setMembers(res.teamMembers || []);
        setMemberEmail('');
        setMemberAlert({ msg: res.message, type: 'success' });
      } else {
        setMemberAlert({ msg: res?.message || 'Failed to add member.', type: 'error' });
      }
    } catch (err) { setMemberAlert({ msg: 'Server error.', type: 'error' }); }
    finally { setMemberLoading(false); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    setMemberAlert({ msg: '', type: '' });
    try {
      const res = await removeProjectMemberApi(projectId, memberId);
      if (res?.success) setMembers(res.teamMembers || []);
      else setMemberAlert({ msg: res?.message || 'Failed to remove member.', type: 'error' });
    } catch (err) { setMemberAlert({ msg: 'Server error.', type: 'error' }); }
  };

  // ── Derived data ────────────────────────────────────────────────────────
  const storiesForTab = () => {
    if (activeTab === 'backlog')    return stories;
    if (activeTab === 'inProgress') return stories.filter((s) => s.status === 'inProgress');
    if (activeTab === 'completed')  return stories.filter((s) => s.status === 'done');
    return stories;
  };

  const unassignedTasks = tasks.filter((t) => !t.storyId);
  const tabCounts = {
    backlog:    stories.length,
    inProgress: stories.filter((s) => s.status === 'inProgress').length,
    completed:  stories.filter((s) => s.status === 'done').length,
    team:       members.length,
  };

  if (loading && !project) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <button onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-sm text-indigo-200 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{project?.name}</h1>
            <p className="text-indigo-200 text-sm mt-1">{project?.description || 'No description.'}</p>
          </div>
          {activeTab !== 'team' && (
            <button onClick={() => { storyFormData.reset(); setCurrentEditedStoryId(null); setShowStoryDialog(true); }}
              className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-4 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105">
              <Plus className="w-4 h-4" /> Add Story
            </button>
          )}
        </div>
        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/20">
          {[
            { label: 'Stories', val: stories.length },
            { label: 'Tasks',   val: tasks.length },
            { label: 'Done',    val: tasks.filter((t) => t.status === 'done').length },
            { label: 'Members', val: members.length },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{val}</p>
              <p className="text-xs text-indigo-200 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-xs overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 min-w-fit justify-center py-2.5 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            {tab.icon} {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>{tabCounts[tab.id]}</span>
          </button>
        ))}
      </div>

      {/* Team tab */}
      {activeTab === 'team' && (
        <TeamPanel
          members={members}
          memberEmail={memberEmail}
          setMemberEmail={setMemberEmail}
          memberAlert={memberAlert}
          memberLoading={memberLoading}
          onAdd={handleAddMember}
          onRemove={handleRemoveMember}
          currentUserId={user?._id}
        />
      )}

      {/* Story tabs (backlog / inProgress / completed) */}
      {activeTab !== 'team' && (
        <div className="space-y-3">
          {storiesForTab().length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center gap-3">
              <BookOpen className="w-12 h-12 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600">No stories here yet</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                {activeTab === 'backlog' ? 'Add your first story to start organising tasks.' : 'Stories will appear here once their tasks progress.'}
              </p>
            </div>
          ) : (
            storiesForTab().map((story) => (
              <StoryItem key={story._id} story={story} tasks={tasks}
                onEdit={handleStoryEdit} onDelete={handleStoryDelete} onAddTask={openAddTask} />
            ))
          )}

          {activeTab === 'backlog' && unassignedTasks.length > 0 && (
            <div className="bg-white rounded-xl border border-dashed border-amber-200 p-4">
              <h4 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                <ListTodo className="w-4 h-4" /> Legacy Tasks (no story) ({unassignedTasks.length})
              </h4>
              <p className="text-xs text-amber-600 mb-3">
                These tasks were created without a story. Edit them to move them into a story, or delete them.
              </p>
              <div className="space-y-2">
                {unassignedTasks.map((task) => (
                  <UnassignedTaskRow key={task._id} task={task}
                    onEdit={() => openEditTask(task)} onDelete={() => handleTaskDelete(task._id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Story dialog */}
      <AddNewStory showDialog={showStoryDialog} setShowDialog={setShowStoryDialog}
        handleSubmit={handleStorySubmit} storyFormData={storyFormData}
        currentEditedStoryId={currentEditedStoryId} setCurrentEditedStoryId={setCurrentEditedStoryId} />

      {/* Add / Edit Task dialog — tasks can only be created under a story */}
      <Dialog open={showTaskDialog} onOpenChange={(open) => !open && setShowTaskDialog(false)}>
        <DialogContent className="sm:max-w-screen h-auto w-[520px] bg-blue-100 border-2 border-blue-500">
          <DialogTitle>
            {editingTask
              ? `Edit Task`
              : `Add Task to story: "${taskTargetStory?.title}"`}
          </DialogTitle>
          <form onSubmit={taskForm.handleSubmit(handleTaskSubmit)} className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Title *</label>
              <Input {...taskForm.register('title', { required: true })} placeholder="Task title" className="bg-slate-200 border-0" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
              <Input {...taskForm.register('description')} placeholder="Task description" className="bg-slate-200 border-0" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Priority</label>
              <Select value={taskForm.watch('priority')} onValueChange={(v) => taskForm.setValue('priority', v)}>
                <SelectTrigger className="bg-slate-200 border-0 h-11"><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent className="bg-white">
                  {priorityOptions.map((p) => (<SelectItem key={p} value={p} className="capitalize cursor-pointer">{p}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Assign To</label>
              <Select value={taskForm.watch('assignedTo')} onValueChange={(v) => taskForm.setValue('assignedTo', v)}>
                <SelectTrigger className="bg-slate-200 border-0 h-11"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="" className="cursor-pointer">Unassigned</SelectItem>
                  {members.map((m) => (<SelectItem key={m.userId} value={m.userId} className="cursor-pointer">{m.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500 italic">Status is locked to <strong>To Do</strong> until the task is added to an active sprint.</p>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-colors">
              {editingTask ? 'Save Changes' : 'Add Task'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Team panel ────────────────────────────────────────────────────────────────
const TeamPanel = ({ members, memberEmail, setMemberEmail, memberAlert, memberLoading, onAdd, onRemove, currentUserId }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
      <Users className="w-5 h-5 text-indigo-500" /> Project Team ({members.length})
    </h2>

    {/* Add member */}
    <div className="flex gap-2">
      <Input
        placeholder="Enter team member's email address"
        value={memberEmail}
        onChange={(e) => setMemberEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
        className="flex-1 bg-gray-50"
      />
      <button
        onClick={onAdd}
        disabled={memberLoading || !memberEmail.trim()}
        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
      >
        <UserPlus className="w-4 h-4" /> {memberLoading ? 'Adding…' : 'Add'}
      </button>
    </div>

    {memberAlert.msg && (
      <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
        memberAlert.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        <AlertCircle className="w-4 h-4 shrink-0" /> {memberAlert.msg}
      </div>
    )}

    {/* Member list */}
    <div className="space-y-2">
      {members.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No team members yet.</p>
      ) : (
        members.map((m) => (
          <div key={m.userId} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
              {m.name ? m.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
              <p className="text-xs text-gray-400 truncate">{m.email}</p>
            </div>
            {m.role === 'owner' ? (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" /> Owner
              </span>
            ) : (
              <button onClick={() => onRemove(m.userId)}
                className="text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors">
                Remove
              </button>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

// ── Unassigned task row ───────────────────────────────────────────────────────
const priorityColorMap = {
  high:   'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low:    'text-emerald-600 bg-emerald-50 border-emerald-200',
};

const UnassignedTaskRow = ({ task, onEdit, onDelete }) => (
  <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2 text-xs">
    <span className="flex-1 font-medium text-gray-800 truncate">{task.title}</span>
    {task.assignedToName && (
      <span className="text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">{task.assignedToName}</span>
    )}
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold shrink-0 ${priorityColorMap[task.priority] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
      <Flag className="w-3 h-3" /> {task.priority || 'normal'}
    </span>
    <button onClick={onEdit} className="p-1 text-gray-400 hover:text-emerald-600 rounded transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
    <button onClick={onDelete} className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
  </div>
);

export default ProjectDetailPage;
