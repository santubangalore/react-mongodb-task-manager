import {Form, FormField} from '../ui/form';

//https://www.youtube.com/watch?v=dz458ZkBMak&t=32051s


const CommonForm = ({formControls=[], handleSubmit, form, buttonText}) => {
  return (
        <Form >
            <form>
                {
                    formControls.length>0?
                        formControls.map((item,index)=>(
                         <FormField 
                            control={form.control}
                         />  
                        ))
                    : null
                }

            </form>
        </Form>
    )
}

export default CommonForm
