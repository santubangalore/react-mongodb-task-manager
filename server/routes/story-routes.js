const express = require("express");
const storyRouter = express.Router();

const {
  addNewStory,
  getStoriesByProject,
  getStoryById,
  updateStory,
  deleteStory,
} = require("../controllers/story-controller");

storyRouter.post("/add-new-story", addNewStory);
storyRouter.get("/get-stories-by-project/:projectId", getStoriesByProject);
storyRouter.get("/get-story/:id", getStoryById);
storyRouter.put("/update-story", updateStory);
storyRouter.delete("/delete-story/:Id", deleteStory);

module.exports = storyRouter;
