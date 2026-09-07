import CommonForm from '@/components/common-form'
import { useForm} from 'react-hook-form'
import { SignUpFormControls } from '@/config';
import { callRegisterUserApi } from '@/services';
import  { useNavigate } from 'react-router-dom';

const SignUp = () => {
 const formData= useForm({
  defaultValues:{
    name:'',
    email:'',
    password:''
  }
 })

const navigate= useNavigate();

 async function handleSubmit(data,e){
 // console.log('Form Data:',data);
  const response = await callRegisterUserApi(data);
  console.log('API Response:',response);
  if( response.success){
     // Reset the form fields after successful submission
     //formData.reset();
     navigate('/tasks/list');
  }
 }


  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] bg-linear-to-b from-purple-500 via-red-500 to-yellow-500 w-[400px] mx-auto p-6 rounded-lg shadow-md">
      <CommonForm form={formData} handleSubmit={handleSubmit} formControls={SignUpFormControls} buttonText={'Sign Up'} />
    </div>
  )
}

export default SignUp
