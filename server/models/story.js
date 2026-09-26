const mongoose = require("mongoose");

// Story belongs to a project. It has no start/end dates.
// Status is derived automatically from its tasks:
//   - "todo"        → no tasks started yet (or no tasks at all)
//   - "inProgress"  → at least one task in progress / blocked / review
//   - "done"        → all tasks are "done"
const StorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    projectId: { type: String, required: true },
    userId: { type: String, required: true },
    // Derived/cached status – recalculated on every task update
    status: { type: String, default: "todo" }, // todo | inProgress | done
  },
  { timestamps: true }
);

const Story = mongoose.models.Story || mongoose.model("Story", StorySchema);

module.exports = Story;
