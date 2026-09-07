
const express= require("express");
require("./database");
const cors=require("cors");
const cookieParser=require("cookie-parser");

const userRouter = require( './routes/user-route.js');

//https://www.youtube.com/watch?v=dz458ZkBMak&t=32056s


const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow cookies to be sent
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api/user', userRouter);

const port =process.env.PORT|| 5000;

app.use("/api",(req,res)=>{
    res.status(200).json({message:'Hello Express'})
})

app.listen(port,()=>  console.log("App is running in port 5000"));


