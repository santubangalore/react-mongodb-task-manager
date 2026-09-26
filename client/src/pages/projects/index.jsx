import { useContext, useEffect, useState } from 'react';
import CommonButton from '@/components/common-button';
import AddNewProject from '@/components/projects/add-new-project';
import ProjectItem from '@/components/projects/project-item';
import { TaskManagerContext } from '@/context';
import {
  addNewProjectApi,
  deleteProjectApi,
  getAllProjectsApi,
  updateProjectApi,
} from '@/services';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderPlus, Search, Briefcase, CheckCircle2, Clock, ListChecks } from 'lucide-react';

function ProjectsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const {
    projectList,
    setProjectList,
    loading,
    setLoading,
    user,
    projectFormData,
    currentEditedProjectId,
    setCurrentEditedProjectId,
    setSelectedProjectId,
  } = useContext(TaskManagerContext);

  const fetchListOfProjects = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const result = await getAllProjectsApi(user._id);
      if (result?.success) {
        setProjectList(result.projectsList || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (getData) => {
    if (!user?._id) {
      console.error('handleSubmit: user not loaded yet');
      return;
    }
    setLoading(true);

    try {
      const payload = {
        ...getData,
        userId: user?._id,
      };

      const response =
        currentEditedProjectId !== null
          ? await updateProjectApi({
              ...payload,
              _id: currentEditedProjectId,
            })
          : await addNewProjectApi(payload);

      if (response?.success) {
        fetchListOfProjects();
        projectFormData.reset();
        setCurrentEditedProjectId(null);
        setShowDialog(false);
      }
    } catch (err) {
      console.error('Failed to submit project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? Associated tasks will also be removed.')) {
      return;
    }
    setLoading(true);
    try {
      const result = await deleteProjectApi(projectId);
      if (result?.success) {
        fetchListOfProjects();
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchListOfProjects();
    }
  }, [user]);

  // Derived stats
  const totalProjects = projectList.length;
  const inProgressCount = projectList.filter((p) => p.status === 'In Progress').length;
  const completedCount = projectList.filter((p) => p.status === 'Completed').length;
  const totalTasksCount = projectList.reduce((acc, curr) => acc + (curr.tasksCount || 0), 0);

  // Filtered list
  const filteredProjects = projectList.filter((project) => {
    const matchesQuery =
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.manager?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  if (loading && projectList.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="w-full h-24 rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header Banner & Key Metrics */}
      <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Project Dashboard</h1>
            <p className="text-blue-100 text-sm mt-1">
              Manage your company projects, track progress, and organize numeric tasks seamlessly.
            </p>
          </div>
          <button
            onClick={() => {
              projectFormData.reset({
                name: '',
                description: '',
                client: '',
                manager: '',
                startDate: new Date().toISOString().split('T')[0],
                status: 'In Progress',
              });
              setCurrentEditedProjectId(null);
              setShowDialog(true);
            }}
            className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-3 rounded-xl shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer"
          >
            <FolderPlus className="w-5 h-5 text-blue-600" />
            Start New Project
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">Total Projects</p>
              <p className="text-xl font-bold">{totalProjects}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">In Progress</p>
              <p className="text-xl font-bold">{inProgressCount}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">Completed</p>
              <p className="text-xl font-bold">{completedCount}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-lg">
              <ListChecks className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs text-blue-100 font-medium">Total Tasks</p>
              <p className="text-xl font-bold">{totalTasksCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects by name, client, manager..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['ALL', 'In Progress', 'Planned', 'On Hold', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((projectItem) => (
            <ProjectItem
              key={projectItem._id}
              item={projectItem}
              setShowDialog={setShowDialog}
              projectFormData={projectFormData}
              setCurrentEditedProjectId={setCurrentEditedProjectId}
              handleDelete={handleDelete}
              setSelectedProjectId={setSelectedProjectId}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center gap-3">
          <Briefcase className="w-12 h-12 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700">No Projects Found</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No projects match your search or filter criteria.'
              : 'You haven’t created any projects yet. Click "Start New Project" to get started!'}
          </p>
        </div>
      )}

      {/* Modal Dialog */}
      <AddNewProject
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        handleSubmit={handleSubmit}
        projectFormData={projectFormData}
        currentEditedProjectId={currentEditedProjectId}
        setCurrentEditedProjectId={setCurrentEditedProjectId}
      />
    </div>
  );
}

export default ProjectsPage;
