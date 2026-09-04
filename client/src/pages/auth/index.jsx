import {useState} from 'react'
import SignIn from '@/components/auth/sign-in';
import SignUp from '@/components/auth/sign-up';
import CommonButton from '@/components/commonbutton';


function AuthPage() {
    const [isLoginView,setIsLoginview] = useState(false);

  return (
    <div className='flex flex-auto flex-col min-h-screen h-full'>
      <div className='flex h-full flex-col justify-content items-center'>
        <h2 className='text-3xl font-bold mt-8'>Welcome </h2>
        <div className=' mb-4 mt-2'>
        {
            isLoginView ? <SignIn />:<SignUp />
        }
        </div>
        <CommonButton onClick={()=>setIsLoginview(!isLoginView)} type={'submit'} 
            buttonText={isLoginView? 'Switch to signup':'Switch to Login'}
        />
      </div>
    </div>
  )
}

export default AuthPage
