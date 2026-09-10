
import CommonDialog from '@/components/common-dialog'
import React, { useContext } from 'react'
import {addNewTaskFormControls} from '@/config';
import { useForm } from 'react-hook-form';
import {TaskManagerContext} from '@/context';




const AddNewTask = ({showDialog,setShowDialog}) => {
   // const [showDialog,setShowDialog]=useState(false);
   const {taskFormData} = useContext(TaskManagerContext)
    const handleSubmit=()=>{

    }

  return (
    <CommonDialog 
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        btnText={'Add'}
        title="Add new Task"
        formControls={addNewTaskFormControls}
        handleSubmit={handleSubmit}
        formData={taskFormData}
    />
  )
}

export default AddNewTask
