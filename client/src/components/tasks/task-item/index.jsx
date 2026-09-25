
import CommonButton from '@/components/common-button'
import CommonCard from '@/components/common-card'
import { Button } from '@/components/ui/button'
import React from 'react'

const TaskItem = ({item,setShowDialog,handleDelete,setCurrentEditedId,taskFormData}) => {

  return (
      <CommonCard 
       title={item.title}
       description={item?.status}
       headerRightContent={''}
       cardContent ={''}
       footerContent={<div className='flex w-full justify-between items-center '>
            <CommonButton buttonText={'Edit'} bgcolor={'bg-green-500'} onClick={()=>{setShowDialog(true);
              setCurrentEditedId(item?._id);
              taskFormData.setValue('title',item?.title);
              taskFormData.setValue('description',item?.description);
              taskFormData.setValue('priority',item?.priority);
              taskFormData.setValue('status',item?.status);
              }} />
            <CommonButton buttonText={'Delete'} bgcolor={'bg-red-800'} onClick={()=>handleDelete(item._id)}/>
       </div>}
      >

      </CommonCard>
  )
}

export default TaskItem
