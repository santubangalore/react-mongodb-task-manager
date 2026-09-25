const Project = require("../models/project");
const Task = require("../models/task");
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

// Add a new project
const addNewProject = async (req, res) => {
  const { name, description, status, client, manager, startDate, userId } = req.body;

  const { error } = projectSchema.validate({
    name,
    description,
    status,
    client,
    manager,
    startDate,
    userId,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const newProject = await Project.create({
      name,
      description,
      status,
      client,
      manager,
      startDate: startDate || new Date(),
      userId,
    });

    if (newProject) {
      return res.status(200).json({
        success: true,
        message: "Project added successfully",
        project: newProject,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to create project. Please try again.",
      });
    }
  } catch (error) {
    console.error("addNewProject Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while adding project",
    });
  }
};

// Get all projects by user ID with task count stats
const getAllProjects = async (req, res) => {
  const { id } = req.params;

  try {
    const projectsList = await Project.find({ userId: id }).sort({ createdAt: -1 });
    const userTasks = await Task.find({ userId: id });

    // Map projects with numeric task counts
    const projectsWithTaskCounts = projectsList.map((project) => {
      const projectTasks = userTasks.filter(
        (task) => task.projectId && task.projectId.toString() === project._id.toString()
      );
      const completedTasks = projectTasks.filter(
        (task) => task.status === "done" || task.status === "Completed"
      ).length;

      return {
        ...project.toObject(),
        tasksCount: projectTasks.length,
        completedTasksCount: completedTasks,
      };
    });

    return res.status(200).json({
      success: true,
      projectsList: projectsWithTaskCounts,
    });
  } catch (error) {
    console.error("getAllProjects Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching projects",
    });
  }
};

// Get single project details
const getProjectDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const tasks = await Task.find({ projectId: id });

    return res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        tasks,
        tasksCount: tasks.length,
      },
    });
  } catch (error) {
    console.error("getProjectDetails Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while fetching project details",
    });
  }
};

// Update existing project
const updateProject = async (req, res) => {
  const { _id, name, description, status, client, manager, startDate, userId } = req.body;

  try {
    const updatedProject = await Project.findByIdAndUpdate(
      _id,
      {
        name,
        description,
        status,
        client,
        manager,
        startDate: startDate ? new Date(startDate) : undefined,
        userId,
      },
      { new: true }
    );

    if (updatedProject) {
      return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        project: updatedProject,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to update project. Project not found.",
      });
    }
  } catch (error) {
    console.error("updateProject Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while updating project",
    });
  }
};

// Delete project and its tasks
const deleteProject = async (req, res) => {
  const { Id } = req.params;

  try {
    if (!Id) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    const deletedProject = await Project.findByIdAndDelete(Id);
    if (deletedProject) {
      // Also clean up tasks associated with this project
      await Task.deleteMany({ projectId: Id });

      return res.status(200).json({
        success: true,
        message: "Project and associated tasks deleted successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Project not found or already deleted",
      });
    }
  } catch (error) {
    console.error("deleteProject Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while deleting project",
    });
  }
};

module.exports = {
  addNewProject,
  getAllProjects,
  getProjectDetails,
  updateProject,
  deleteProject,
};
