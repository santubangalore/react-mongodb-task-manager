import CommonButton from "../common-button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function CommonForm({ formControls = [], handleSubmit, form, buttonText }) {
  return (
    <Form {...form} className="w-full ">
      <form onSubmit={form.handleSubmit(handleSubmit)} >
        {formControls?.length > 0
          ? formControls.map((controlItem,index) => (
              <FormField key={index}
                control={form.control}
                name={controlItem.id}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel className="text-black font-semibold mb-1 mt-2">
                        {controlItem.label}
                      </FormLabel>
                      {controlItem.componentType === "input" ? (
                        <FormControl>
                          <Input
                            placeholder={controlItem.placeholder}
                            type={controlItem.type}
                            {...field}
                            value={field.value} 
                            autoComplete="false"
                            className="w-120 rounded h-[42px] border-1 text-black bg-slate-200 text-[16px] outline-none drop-shadow-sm transition-all
                             duration-300 ease-in-out focus:bg-sale-100 focus:drop-shadow-lg focus-visible:outline-blue focus-visible:ring-0
                              focus-visible:ring-offset-0 mb-3 "
                          />
                        </FormControl>
                      ) : controlItem.componentType === "select" ? (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-120 rounded h-[50px] border-1 text-black bg-slate-200 text-[16px] 
                            outline-none drop-shadow-sm transition-all duration-300 ease-in-out focus:bg-gray-100 focus:drop-shadow-lg focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
                              {field.value ? (
                                <SelectValue
                                  className="text-black focus:text-black  h-[50px]"
                                  placeholder={controlItem.placeholder}
                                />
                              ) : (
                                "Select"
                              )}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            {controlItem.options.map((optionItem) => (
                              <SelectItem
                                value={optionItem.id}
                                className="text-black cursor-pointer focus:text-black "
                              >
                                {optionItem.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                    </FormItem>
                  );
                }}
              />
            ))
          : null}
        <div className="flex justify-center mt-4 items-center">
          <CommonButton type={"submit"} buttonText={buttonText} />
        </div>
      </form>
    </Form>
  );
}

export default CommonForm;