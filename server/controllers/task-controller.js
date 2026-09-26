const Task = require("../models/task");
const { recalculateStoryStatus } = require("./story-controller");
const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  userId: Joi.string().required(),
  priority: Joi.string().required(),
  projectId: Joi.string().allow("").optional(),
  storyId: Joi.string().allow("").optional(),
  sprintId: Joi.string().allow("").optional(),
  assignedTo: Joi.string().allow("").optional(),
  assignedToName: Joi.string().allow("").optional(),
});

// ─── Add a new task ───────────────────────────────────────────────────────────
// Status is always forced to "todo" on creation.
const addNewTask = async (req, res) => {
  const { title, description, userId, priority, projectId, storyId, sprintId, assignedTo, assignedToName } = req.body;

  const { error } = taskSchema.validate({ title, description, userId, priority, projectId, storyId, sprintId, assignedTo, assignedToName });
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const newTask = await Task.create({
      title, description,
      status: "todo",
      userId, priority,
      projectId: projectId || "",
      storyId: storyId || "",
      sprintId: sprintId || "",
      assignedTo: assignedTo || "",
      assignedToName: assignedToName || "",
    });

    if (newTask) {
      if (storyId) await recalculateStoryStatus(storyId);
      return res.status(200).json({ success: true, message: "Task added successfully", task: newTask });
    }
    return res.status(400).json({ success: false, message: "Some error occurred! Please try again" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Some error occurred! Please try again" });
  }
};

// ─── Get all tasks (optionally filtered by project) ───────────────────────────
const getAllTasks = async (req, res) => {
  const { id } = req.params;
  const { projectId } = req.query;
  try {
    const query = { userId: id };
    if (projectId) query.projectId = projectId;
    const extractAllTasks = await Task.find(query);
    return res.status(200).json({ success: true, tasksList: extractAllTasks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Some error occurred! Please try again" });
  }
};

// ─── Get all tasks by project ─────────────────────────────────────────────────
const getTasksByProjectId = async (req, res) => {
  const { projectId } = req.params;
  try {
    const extractTasks = await Task.find({ projectId });
    return res.status(200).json({ success: true, tasksList: extractTasks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Some error occurred! Please try again" });
  }
};

// ─── Get all tasks by story ───────────────────────────────────────────────────
const getTasksByStoryId = async (req, res) => {
  const { storyId } = req.params;
  try {
    const tasks = await Task.find({ storyId });
    return res.status(200).json({ success: true, tasksList: tasks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Some error occurred! Please try again" });
  }
};

// ─── Get tasks assigned to a specific user (across all projects) ──────────────
const getTasksAssignedToUser = async (req, res) => {
  const { userId } = req.params;
  const { projectId } = req.query;
  try {
    const query = { assignedTo: userId };
    if (projectId) query.projectId = projectId;
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, tasksList: tasks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Some error occurred! Please try again" });
  }
};

// ─── Update a task ────────────────────────────────────────────────────────────
// Status can only be changed if the task belongs to a sprint (sprintId is set).
const updateTask = async (req, res) => {
  const { title, description, status, priority, userId, _id, projectId, storyId, sprintId, assignedTo, assignedToName } = req.body;

  try {
    const existing = await Task.findById(_id);
    if (!existing) return res.status(404).json({ success: false, message: "Task not found" });

    const effectiveSprintId = sprintId !== undefined ? sprintId : existing.sprintId;
    // Status is editable only when the task is in a sprint
    const effectiveStatus = effectiveSprintId ? status : "todo";

    const updatedTask = await Task.findByIdAndUpdate(
      _id,
      {
        title, description,
        status: effectiveStatus,
        priority, userId,
        projectId: projectId || "",
        storyId: storyId !== undefined ? storyId : existing.storyId,
        sprintId: effectiveSprintId || "",
        assignedTo: assignedTo !== undefined ? assignedTo : existing.assignedTo,
        assignedToName: assignedToName !== undefined ? assignedToName : existing.assignedToName,
      },
      { new: true }
    );

    if (updatedTask) {
      const parentStoryId = updatedTask.storyId || existing.storyId;
      if (parentStoryId) await recalculateStoryStatus(parentStoryId);
      return res.status(200).json({ success: true, message: "Task updated successfully", task: updatedTask });
    }
    return res.status(400).json({ success: false, message: "Some error occurred! Please try again" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Some error occurred! Please try again" });
  }
};

// ─── Update task status only (for sprint board quick-switch) ──────────────────
const updateTaskStatus = async (req, res) => {
  const { _id, status } = req.body;
  try {
    const existing = await Task.findById(_id);
    if (!existing) return res.status(404).json({ success: false, message: "Task not found" });
    if (!existing.sprintId) {
      return res.status(400).json({ success: false, message: "Task must be in a sprint to change status" });
    }
    const updated = await Task.findByIdAndUpdate(_id, { status }, { new: true });
    if (updated.storyId) await recalculateStoryStatus(updated.storyId);
    return res.status(200).json({ success: true, message: "Status updated", task: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Some error occurred! Please try again" });
  }
};

// ─── Delete a task ────────────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  const { Id } = req.params;
  try {
    if (!Id) return res.status(400).json({ success: false, message: "Task id is required" });
    const deletedTask = await Task.findByIdAndDelete(Id);
    if (deletedTask) {
      if (deletedTask.storyId) await recalculateStoryStatus(deletedTask.storyId);
      return res.status(200).json({ success: true, message: "Task deleted successfully" });
    }
    return res.status(400).json({ success: false, message: "Some error occurred! Please try again" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Some error occurred! Please try again" });
  }
};

// ─── Flag a task as redundant or duplicate ────────────────────────────────────
// Removes the task from its sprint (clears sprintId + assignedTo for sprint
// purposes) but keeps it in the backlog with the flag set for visibility.
// The task is NEVER deleted — it stays in the story/backlog permanently.
const flagTask = async (req, res) => {
  const { _id, flag } = req.body;
  const validFlags = ["redundant", "duplicate"];
  if (!validFlags.includes(flag)) {
    return res.status(400).json({ success: false, message: `Invalid flag value. Must be one of: ${validFlags.join(", ")}` });
  }
  try {
    const task = await Task.findById(_id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const updated = await Task.findByIdAndUpdate(
      _id,
      {
        flag,
        // Remove from sprint so it disappears from the sprint board
        sprintId: "",
        // Reset status back to todo since it's back in the backlog
        status: "todo",
      },
      { new: true }
    );

    // Recalculate parent story status since a task left the sprint
    if (updated.storyId) await recalculateStoryStatus(updated.storyId);

    return res.status(200).json({
      success: true,
      message: `Task marked as ${flag} and removed from sprint`,
      task: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Some error occurred! Please try again" });
  }
};
// Receives { sprintId, projectId, assignments: [{ taskId, assignedTo, assignedToName }] }
// Each included task MUST have an assignedTo — the controller enforces this.
const batchAssignTasksToSprint = async (req, res) => {
  const { sprintId, projectId, assignments } = req.body;
  try {
    // Validate: every assignment must have an assignedTo
    if (assignments && assignments.length > 0) {
      const unassigned = assignments.filter((a) => !a.assignedTo);
      if (unassigned.length > 0) {
        return res.status(400).json({
          success: false,
          message: `${unassigned.length} task(s) have no user assigned. Every task must be assigned to a team member before saving.`,
        });
      }
    }

    // Detach all tasks in this project that were previously in this sprint
    await Task.updateMany(
      { projectId, sprintId },
      { sprintId: "", status: "todo", assignedTo: "", assignedToName: "" }
    );

    // Attach selected tasks with their assigned users
    if (assignments && assignments.length > 0) {
      for (const { taskId, assignedTo, assignedToName } of assignments) {
        await Task.findByIdAndUpdate(taskId, {
          sprintId,
          status: "todo",
          assignedTo,
          assignedToName,
        });
      }
    }

    const updatedTasks = await Task.find({ projectId });
    return res.status(200).json({
      success: true,
      message: "Sprint tasks saved successfully",
      tasksList: updatedTasks,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error while saving sprint tasks" });
  }
};

module.exports = {
  addNewTask,
  getAllTasks,
  getTasksByProjectId,
  getTasksByStoryId,
  getTasksAssignedToUser,
  updateTask,
  updateTaskStatus,
  flagTask,
  batchAssignTasksToSprint,
  deleteTask,
};
