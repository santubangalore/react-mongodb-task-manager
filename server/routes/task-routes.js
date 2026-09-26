const express = require("express");
const taskRouter = express.Router();

const {
  getAllTasks,
  getTasksByProjectId,
  getTasksByStoryId,
  getTasksAssignedToUser,
  addNewTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
  flagTask,
  batchAssignTasksToSprint,
} = require("../controllers/task-controller");

taskRouter.post("/add-new-task", addNewTask);
taskRouter.get("/get-all-task-by-userId/:id", getAllTasks);
taskRouter.get("/get-all-task-by-projectId/:projectId", getTasksByProjectId);
taskRouter.get("/get-all-task-by-storyId/:storyId", getTasksByStoryId);
taskRouter.get("/get-tasks-assigned-to/:userId", getTasksAssignedToUser);
taskRouter.delete("/delete-task/:Id", deleteTask);
taskRouter.put("/update-task", updateTask);
taskRouter.patch("/update-task-status", updateTaskStatus);
taskRouter.patch("/flag-task", flagTask);
taskRouter.post("/batch-assign-to-sprint", batchAssignTasksToSprint);

module.exports = taskRouter;
