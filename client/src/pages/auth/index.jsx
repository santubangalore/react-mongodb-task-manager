import {useState} from 'react'
import SignIn from '@/components/auth/sign-in';
import SignUp from '@/components/auth/sign-up';
import CommonButton from '@/components/commonbutton';


function AuthPage() {
    const [isLoginView,setIsLoginview] = useState(false);

  return (
    <div className='flex flex-auto flex-col min-h-screen h-full'>
        <div className='flex h-full flex-col justify-content items-center'>
      <h2 className='text-2xl font-bold'>Auth page</h2>
      <div className='mt-4 mb-3 '>
        {
            isLoginView ? <SignIn />:<SignUp />
        }
        </div>
        <CommonButton onClick={()=>setIsLoginview(!isLoginView)} type={'submit'} 
            buttonText={isLoginView? 'Switch to signup':'Switch to Login'}>
        </CommonButton>
      </div>
    </div>
  )
}

export default AuthPage
