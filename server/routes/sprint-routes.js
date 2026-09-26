const express = require("express");
const sprintRouter = express.Router();

const {
  addNewSprint,
  getSprintsByProject,
  getSprintById,
  updateSprint,
  startSprint,
  closeSprint,
  addTaskToSprint,
  removeTaskFromSprint,
  getActiveSprintByProject,
  deleteSprint,
  getSprintHistory,
} = require("../controllers/sprint-controller");

sprintRouter.post("/add-new-sprint", addNewSprint);
sprintRouter.get("/get-sprints-by-project/:projectId", getSprintsByProject);
sprintRouter.get("/get-sprint/:id", getSprintById);
sprintRouter.put("/update-sprint", updateSprint);
sprintRouter.patch("/start-sprint/:id", startSprint);
sprintRouter.patch("/close-sprint/:id", closeSprint);
sprintRouter.post("/add-task-to-sprint", addTaskToSprint);
sprintRouter.patch("/remove-task-from-sprint/:taskId", removeTaskFromSprint);
sprintRouter.get("/get-active-sprint/:projectId", getActiveSprintByProject);
sprintRouter.delete("/delete-sprint/:Id", deleteSprint);
sprintRouter.get("/get-sprint-history/:projectId", getSprintHistory);

module.exports = sprintRouter;
