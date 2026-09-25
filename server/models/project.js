

const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  status: String,
  client: String,
  manager: String
});

const Project = mongoose.models.Task || mongoose.model("Project", ProjectSchema);

module.exports = Project;