const Story = require("../models/story");
const Task = require("../models/task");
const Joi = require("joi");

const storySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  projectId: Joi.string().required(),
  userId: Joi.string().required(),
});

// ─── Helper: recalculate & persist story status based on its tasks ───────────
const recalculateStoryStatus = async (storyId) => {
  const tasks = await Task.find({ storyId });
  if (!tasks.length) {
    await Story.findByIdAndUpdate(storyId, { status: "todo" });
    return "todo";
  }
  const allDone = tasks.every((t) => t.status === "done");
  const anyActive = tasks.some((t) =>
    ["inProgress", "blocked", "review"].includes(t.status)
  );
  const newStatus = allDone ? "done" : anyActive ? "inProgress" : "todo";
  await Story.findByIdAndUpdate(storyId, { status: newStatus });
  return newStatus;
};

// ─── Add a new story ─────────────────────────────────────────────────────────
const addNewStory = async (req, res) => {
  const { title, description, projectId, userId } = req.body;
  const { error } = storySchema.validate({ title, description, projectId, userId });
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  try {
    const newStory = await Story.create({ title, description, projectId, userId });
    return res.status(200).json({ success: true, message: "Story created successfully", story: newStory });
  } catch (err) {
    console.error("addNewStory Error:", err);
    return res.status(500).json({ success: false, message: "Server error while creating story" });
  }
};

// ─── Get all stories for a project ───────────────────────────────────────────
const getStoriesByProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const stories = await Story.find({ projectId }).sort({ createdAt: 1 });
    // Attach task counts to each story
    const tasks = await Task.find({ projectId });
    const enriched = stories.map((story) => {
      const storyTasks = tasks.filter(
        (t) => t.storyId && t.storyId.toString() === story._id.toString()
      );
      const doneTasks = storyTasks.filter((t) => t.status === "done").length;
      return {
        ...story.toObject(),
        tasksCount: storyTasks.length,
        doneTasksCount: doneTasks,
      };
    });
    return res.status(200).json({ success: true, stories: enriched });
  } catch (err) {
    console.error("getStoriesByProject Error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching stories" });
  }
};

// ─── Get a single story with its tasks ───────────────────────────────────────
const getStoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const story = await Story.findById(id);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    const tasks = await Task.find({ storyId: id });
    return res.status(200).json({ success: true, story: { ...story.toObject(), tasks } });
  } catch (err) {
    console.error("getStoryById Error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching story" });
  }
};

// ─── Update a story ───────────────────────────────────────────────────────────
const updateStory = async (req, res) => {
  const { _id, title, description } = req.body;
  try {
    const updated = await Story.findByIdAndUpdate(
      _id,
      { title, description },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Story not found" });
    return res.status(200).json({ success: true, message: "Story updated successfully", story: updated });
  } catch (err) {
    console.error("updateStory Error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating story" });
  }
};

// ─── Delete a story and its tasks ─────────────────────────────────────────────
const deleteStory = async (req, res) => {
  const { Id } = req.params;
  try {
    const deleted = await Story.findByIdAndDelete(Id);
    if (!deleted) return res.status(404).json({ success: false, message: "Story not found" });
    // Remove tasks belonging to this story
    await Task.deleteMany({ storyId: Id });
    return res.status(200).json({ success: true, message: "Story and its tasks deleted successfully" });
  } catch (err) {
    console.error("deleteStory Error:", err);
    return res.status(500).json({ success: false, message: "Server error while deleting story" });
  }
};

module.exports = {
  addNewStory,
  getStoriesByProject,
  getStoryById,
  updateStory,
  deleteStory,
  recalculateStoryStatus,
};
