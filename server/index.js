
const express= require("express");
require("./database");

const app = express();

const port =process.env.PORT|| 5000;

app.use("/api",(req,res)=>{
    res.status(200).json({message:'Hello Express'})
})


app.listen(port,()=>  console.log("App is running in port 5000"));


