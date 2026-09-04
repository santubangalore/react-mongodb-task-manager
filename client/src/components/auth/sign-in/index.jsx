
import {useForm} from 'react-hook-form'
import CommonForm from '@/components/common-form'
import { SignInFormControls } from '@/config';

const SignIn = () => {
  const formData= useForm({
    defaultValues:{
    email:'',
    password:''
  }
 })

  function handleSubmit(data){
  console.log('Form Data:', data);
 }

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] bg-slate-100 w-[400px] mx-auto p-6 rounded-lg shadow-md">
      <CommonForm form={formData} handleSubmit={handleSubmit} formControls={SignInFormControls} buttonText={'Sign In'} />
    </div>
  )
}

export default SignIn
