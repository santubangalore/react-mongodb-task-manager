//import { FormControl, FormLabel } from 'radix-ui/form';
import {Form, FormField, FormItem,FormControl} from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectTrigger } from '../ui/select';
import CommonButton from '../commonbutton';

//https://www.youtube.com/watch?v=dz458ZkBMak&t=32051s


const CommonForm = ({formControls=[], handleSubmit, form, buttonText}) => {
  return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
                {
                    formControls.length>0?
                        formControls.map((item,index)=>(
                         <FormField 
                            control={form.control}
                            name={item.id}
                            render={({field})=>{
                                return (
                                <FormItem key={index} className="flex flex-col gap-2">
                                   <label className="justify-start items-start text-left text-[14px] font-semibold text-gray-700">{item.label}</label>
                                    {item.componentType==='input'?
                                      <FormControl >
                                        <Input placeholder={item.placeholder} type={item.type}  
                                                {...field}
                                                className="w-full rounded-lg h-[50px] border-none text-black 
                                                bg-gray-200 text-[14px] drop-shadow-sm outline-none transiton-all duration-300
                                                 focus:ring-2 focus:ring-blue-500 focus:drop-shadow-lg
                                                  focus-visible:ring-offset-0"/>
                                       </FormControl>
                                    : item.componentType==='select'?
                                      <Select>
                                        <FormControl>
                                            <SelectTrigger className="w-full rounded-xl h-[50px] border-none text-black 
                                                bg-gray-200 text-[14px] drop-shadow-sm outline-none transiton-all duration-300
                                                 focus:ring-2 focus:ring-blue-500 focus:drop-shadow-lg focus-visible:ring-offset-0">
                                                Select an option
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white ">
                                            {
                                                item.options.map((option, index)=>(
                                                    <SelectItem className="cursor-pointer text-black" 
                                                    key={index} value={option.value}>{option.label}</SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                      </Select>
                                      :null
                                    }  
                                </FormItem>
                                )
                            }}
                            />
                        ))
                   : null
                }
                <div className="flex justify-center mt-4">
                    <CommonButton onClick={handleSubmit} type={'submit'} buttonText={buttonText||'Submit'} />

                </div>
            </form>
        </Form>
    )
}

export default CommonForm
