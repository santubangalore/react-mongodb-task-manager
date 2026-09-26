import CommonDialog from '@/components/common-dialog';
import { addNewStoryFormControls } from '@/config';

const AddNewStory = ({
  showDialog,
  setShowDialog,
  handleSubmit,
  storyFormData,
  currentEditedStoryId,
  setCurrentEditedStoryId,
}) => {
  const title = currentEditedStoryId ? 'Edit Story' : 'Add New Story';

  return (
    <CommonDialog
      showDialog={showDialog}
      onOpenChange={() => {
        setShowDialog(false);
        storyFormData.reset();
        setCurrentEditedStoryId(null);
      }}
      btnText={currentEditedStoryId ? 'Save Changes' : 'Create Story'}
      title={title}
      formControls={addNewStoryFormControls}
      handleSubmit={handleSubmit}
      formData={storyFormData}
    />
  );
};

export default AddNewStory;
