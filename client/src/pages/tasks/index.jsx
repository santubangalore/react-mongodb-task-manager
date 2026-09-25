
import {useContext, useEffect, useState} from 'react'
import CommonButton from '../../components/common-button';
import AddNewTask from '@/components/tasks/add-new-task';
import {TaskManagerContext} from '@/context';
import {addNewTaskApi,daleteTaskApi, getAllTaskApi } from '@/services';
import { Skeleton } from '@/components/ui/skeleton';
import CommonCard from '@/components/common-card';
import TaskItem from '@/components/tasks/task-item';

function TasksPage() {
  const [showDialog, setShowDialog]=useState(false);
   const {taskList,setTaskList,loading, setLoading,user,taskFormData,
    currentEditedId,setCurrentEditedId} = useContext(TaskManagerContext)
 
   const handleSubmit=async (getData)=>{
        setLoading(true)
        const resposne =await addNewTaskApi({
          ...getData,
          userId:user?._id
        });
        if(resposne){
          setLoading(false);
          fetchListOfTasks();
          taskFormData.reset();
        }
    }

   async function handleDelete(taskId){
     // console.log('taskid:',taskId);
     const result=await daleteTaskApi(taskId);
     console.log(result);
     if(result.success){
      fetchListOfTasks()
     }
   }

   async function fetchListOfTasks(){
      setLoading(true);
      const result=await getAllTaskApi(user?._id);
      console.log(result);
      if(result?.success){
        setTaskList(result.tasksList);
      }
      setLoading(false);
   }

   useEffect(()=>{
     if(user!==null) fetchListOfTasks();
   },[user])

   if(loading) return <Skeleton className="w-full h-[550px] rounded-sm ">Loading</Skeleton>

  return (
    <>
      <div className='mb-5'>
        <CommonButton onClick={()=>setShowDialog(true)} buttonText="Add new Task"  bgcolor={'bg-blue-500'}/>
      </div>
      <div className='mt-5 flex flex-col'>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {
            taskList.length>0?
             taskList.map(taskItem=>(
             <TaskItem item={taskItem}
              setShowDialog={setShowDialog}
              taskFormData={taskFormData}
              setCurrentEditedId={setCurrentEditedId}
              handleDelete={handleDelete}/>
             ))
            :<h2>No Task added!</h2>
          }
        </div>
        <AddNewTask 
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          handleSubmit={handleSubmit}
          taskFormData={taskFormData}
          currentEditedId={currentEditedId}
          setCurrentEditedId={setCurrentEditedId}
        />
        <div>

        </div>
      </div>
    </>
  )
}

export default TasksPage
