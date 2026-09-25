import { useContext, useEffect, useState } from 'react';
import AddNewTask from '@/components/tasks/add-new-task';
import { TaskManagerContext } from '@/context';
import {
  addNewTaskApi,
  daleteTaskApi,
  getAllProjectsApi,
  getAllTaskApi,
  updateTaskApi,
} from '@/services';
import { Skeleton } from '@/components/ui/skeleton';
import TaskItem from '@/components/tasks/task-item';
import { Briefcase, Filter, Plus, ListTodo } from 'lucide-react';

function TasksPage() {
  const [showDialog, setShowDialog] = useState(false);

  const {
    taskList,
    setTaskList,
    projectList,
    setProjectList,
    loading,
    setLoading,
    user,
    taskFormData,
    currentEditedId,
    setCurrentEditedId,
    selectedProjectId,
    setSelectedProjectId,
  } = useContext(TaskManagerContext);

  const fetchListOfProjects = async () => {
    if (!user?._id) return;
    try {
      const result = await getAllProjectsApi(user._id);
      if (result?.success) {
        setProjectList(result.projectsList || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchListOfTasks = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const result = await getAllTaskApi(
        user._id,
        selectedProjectId !== 'all' ? selectedProjectId : null
      );
      if (result?.success) {
        setTaskList(result.tasksList || []);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (getData) => {
    setLoading(true);
    try {
      const payload = {
        ...getData,
        userId: user?._id,
      };

      const response =
        currentEditedId !== null
          ? await updateTaskApi({
              ...payload,
              _id: currentEditedId,
            })
          : await addNewTaskApi(payload);

      if (response?.success) {
        fetchListOfTasks();
        taskFormData.reset();
        setCurrentEditedId(null);
        setShowDialog(false);
      }
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const result = await daleteTaskApi(taskId);
      if (result?.success) {
        fetchListOfTasks();
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchListOfProjects();
      fetchListOfTasks();
    }
  }, [user, selectedProjectId]);

  const activeProject = projectList.find((p) => p._id === selectedProjectId);

  if (loading && taskList.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="w-full h-16 rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-blue-600" />
            Task Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {activeProject
              ? `Showing tasks for project: "${activeProject.name}"`
              : 'Showing all tasks across all projects'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Project Filter Selector */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-sm">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600">Filter Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-blue-700 outline-none cursor-pointer"
            >
              <option value="all">All Projects</option>
              {projectList.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add New Task Button */}
          <button
            onClick={() => {
              taskFormData.reset({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                projectId: selectedProjectId !== 'all' ? selectedProjectId : '',
              });
              setCurrentEditedId(null);
              setShowDialog(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Task
          </button>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="mt-2 flex flex-col">
        {taskList.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {taskList.map((taskItem) => (
              <TaskItem
                key={taskItem._id}
                item={taskItem}
                setShowDialog={setShowDialog}
                taskFormData={taskFormData}
                setCurrentEditedId={setCurrentEditedId}
                handleDelete={handleDelete}
                projectList={projectList}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center gap-3">
            <Briefcase className="w-12 h-12 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">No Tasks Found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {selectedProjectId !== 'all'
                ? 'There are no tasks assigned to this project yet.'
                : 'You have not added any tasks yet.'}
            </p>
          </div>
        )}

        <AddNewTask
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          handleSubmit={handleSubmit}
          taskFormData={taskFormData}
          currentEditedId={currentEditedId}
          setCurrentEditedId={setCurrentEditedId}
          projectList={projectList}
        />
      </div>
    </div>
  );
}

export default TasksPage;
