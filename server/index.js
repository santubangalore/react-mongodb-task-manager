
const express= require("express");
require("./database");
const cors=require("cors");
const cookieParser=require("cookie-parser");

const userRouter = require( './routes/user-route.js');
const taskRouter = require( './routes/task-routes.js');
const projectRouter = require('./routes/project-routes.js');
const storyRouter = require('./routes/story-routes.js');
const sprintRouter = require('./routes/sprint-routes.js');

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174','http://localhost:5175'], // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true, // Allow cookies to be sent
}));

app.use(cookieParser());
app.use(express.json());
app.use('/api/user', userRouter);
app.use('/api/task', taskRouter);
app.use('/api/project', projectRouter);
app.use('/api/story', storyRouter);
app.use('/api/sprint', sprintRouter);


const port =process.env.PORT|| 5000;

app.use("/api",(req,res)=>{
    res.status(200).json({message:'Hello Express'})
})

app.listen(port,()=>  console.log("App is running in port 5000"));


