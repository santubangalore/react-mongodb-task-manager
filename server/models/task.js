const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  // Status starts as "todo" and is locked until the task is included in an active sprint.
  // "todo" | "inProgress" | "blocked" | "review" | "done"
  status: { type: String, default: "todo" },
  userId: String,
  priority: String,
  projectId: String,
  // storyId links this task to a Story within the project
  storyId: { type: String, default: "" },
  // sprintId is set when the task is added to a sprint
  sprintId: { type: String, default: "" },
  // assignedTo stores the userId of the team member this task is assigned to
  assignedTo: { type: String, default: "" },
  // assignedToName cached for display without extra lookups
  assignedToName: { type: String, default: "" },
  // flag: set when a task is marked redundant or duplicate from within a sprint.
  // Flagged tasks are removed from the sprint but stay in the backlog.
  // "" | "redundant" | "duplicate"
  flag: { type: String, default: "" },
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

module.exports = Task;