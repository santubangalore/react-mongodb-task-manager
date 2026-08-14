
const mongoose= require("mongoose");
const password = encodeURIComponent("Innocent2026");
const username = encodeURIComponent("santutsk_db_user");
const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']); 
mongoose.
connect("mongodb+srv://"+username+":"+password+"@cluster0.ermre31.mongodb.net?appName=Cluster0").
then(()=>
    console.log("Mongo Db connection success")).catch(error=>{
        console.log(error.message);
    })
