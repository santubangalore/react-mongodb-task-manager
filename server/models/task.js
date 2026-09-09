const { string } = require("joi");
const mongoose = require ("mongoose");

const TaskSchema= mongoose.Schema({
    title:String,
    description:String,
    status:String,
    userId:String,
    priority:String

})

const Task= mongoose.models.Task || mongoose.Model("Task",TaskSchema);

module.exports=Task;