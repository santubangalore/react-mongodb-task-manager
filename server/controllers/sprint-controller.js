const Sprint = require("../models/sprint");
const Task = require("../models/task");
const Story = require("../models/story");
const Joi = require("joi");

const sprintSchema = Joi.object({
  name: Joi.string().required(),
  goal: Joi.string().allow("").optional(),
  projectId: Joi.string().required(),
  userId: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
});

// ─── Helper: date overlap check ───────────────────────────────────────────────
const findDateClash = async (projectId, startDate, endDate, excludeId = null) => {
  const query = { projectId, status: { $ne: "closed" } };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await Sprint.find(query);
  const newStart = new Date(startDate).getTime();
  const newEnd = new Date(endDate).getTime();
  return existing.find((s) => {
    const sStart = new Date(s.startDate).getTime();
    const sEnd = new Date(s.endDate).getTime();
    return newStart <= sEnd && newEnd >= sStart;
  }) || null;
};

// ─── Create sprint ────────────────────────────────────────────────────────────
const addNewSprint = async (req, res) => {
  const { name, goal, projectId, userId, startDate, endDate } = req.body;
  const { error } = sprintSchema.validate({ name, goal, projectId, userId, startDate, endDate });
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });
  if (new Date(endDate) <= new Date(startDate))
    return res.status(400).json({ success: false, message: "End date must be after start date" });

  try {
    const clash = await findDateClash(projectId, startDate, endDate);
    if (clash) return res.status(400).json({
      success: false,
      message: `Date clash with sprint "${clash.name}" (${new Date(clash.startDate).toDateString()} – ${new Date(clash.endDate).toDateString()})`,
    });
    const newSprint = await Sprint.create({ name, goal, projectId, userId, startDate, endDate });
    return res.status(200).json({ success: true, message: "Sprint created successfully", sprint: newSprint });
  } catch (err) {
    console.error("addNewSprint Error:", err);
    return res.status(500).json({ success: false, message: "Server error while creating sprint" });
  }
};

// ─── Get all sprints for a project ────────────────────────────────────────────
const getSprintsByProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const sprints = await Sprint.find({ projectId }).sort({ startDate: 1 });
    const tasks = await Task.find({ projectId });
    const enriched = sprints.map((sprint) => {
      const sprintTasks = tasks.filter((t) => t.sprintId && t.sprintId.toString() === sprint._id.toString());
      const doneTasks = sprintTasks.filter((t) => t.status === "done").length;
      return { ...sprint.toObject(), tasksCount: sprintTasks.length, doneTasksCount: doneTasks };
    });
    return res.status(200).json({ success: true, sprints: enriched });
  } catch (err) {
    console.error("getSprintsByProject Error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching sprints" });
  }
};

// ─── Get single sprint with tasks ─────────────────────────────────────────────
const getSprintById = async (req, res) => {
  const { id } = req.params;
  try {
    const sprint = await Sprint.findById(id);
    if (!sprint) return res.status(404).json({ success: false, message: "Sprint not found" });
    const tasks = await Task.find({ sprintId: id });
    return res.status(200).json({ success: true, sprint: { ...sprint.toObject(), tasks } });
  } catch (err) {
    console.error("getSprintById Error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching sprint" });
  }
};

// ─── Update sprint ────────────────────────────────────────────────────────────
const updateSprint = async (req, res) => {
  const { _id, name, goal, startDate, endDate, projectId } = req.body;
  if (startDate && endDate && new Date(endDate) <= new Date(startDate))
    return res.status(400).json({ success: false, message: "End date must be after start date" });
  try {
    if (startDate && endDate) {
      const clash = await findDateClash(projectId, startDate, endDate, _id);
      if (clash) return res.status(400).json({
        success: false,
        message: `Date clash with sprint "${clash.name}" (${new Date(clash.startDate).toDateString()} – ${new Date(clash.endDate).toDateString()})`,
      });
    }
    const updated = await Sprint.findByIdAndUpdate(_id, { name, goal, startDate, endDate }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Sprint not found" });
    return res.status(200).json({ success: true, message: "Sprint updated successfully", sprint: updated });
  } catch (err) {
    console.error("updateSprint Error:", err);
    return res.status(500).json({ success: false, message: "Server error while updating sprint" });
  }
};

// ─── Start sprint (planned → active) ──────────────────────────────────────────
const startSprint = async (req, res) => {
  const { id } = req.params;
  try {
    const sprint = await Sprint.findById(id);
    if (!sprint) return res.status(404).json({ success: false, message: "Sprint not found" });
    if (sprint.status !== "planned")
      return res.status(400).json({ success: false, message: "Only a planned sprint can be started" });
    const activeSprint = await Sprint.findOne({ projectId: sprint.projectId, status: "active" });
    if (activeSprint) return res.status(400).json({
      success: false,
      message: `Sprint "${activeSprint.name}" is already active. Close it before starting a new one.`,
    });
    const started = await Sprint.findByIdAndUpdate(id, { status: "active" }, { new: true });
    return res.status(200).json({ success: true, message: "Sprint started", sprint: started });
  } catch (err) {
    console.error("startSprint Error:", err);
    return res.status(500).json({ success: false, message: "Server error while starting sprint" });
  }
};

// ─── Close sprint (active → closed) ───────────────────────────────────────────
const closeSprint = async (req, res) => {
  const { id } = req.params;
  try {
    const sprint = await Sprint.findById(id);
    if (!sprint) return res.status(404).json({ success: false, message: "Sprint not found" });
    if (sprint.status !== "active")
      return res.status(400).json({ success: false, message: "Only an active sprint can be closed" });
    const closed = await Sprint.findByIdAndUpdate(id, { status: "closed" }, { new: true });
    return res.status(200).json({ success: true, message: "Sprint closed successfully", sprint: closed });
  } catch (err) {
    console.error("closeSprint Error:", err);
    return res.status(500).json({ success: false, message: "Server error while closing sprint" });
  }
};

// ─── Add single task to sprint ────────────────────────────────────────────────
const addTaskToSprint = async (req, res) => {
  const { sprintId, taskId } = req.body;
  try {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ success: false, message: "Sprint not found" });
    const updated = await Task.findByIdAndUpdate(taskId, { sprintId, status: "todo" }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Task not found" });
    return res.status(200).json({ success: true, message: "Task added to sprint", task: updated });
  } catch (err) {
    console.error("addTaskToSprint Error:", err);
    return res.status(500).json({ success: false, message: "Server error while adding task to sprint" });
  }
};

// ─── Remove single task from sprint ──────────────────────────────────────────
const removeTaskFromSprint = async (req, res) => {
  const { taskId } = req.params;
  try {
    const updated = await Task.findByIdAndUpdate(taskId, { sprintId: "", status: "todo" }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Task not found" });
    return res.status(200).json({ success: true, message: "Task removed from sprint", task: updated });
  } catch (err) {
    console.error("removeTaskFromSprint Error:", err);
    return res.status(500).json({ success: false, message: "Server error while removing task from sprint" });
  }
};

// ─── Get active sprint for a project ─────────────────────────────────────────
const getActiveSprintByProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const activeSprint = await Sprint.findOne({ projectId, status: "active" });
    if (!activeSprint) return res.status(200).json({ success: true, sprint: null, tasks: [] });
    const tasks = await Task.find({ sprintId: activeSprint._id.toString() });
    return res.status(200).json({ success: true, sprint: activeSprint, tasks });
  } catch (err) {
    console.error("getActiveSprintByProject Error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching active sprint" });
  }
};

// ─── Delete sprint ─────────────────────────────────────────────────────────────
const deleteSprint = async (req, res) => {
  const { Id } = req.params;
  try {
    const sprint = await Sprint.findById(Id);
    if (!sprint) return res.status(404).json({ success: false, message: "Sprint not found" });
    if (sprint.status === "active")
      return res.status(400).json({ success: false, message: "Cannot delete an active sprint. Close it first." });
    await Sprint.findByIdAndDelete(Id);
    await Task.updateMany({ sprintId: Id }, { sprintId: "", status: "todo" });
    return res.status(200).json({ success: true, message: "Sprint deleted successfully" });
  } catch (err) {
    console.error("deleteSprint Error:", err);
    return res.status(500).json({ success: false, message: "Server error while deleting sprint" });
  }
};

// ─── Sprint history: all closed sprints with their stories + tasks ────────────
const getSprintHistory = async (req, res) => {
  const { projectId } = req.params;
  try {
    const closedSprints = await Sprint.find({ projectId, status: "closed" }).sort({ endDate: -1 });
    const allTasks = await Task.find({ projectId });
    const allStories = await Story.find({ projectId });

    const history = closedSprints.map((sprint) => {
      const sprintId = sprint._id.toString();
      const tasks = allTasks.filter((t) => t.sprintId === sprintId);

      // Group tasks by story
      const storyMap = {};
      tasks.forEach((task) => {
        const sid = task.storyId || "__none__";
        if (!storyMap[sid]) {
          const storyDoc = allStories.find((s) => s._id.toString() === sid);
          storyMap[sid] = {
            story: storyDoc ? { _id: storyDoc._id, title: storyDoc.title, description: storyDoc.description, status: storyDoc.status } : null,
            tasks: [],
          };
        }
        storyMap[sid].tasks.push(task);
      });

      const doneTasks = tasks.filter((t) => t.status === "done").length;
      return {
        ...sprint.toObject(),
        tasksCount: tasks.length,
        doneTasksCount: doneTasks,
        storyGroups: Object.values(storyMap),
      };
    });

    return res.status(200).json({ success: true, history });
  } catch (err) {
    console.error("getSprintHistory Error:", err);
    return res.status(500).json({ success: false, message: "Server error while fetching sprint history" });
  }
};

module.exports = {
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
};
