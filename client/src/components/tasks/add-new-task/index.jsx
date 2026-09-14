
import CommonDialog from '@/components/common-dialog'
import {addNewTaskFormControls} from '@/config';




const AddNewTask = ({showDialog, setShowDialog, handleSubmit,taskFormData}) => {
   // const [showDialog,setShowDialog]=useState(false);
   


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
