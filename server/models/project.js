

const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: { type: String, default: "In Progress" },
  client: String,
  manager: String,
  startDate: { type: Date, default: Date.now },
  userId: { type: String, required: true }
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

module.exports = Project;