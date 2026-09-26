import { useForm } from 'react-hook-form';
import CommonForm from '@/components/common-form';
import { SignInFormControls } from '@/config';
import { callLoginUserApi } from '@/services';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { TaskManagerContext } from '@/context';

const SignIn = () => {
  const formData = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const navigate = useNavigate();
  const { verifyUserCookie } = useContext(TaskManagerContext);

  async function handleSubmit(data) {
    const response = await callLoginUserApi(data);
    if (response?.success) {
      // After login the JWT cookie is set. Fetch user info from the server
      // so the context has `user` populated before we navigate away.
      await verifyUserCookie({ redirectIfAuthed: true });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] bg-linear-to-b from-purple-500 via-red-500 to-yellow-500 w-[400px] mx-auto p-6 rounded-lg shadow-md">
      <CommonForm
        form={formData}
        handleSubmit={handleSubmit}
        formControls={SignInFormControls}
        buttonText="Sign In"
      />
    </div>
  );
};

export default SignIn;
