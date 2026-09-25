import CommonDialog from '@/components/common-dialog';
import { addNewProjectFormControls } from '@/config';

const AddNewProject = ({
  showDialog,
  setShowDialog,
  handleSubmit,
  projectFormData,
  currentEditedProjectId,
  setCurrentEditedProjectId,
}) => {
  const title = currentEditedProjectId === null ? "Add New Project" : "Edit Project";

  return (
    <CommonDialog
      showDialog={showDialog}
      onOpenChange={() => {
        setShowDialog(false);
        if (currentEditedProjectId) projectFormData.reset();
        setCurrentEditedProjectId(null);
      }}
      btnText={currentEditedProjectId === null ? "Create Project" : "Save Changes"}
      title={title}
      formControls={addNewProjectFormControls}
      handleSubmit={handleSubmit}
      formData={projectFormData}
    />
  );
};

export default AddNewProject;
