import CommonDialog from '@/components/common-dialog';
import { addNewTaskFormControls } from '@/config';

const AddNewTask = ({
  showDialog,
  setShowDialog,
  handleSubmit,
  taskFormData,
  currentEditedId,
  setCurrentEditedId,
  projectList = [],
}) => {
  const title = currentEditedId === null ? "Add New Task" : "Edit Task";

  // Dynamically include project options in task form controls
  const projectOptions = [
    { id: "", label: "No Project (General Task)" },
    ...projectList.map((p) => ({ id: p._id, label: p.name })),
  ];

  const updatedControls = [
    ...addNewTaskFormControls,
    {
      id: "projectId",
      placeholder: "Select Project",
      label: "Associated Project",
      componentType: "select",
      options: projectOptions,
    },
  ];

  return (
    <CommonDialog
      showDialog={showDialog}
      onOpenChange={() => {
        setShowDialog(false);
        if (currentEditedId) taskFormData.reset();
        setCurrentEditedId(null);
      }}
      btnText={currentEditedId === null ? "Add Task" : "Save Changes"}
      title={title}
      formControls={updatedControls}
      handleSubmit={handleSubmit}
      formData={taskFormData}
    />
  );
};

export default AddNewTask;
