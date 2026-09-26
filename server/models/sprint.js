const mongoose = require("mongoose");

// A Sprint belongs to a project.
// Rules enforced at the controller level:
//   - Only one sprint can be "active" per project at a time.
//   - Start/end dates must not overlap with any other sprint in the same project.
//   - A sprint can only be started manually (status: "active").
//   - Once ended, it must be closed manually (status: "closed") before the next sprint starts.
const SprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    goal: { type: String, default: "" },
    projectId: { type: String, required: true },
    userId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // planned → active → closed
    status: { type: String, default: "planned" }, // planned | active | closed
  },
  { timestamps: true }
);

const Sprint = mongoose.models.Sprint || mongoose.model("Sprint", SprintSchema);

module.exports = Sprint;
