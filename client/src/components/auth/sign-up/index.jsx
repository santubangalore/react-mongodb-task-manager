import CommonForm from '@/components/common-form';
import { useForm } from 'react-hook-form';
import { SignUpFormControls } from '@/config';
import { callRegisterUserApi } from '@/services';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { TaskManagerContext } from '@/context';

const SignUp = () => {
  const formData = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const navigate = useNavigate();
  const { verifyUserCookie } = useContext(TaskManagerContext);

  async function handleSubmit(data) {
    const response = await callRegisterUserApi(data);
    if (response?.success) {
      // Registration sets the cookie — fetch user info so context is populated.
      await verifyUserCookie({ redirectIfAuthed: true });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] bg-linear-to-b from-purple-500 via-red-500 to-yellow-500 w-[400px] mx-auto p-6 rounded-lg shadow-md">
      <CommonForm
        form={formData}
        handleSubmit={handleSubmit}
        formControls={SignUpFormControls}
        buttonText="Sign Up"
      />
    </div>
  );
};

export default SignUp;
