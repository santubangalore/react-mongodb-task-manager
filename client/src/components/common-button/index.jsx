
import { Button } from "../ui/button"

const CommonButton = ({onClick,buttonText, type,bgcolor, disabled}) => {
  return (
      <Button  onClick={onClick||null} 
      type={type||'submit'} 
      disabled={disabled||false} className={`flex h-10 justify-center items-center 
      px-5  font-extrabold text-white hover:text-white ${bgcolor} cursor-pointer`}>
        {buttonText}</Button>
  )
}

export default CommonButton
