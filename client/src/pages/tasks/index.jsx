
import {useState} from 'react'
import CommonButton from '../../components/common-button';
import AddNewTask from '@/components/tasks/add-new-task';

function TasksPage() {
  const [showDialog, setShowDialog]=useState(false);

  return (
    <>
      <div className='mb-5'>
        <CommonButton onClick={()=>setShowDialog(true)} buttonText="Add new Task" />
      </div>
      <div className='mt-5 flex flex-col'>
        <div>List of Tasks       
        </div>
        <AddNewTask 
          showDialog={showDialog}
          setShowDialog={setShowDialog}
        />
      </div>
    </>
  )
}

export default TasksPage
