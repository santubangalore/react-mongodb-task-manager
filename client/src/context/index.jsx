import { createContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { callUserAuthApi } from '@/services';
import { useForm } from 'react-hook-form';

export const TaskManagerContext = createContext({});

function TaskManagerProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [currentEditedProjectId, setCurrentEditedProjectId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("all");

  const navigate = useNavigate();
  const loc = useLocation();

  const taskFormData = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: '',
      userId: '',
      priority: '',
      projectId: ''
    }
  });

  const projectFormData = useForm({
    defaultValues: {
      name: '',
      description: '',
      client: '',
      manager: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'In Progress'
    }
  });

  useEffect(() => {
    const verifyUserCookie = async () => {
      const data = await callUserAuthApi();
      if (data?.success) {
        setUser(data?.userInfo);
      }
      return data?.success
        ? (loc.pathname === '/auth' || loc.pathname === '/')
          ? navigate('/projects')
          : navigate(`${loc.pathname}`)
        : navigate('/auth');
    };

    verifyUserCookie();
  }, [navigate, loc.pathname]);

  return (
    <TaskManagerContext.Provider
      value={{
        user,
        setUser,
        taskFormData,
        projectFormData,
        taskList,
        setTaskList,
        projectList,
        setProjectList,
        loading,
        setLoading,
        currentEditedId,
        setCurrentEditedId,
        currentEditedProjectId,
        setCurrentEditedProjectId,
        selectedProjectId,
        setSelectedProjectId
      }}
    >
      {children}
    </TaskManagerContext.Provider>
  );
}

export default TaskManagerProvider;
