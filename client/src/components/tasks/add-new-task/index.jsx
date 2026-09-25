
import CommonDialog from '@/components/common-dialog'
import {addNewTaskFormControls} from '@/config';




const AddNewTask = ({showDialog, setShowDialog, handleSubmit,taskFormData,currentEditedId,setCurrentEditedId}) => {

  console.log('cuurentEditedId:',currentEditedId)
  const title=(currentEditedId===null)?"Add new":"Edit Task";
  return (
    <CommonDialog 
        showDialog={showDialog}
        onOpenChange={()=>{setShowDialog(false);
          currentEditedId?taskFormData.reset():null;
          setCurrentEditedId(null)
        }}
        btnText={'Add'}
        title={title}
        formControls={addNewTaskFormControls}
        handleSubmit={handleSubmit}
        formData={taskFormData}
    />
  )
}

export default AddNewTask
