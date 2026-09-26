import { Briefcase, Flag, Edit3, Trash2, User } from 'lucide-react';

const getPriorityBadgeClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':   return 'bg-red-100 text-red-800 border-red-300';
    case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'low':    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    default:       return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'done':
    case 'Completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'inProgress':
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'blocked':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'review':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'todo':
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

const TaskItem = ({
  item,
  setShowDialog,
  handleDelete,
  setCurrentEditedId,
  taskFormData,
  projectList = [],
  readOnly = false,
}) => {
  const associatedProject = projectList.find(
    (p) => p._id.toString() === item?.projectId?.toString()
  );

  const handleEdit = () => {
    if (readOnly || !taskFormData) return;
    setShowDialog(true);
    setCurrentEditedId(item?._id);
    taskFormData.setValue('title',       item?.title       || '');
    taskFormData.setValue('description', item?.description || '');
    taskFormData.setValue('priority',    item?.priority    || '');
    taskFormData.setValue('status',      item?.status      || '');
    taskFormData.setValue('projectId',   item?.projectId   || '');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Section */}
      <div className="p-5 border-b border-gray-100 space-y-3">
        {/* Project Tag */}
        {associatedProject ? (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md max-w-full">
            <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{associatedProject.name}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
            <span>General Task</span>
          </div>
        )}

        <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{item?.title}</h4>
        <p className="text-sm text-gray-600 line-clamp-2 min-h-10">
          {item?.description || 'No description provided.'}
        </p>
      </div>

      {/* Badges Section */}
      <div className="px-5 py-3 flex items-center justify-between gap-2 border-b border-gray-50 bg-slate-50/50">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(item?.status)}`}>
          {item?.status || 'todo'}
        </span>
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(item?.priority)}`}>
          <Flag className="w-3 h-3" />
          {item?.priority || 'Normal'}
        </span>
      </div>

      {/* Assignee row */}
      <div className="px-5 py-2.5 flex items-center gap-2 border-b border-gray-50 bg-white">
        <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        {item?.assignedToName ? (
          <span className="text-xs font-semibold text-indigo-700 truncate">{item.assignedToName}</span>
        ) : (
          <span className="text-xs text-gray-400 italic">Unassigned</span>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 bg-gray-50 flex items-center justify-between gap-2">
        {!readOnly && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        )}
        <button
          onClick={() => handleDelete(item?._id)}
          className={`flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${readOnly ? 'ml-auto' : ''}`}
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
