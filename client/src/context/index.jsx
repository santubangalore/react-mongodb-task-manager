import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callUserAuthApi } from '@/services';
import { useForm } from 'react-hook-form';

export const TaskManagerContext = createContext({});

function TaskManagerProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Task / Project lists
  const [taskList, setTaskList] = useState([]);
  const [projectList, setProjectList] = useState([]);

  // Story / Sprint lists (populated per-project in detail pages)
  const [storyList, setStoryList] = useState([]);
  const [sprintList, setSprintList] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);

  // Edit IDs
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [currentEditedProjectId, setCurrentEditedProjectId] = useState(null);
  const [currentEditedStoryId, setCurrentEditedStoryId] = useState(null);
  const [currentEditedSprintId, setCurrentEditedSprintId] = useState(null);

  // Cross-page filter
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  const navigate = useNavigate();

  // ── Form instances ──────────────────────────────────────────────────────────
  const taskFormData = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      projectId: '',
      storyId: '',
    },
  });

  const projectFormData = useForm({
    defaultValues: {
      name: '',
      description: '',
      client: '',
      manager: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'In Progress',
    },
  });

  const storyFormData = useForm({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const sprintFormData = useForm({
    defaultValues: {
      name: '',
      goal: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  // ── Auth verification ───────────────────────────────────────────────────────
  const verifyUserCookie = async ({ redirectIfAuthed = false } = {}) => {
    try {
      const data = await callUserAuthApi();
      if (data?.success && data?.userInfo) {
        setUser(data.userInfo);
        if (redirectIfAuthed) {
          navigate('/projects');
        }
        return data.userInfo;
      } else {
        setUser(null);
        navigate('/auth');
        return null;
      }
    } catch {
      setUser(null);
      navigate('/auth');
      return null;
    }
  };

  useEffect(() => {
    // On first mount: verify the cookie.
    // If already on a protected page (page refresh), stay put.
    // If on /auth or /, redirect to /projects after successful auth.
    const currentPath = window.location.pathname;
    const isPublicPath = currentPath === '/auth' || currentPath === '/';
    verifyUserCookie({ redirectIfAuthed: isPublicPath });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TaskManagerContext.Provider
      value={{
        // Auth
        user,
        setUser,
        verifyUserCookie,
        loading,
        setLoading,

        // Data lists
        taskList,
        setTaskList,
        projectList,
        setProjectList,
        storyList,
        setStoryList,
        sprintList,
        setSprintList,
        activeSprint,
        setActiveSprint,

        // Form instances
        taskFormData,
        projectFormData,
        storyFormData,
        sprintFormData,

        // Edit IDs
        currentEditedId,
        setCurrentEditedId,
        currentEditedProjectId,
        setCurrentEditedProjectId,
        currentEditedStoryId,
        setCurrentEditedStoryId,
        currentEditedSprintId,
        setCurrentEditedSprintId,

        // Filter
        selectedProjectId,
        setSelectedProjectId,
      }}
    >
      {children}
    </TaskManagerContext.Provider>
  );
}

export default TaskManagerProvider;
