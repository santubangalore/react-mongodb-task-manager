import CommonDialog from '@/components/common-dialog';
import { addNewSprintFormControls } from '@/config';

const AddNewSprint = ({
  showDialog,
  setShowDialog,
  handleSubmit,
  sprintFormData,
  currentEditedSprintId,
  setCurrentEditedSprintId,
}) => {
  const title = currentEditedSprintId ? 'Edit Sprint' : 'Create New Sprint';

  return (
    <CommonDialog
      showDialog={showDialog}
      onOpenChange={() => {
        setShowDialog(false);
        sprintFormData.reset();
        setCurrentEditedSprintId(null);
      }}
      btnText={currentEditedSprintId ? 'Save Changes' : 'Create Sprint'}
      title={title}
      formControls={addNewSprintFormControls}
      handleSubmit={handleSubmit}
      formData={sprintFormData}
    />
  );
};

export default AddNewSprint;
