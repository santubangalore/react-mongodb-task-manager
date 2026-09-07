import {createContext,useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { callUserAuthApi } from '@/services';


export const TaskManagerContext = createContext({});

function TaskManagerProvider({ children }) {
    const [user, setUser] = useState(null);
  
    const navigate=useNavigate();
    const loc=useLocation();

    useEffect(() => {

      const verifyUserCookie=async () => {
        const data= await callUserAuthApi();
        if(data?.success){
          setUser(data?.userInfo);
          console.log('User Auth Data:',data);
        }
        return data?.success? navigate('/tasks/list'): navigate('/auth');    
      }

      verifyUserCookie();
    }, [navigate, loc.pathname]);

    return (
    <TaskManagerContext.Provider >
      {children}
    </TaskManagerContext.Provider>
  );

}

export default  TaskManagerProvider ;
