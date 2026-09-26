const mongoose = require("mongoose");

// A team member entry stores the user's _id and name so we can display
// them without extra lookups. The owner (userId) is always in the team.
const teamMemberSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    role: { type: String, default: "member" }, // owner | member
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: { type: String, default: "In Progress" },
    client: String,
    manager: String,
    startDate: { type: Date, default: Date.now },
    userId: { type: String, required: true },
    // Team members who can be assigned tasks in this project
    teamMembers: { type: [teamMemberSchema], default: [] },
  },
  { timestamps: true }
);

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

module.exports = Project;
