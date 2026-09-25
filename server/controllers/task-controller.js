const Task = require("../models/task");
const Joi = require('joi');
//add a new task
//get all tasks by userid
//delete a task
//edit a task
const taskSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    status:Joi.string().required(),
    userId:Joi.string().required(),
    priority: Joi.string().required()
});
const addNewTask = async (req, res) => {
  const { title, description, status, userId, priority } = await req.body;

  //validate the schema
   const { error } = taskSchema.validate({ title, description, status, userId, priority });

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
    });


    if (newTask) {
      return res.status(200).json({
        success: true,
        message: "Task added successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Some error occured! Please try again",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

const getAllTasks = async (req, res) => {
  const { id } = req.params;
 // console.log("user ID:",id);

  try {
    const extractAllTasksByUserId = await Task.find({ userId: id });

    if (extractAllTasksByUserId) {
      return res.status(200).json({
        success: true,
        tasksList: extractAllTasksByUserId,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Some error occured! Please try again",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

const updateTask = async (req, res) => {
  const { title, description, status, priority, userId, _id } = await req.body;

  try {
    const updateTask = await Task.findByIdAndUpdate(
      {
        _id,
      },
      {
        title,
        description,
        status,
        priority,
        userId,
      },
      { new: true }
    );

    if (updateTask) {
      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Some error occured! Please try again",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

const deleteTask = async (req, res) => {
  const  { Id }  = req.params;
  //console.log('deleteTask in controller:',req.params);
  try {
    if (!Id) {
      return res.status(400).json({
        success: false,
        message: "Task id is required",
      });
    }

    const deleteTask = await Task.findByIdAndDelete(Id);

    if (deleteTask) {
      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Some error occured! Please try again",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

module.exports = { addNewTask, getAllTasks, deleteTask, updateTask };

