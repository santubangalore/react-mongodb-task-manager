
const express= require("express");
const taskRouter= express.Router();

const {
  getAllTasks,
  addNewTask,
  deleteTask,
  updateTask,
} = require("../controllers/task-controller");

taskRouter.post("/add-new-task",addNewTask);
taskRouter.get("/get-all-task-by-userId",getAllTasks);
taskRouter.post("/delete-task",deleteTask);
taskRouter.put("/delete-task",deleteTask);


module.exports= taskRouter;
