import { Calendar, User, Building, ListCheck, Edit3, Trash2, ArrowRight, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'On Hold':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Planned':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const ProjectItem = ({
  item,
  setShowDialog,
  handleDelete,
  setCurrentEditedProjectId,
  projectFormData,
  setSelectedProjectId
}) => {
  const navigate = useNavigate();

  const formattedDate = item?.startDate
    ? new Date(item.startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not set';

  const handleEdit = () => {
    setShowDialog(true);
    setCurrentEditedProjectId(item?._id);
    projectFormData.setValue('name', item?.name || '');
    projectFormData.setValue('description', item?.description || '');
    projectFormData.setValue('client', item?.client || '');
    projectFormData.setValue('manager', item?.manager || '');
    projectFormData.setValue(
      'startDate',
      item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : ''
    );
    projectFormData.setValue('status', item?.status || 'In Progress');
  };

  const handleViewTasks = () => {
    setSelectedProjectId(item?._id);
    navigate('/tasks/list');
  };

  const handleViewProject = () => {
    navigate(`/projects/${item?._id}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Header */}
      <div className="p-5 border-b border-gray-100 bg-linear-to-r from-slate-50 to-blue-50/30">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {item?.name}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
              item?.status
            )}`}
          >
            {item?.status || 'In Progress'}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 h-10">
          {item?.description || 'No description provided.'}
        </p>
      </div>

      {/* Details Grid */}
      <div className="p-5 space-y-3 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-medium text-gray-500">Client:</span>
          <span className="font-semibold text-gray-800 truncate">{item?.client || 'N/A'}</span>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="font-medium text-gray-500">Manager:</span>
          <span className="font-semibold text-gray-800 truncate">{item?.manager || 'Unassigned'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-medium text-gray-500">Start Date:</span>
          <span className="font-semibold text-gray-800">{formattedDate}</span>
        </div>

        {/* Task Stats Badge */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-full">
            <ListCheck className="w-4 h-4 text-blue-600" />
            <span>
              Tasks: <strong className="text-blue-900">{item?.tasksCount ?? 0}</strong> numeric tasks
            </span>
            {item?.completedTasksCount !== undefined && (
              <span className="text-xs ml-auto text-emerald-600 font-medium">
                ({item.completedTasksCount} done)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={handleViewProject}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-colors shadow-xs"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Backlog
          </button>
          <button
            onClick={handleViewTasks}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors shadow-xs"
          >
            View Tasks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => handleDelete(item?._id)}
            className="flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectItem;
