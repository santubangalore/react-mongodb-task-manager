import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'

const CommonCard = ({title,description,headerRightContent,cardContent,footerContent,extraTextStyles}) => {
  return (
    <Card className="flex bg-slate-100 flex-col gap-6 rounded-md p-8 transition duration-300 hover:bg-white
     hover:shadow-2xl hover:shadow-gray-600/10 cursor-pointer">
        <CardHeader className="p-0">
            <div className='flex justify-between'> 
                {
                    title? <CardTitle className={`text-xl max-w-[250px] text-ellipsis overflow-hidden 
                        whitespace-nowrap font-semibold text-gray-900 ${extraTextStyles?extraTextStyles:''}`}>
                        {title}</CardTitle>:null
                }
                {
                    headerRightContent? headerRightContent:null
                }
            </div>
            <div className='flex justify-start'>
                {
                    description? <CardDescription className={'mt-3 text-gray-600'}>{description}</CardDescription> :null
                }

            </div>
        </CardHeader>
        {
            cardContent?<CardContent className="p-1 rounded-sm">{cardContent}</CardContent>:null
        }
        <CardFooter >{footerContent}</CardFooter>
    </Card>
  )
}

export default CommonCard
