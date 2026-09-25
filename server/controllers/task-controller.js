const Task = require("../models/task");
const Joi = require("joi");

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().required(),
  userId: Joi.string().required(),
  priority: Joi.string().required(),
  projectId: Joi.string().allow("").optional(),
});

const addNewTask = async (req, res) => {
  const { title, description, status, userId, priority, projectId } = req.body;

  const { error } = taskSchema.validate({
    title,
    description,
    status,
    userId,
    priority,
    projectId,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const newTask = await Task.create({
      title,
      description,
      status,
      userId,
      priority,
      projectId: projectId || "",
    });

    if (newTask) {
      return res.status(200).json({
        success: true,
        message: "Task added successfully",
        task: newTask,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Some error occurred! Please try again",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred! Please try again",
    });
  }
};

const getAllTasks = async (req, res) => {
  const { id } = req.params;
  const { projectId } = req.query;

  try {
    const query = { userId: id };
    if (projectId) {
      query.projectId = projectId;
    }

    const extractAllTasks = await Task.find(query);

    return res.status(200).json({
      success: true,
      tasksList: extractAllTasks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred! Please try again",
    });
  }
};

const getTasksByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    const extractTasks = await Task.find({ projectId });
    return res.status(200).json({
      success: true,
      tasksList: extractTasks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred! Please try again",
    });
  }
};

const updateTask = async (req, res) => {
  const { title, description, status, priority, userId, _id, projectId } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      _id,
      {
        title,
        description,
        status,
        priority,
        userId,
        projectId: projectId || "",
      },
      { new: true }
    );

    if (updatedTask) {
      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task: updatedTask,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Some error occurred! Please try again",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred! Please try again",
    });
  }
};

const deleteTask = async (req, res) => {
  const { Id } = req.params;
  try {
    if (!Id) {
      return res.status(400).json({
        success: false,
        message: "Task id is required",
      });
    }

    const deletedTask = await Task.findByIdAndDelete(Id);

    if (deletedTask) {
      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Some error occurred! Please try again",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred! Please try again",
    });
  }
};

module.exports = { addNewTask, getAllTasks, getTasksByProjectId, deleteTask, updateTask };
