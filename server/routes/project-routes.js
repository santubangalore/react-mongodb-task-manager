const express = require("express");
const projectRouter = express.Router();

const {
  addNewProject,
  getAllProjects,
  getProjectDetails,
  updateProject,
  deleteProject,
} = require("../controllers/project-controller");

projectRouter.post("/add-new-project", addNewProject);
projectRouter.get("/get-all-projects-by-userId/:id", getAllProjects);
projectRouter.get("/get-project-details/:id", getProjectDetails);
projectRouter.put("/update-project", updateProject);
projectRouter.delete("/delete-project/:Id", deleteProject);

module.exports = projectRouter;
