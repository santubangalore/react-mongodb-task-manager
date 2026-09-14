
import CommonButton from '@/components/common-button'
import CommonCard from '@/components/common-card'
import { Button } from '@/components/ui/button'
import React from 'react'

const TaskItem = ({item}) => {
  return (
      <CommonCard 
       title={item.title}
       description={item?.status}
       headerRightContent={''}
       cardContent ={''}
       footerContent={<div className='flex w-full justify-between items-center '>
            <CommonButton buttonText={'Edit'} bgcolor={'bg-green-500'} />
            <CommonButton buttonText={'Delete'} bgcolor={'bg-red-800'}/>
           
       </div>}
      >

      </CommonCard>
  )
}

export default TaskItem
