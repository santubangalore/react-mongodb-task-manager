
import { ListTodo, ClipboardList, CheckSquare, LogOut } from 'lucide-react';
import { useContext} from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { callLogoutUserApi } from '@/services';
import { TaskManagerContext } from '@/context';

const Header = () => {
        const {user,setUser} = useContext(TaskManagerContext);

    const navigate=useNavigate();
    async function handleLogout() {

        const ressponse=await callLogoutUserApi();
        if(ressponse?.success){
            setUser(null);
            navigate("/auth");
        }
    }

    return (
        <header className="border-b border-gray-300 ">
            <div className="container mx-auto h-16">
                <div className="flex h-[64px] items-center w-full justify-between">

                    <div className="w-auto flex gap-2 w-[200px] items-center">
                        <ListTodo className="w-[24px] h-[24px] text-blue-500" />
                        <h1 className="text-2xl font-bold text-purple-700">Task Manager</h1>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/tasks/list" className="flex items-center gap-2 text-gray-700 hover:text-blue-500 font-bold text-xl" >Tasks</Link>
                        <Link to="/tasks/scrum-board" className="flex items-center gap-2 text-gray-700 hover:text-blue-500 font-bold text-xl" >Scrum Board</Link>
                    </div>
                    <div className='flex'>
                        <span className='text-sm mr-3 '>{user?.name}</span>
                        <LogOut className="w-6 h-6 text-gray-700 hover:text-blue-500 cursor-pointer"  onClick={handleLogout} />
                    </div>
                </div>

            </div>
        </header>
  )
}

export default Header
