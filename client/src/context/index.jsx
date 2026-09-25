import {createContext,useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { callUserAuthApi } from '@/services';
import { useForm } from 'react-hook-form';

export const TaskManagerContext = createContext({});

function TaskManagerProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading]= useState(false);
    const [taskList,setTaskList]= useState([]);
    const [currentEditedId,setCurrentEditedId]=useState(null);

    const navigate=useNavigate();
    const loc=useLocation();
    const taskFormData= useForm({
    defaultValues:{
    title:'',
    description:'',
    status:'',
    userId:'',
    priority:''    
    }
  });

   useEffect(() => {

      const verifyUserCookie=async () => {
        const data= await callUserAuthApi();
        if(data?.success){
          setUser(data?.userInfo);
          console.log('User Auth Data:',data);
        }
        return data?.success? (location.pathname==='auth' || location.pathname==='/') ? navigate('/tasks/list'): navigate(`${location.pathname}`) : navigate('/auth');    
      }

      verifyUserCookie();
    }, [navigate, loc.pathname]);

    return (
    <TaskManagerContext.Provider value={{user, setUser,
      taskFormData,setTaskList,
      taskList, loading,
      setLoading,currentEditedId,
      setCurrentEditedId}}>
      {children}
    </TaskManagerContext.Provider>
  );

}

export default  TaskManagerProvider ;
