
import { Button } from "../ui/button"

const CommonButton = ({onClick,buttonText, type, disabled}) => {
  return (
      <Button  onClick={onClick||null} 
      type={type||'submit'} 
      disabled={disabled||false} className="flex h-10 justify-center items-center 
      px-5 bg-black font-extrabold text-white hover:text-white">
        {buttonText}</Button>
  )
}

export default CommonButton
