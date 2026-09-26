const Project = require("../models/project");
const Task = require("../models/task");
const User = require("../models/users");
const Joi = require("joi");

const projectSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("").optional(),
  status: Joi.string().required(),
  client: Joi.string().allow("").optional(),
  manager: Joi.string().allow("").optional(),
  startDate: Joi.date().optional(),
  userId: Joi.string().required(),
});

// ─── Add a new project ────────────────────────────────────────────────────────
const addNewProject = async (req, res) => {
  const { name, description, status, client, manager, startDate, userId } = req.body;

  const { error } = projectSchema.validate({ name, description, status, client, manager, startDate, userId });
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    // Auto-add the creator as the first team member (owner)
    const creator = await User.findById(userId);
    const teamMembers = creator
      ? [{ userId, name: creator.name, email: creator.email, role: "owner" }]
      : [];

    const newProject = await Project.create({
      name, description, status, client, manager,
      startDate: startDate || new Date(),
      userId,
      teamMembers,
    });

    return res.status(200).json({ success: true, message: "Project added successfully", project: newProject });
  } catch (error) {
    console.error("addNewProject Error:", error);
    return res.status(500).json({ success: false, message: "Server error occurred while adding project" });
  }
};

// ─── Get all projects for a user (with task count stats) ─────────────────────
const getAllProjects = async (req, res) => {
  const { id } = req.params;
  try {
    const projectsList = await Project.find({ userId: id }).sort({ createdAt: -1 });
    const userTasks = await Task.find({ userId: id });

    const projectsWithTaskCounts = projectsList.map((project) => {
      const projectTasks = userTasks.filter(
        (task) => task.projectId && task.projectId.toString() === project._id.toString()
      );
      const completedTasks = projectTasks.filter(
        (task) => task.status === "done" || task.status === "Completed"
      ).length;
      return { ...project.toObject(), tasksCount: projectTasks.length, completedTasksCount: completedTasks };
    });

    return res.status(200).json({ success: true, projectsList: projectsWithTaskCounts });
  } catch (error) {
    console.error("getAllProjects Error:", error);
    return res.status(500).json({ success: false, message: "Server error occurred while fetching projects" });
  }
};

// ─── Get single project details ───────────────────────────────────────────────
const getProjectDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    const tasks = await Task.find({ projectId: id });
    return res.status(200).json({
      success: true,
      project: { ...project.toObject(), tasks, tasksCount: tasks.length },
    });
  } catch (error) {
    console.error("getProjectDetails Error:", error);
    return res.status(500).json({ success: false, message: "Server error occurred while fetching project details" });
  }
};

// ─── Update project ───────────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  const { _id, name, description, status, client, manager, startDate, userId } = req.body;
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      _id,
      { name, description, status, client, manager, startDate: startDate ? new Date(startDate) : undefined, userId },
      { new: true }
    );
    if (!updatedProject) return res.status(400).json({ success: false, message: "Failed to update project." });
    return res.status(200).json({ success: true, message: "Project updated successfully", project: updatedProject });
  } catch (error) {
    console.error("updateProject Error:", error);
    return res.status(500).json({ success: false, message: "Server error occurred while updating project" });
  }
};

// ─── Delete project and its tasks ────────────────────────────────────────────
const deleteProject = async (req, res) => {
  const { Id } = req.params;
  try {
    if (!Id) return res.status(400).json({ success: false, message: "Project ID is required" });
    const deletedProject = await Project.findByIdAndDelete(Id);
    if (!deletedProject) return res.status(400).json({ success: false, message: "Project not found." });
    await Task.deleteMany({ projectId: Id });
    return res.status(200).json({ success: true, message: "Project and associated tasks deleted successfully" });
  } catch (error) {
    console.error("deleteProject Error:", error);
    return res.status(500).json({ success: false, message: "Server error occurred while deleting project" });
  }
};

// ─── Get team members for a project ──────────────────────────────────────────
const getProjectMembers = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    return res.status(200).json({ success: true, teamMembers: project.teamMembers || [] });
  } catch (error) {
    console.error("getProjectMembers Error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching team members" });
  }
};

// ─── Add a member to a project by email ──────────────────────────────────────
const addProjectMember = async (req, res) => {
  const { projectId, email } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // Look up the user by email
    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: `No user found with email "${email}"` });
    }

    // Prevent duplicates
    const already = project.teamMembers.some((m) => m.userId === userToAdd._id.toString());
    if (already) {
      return res.status(400).json({ success: false, message: "User is already a team member" });
    }

    project.teamMembers.push({
      userId: userToAdd._id.toString(),
      name: userToAdd.name,
      email: userToAdd.email,
      role: "member",
    });
    await project.save();

    return res.status(200).json({
      success: true,
      message: `${userToAdd.name} added to the project`,
      teamMembers: project.teamMembers,
    });
  } catch (error) {
    console.error("addProjectMember Error:", error);
    return res.status(500).json({ success: false, message: "Server error while adding team member" });
  }
};

// ─── Remove a member from a project ──────────────────────────────────────────
const removeProjectMember = async (req, res) => {
  const { projectId, memberId } = req.params;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // Cannot remove the owner
    const member = project.teamMembers.find((m) => m.userId === memberId);
    if (member?.role === "owner") {
      return res.status(400).json({ success: false, message: "Cannot remove the project owner" });
    }

    project.teamMembers = project.teamMembers.filter((m) => m.userId !== memberId);
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Member removed from project",
      teamMembers: project.teamMembers,
    });
  } catch (error) {
    console.error("removeProjectMember Error:", error);
    return res.status(500).json({ success: false, message: "Server error while removing team member" });
  }
};

module.exports = {
  addNewProject,
  getAllProjects,
  getProjectDetails,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
};
