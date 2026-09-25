
import React from 'react'
import { DialogTitle,Dialog, DialogContent } from '../ui/dialog'
import CommonForm from '../common-form'

const CommonDialog = ({showDialog,onOpenChange,title,formControls,formData,btnText,handleSubmit}) => {
  console.log(title)
  return (
    <Dialog open={showDialog} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-screen h-[480px] w-[600px] overflow-hidden bg-blue-100 border border-2 border-blue-500">
            <DialogTitle>{title}</DialogTitle>
            <div >
                <CommonForm
                 formControls={formControls}
                 form={formData}
                 handleSubmit={handleSubmit}
                 buttonText={btnText}
                />
            </div>
        </DialogContent>
    </Dialog>
  )
}

export default CommonDialog
