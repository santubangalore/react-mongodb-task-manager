const Joi = require('joi');
const User = require('../models/users.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//import { User } from '../models/user.js';
const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(20).required()
});

const registerUser = async (req, res, next) => {
  const { name, email, password } = await req.body;
  const { error } = registerSchema.validate({ name, email, password });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const isUserEmailAlreadyExists = await User.findOne({ email });

    if (isUserEmailAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: "User email already exists! Please try with different email",
      });
    } else {
      const hashPassword = await bcrypt.hash(password, 12);

      const newlyCreatedUser = await User.create({
        name,
        email,
        password: hashPassword,
      });

      if (newlyCreatedUser) {
        const token = generateToken(newlyCreatedUser?._id);

        res.cookie("token", token, {
          withCredentials: true,
          httpOnly: false,
        });

        res.status(201).json({
          success: true,
          message: "User registration successful",
          userData: {
            name: newlyCreatedUser.name,
            email: newlyCreatedUser.email,
            _id: newlyCreatedUser._id,
          },
        });

        next();
      }
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again",
    });
  }
};

const loginUser = async (req, res,next) => {
  const { email, password } = req.body;
  const { error } = loginSchema.validate({ email, password });

  if (error) {
    return res.json({
      success: false,
      message: error.details[0].message,
    });
  }
  
  try{
    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.json({
        success: false,
        message: "Invalid email ",
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, findUser.password);
    if (!isPasswordMatch) {
      return res.json({
        success: false,
        message: "Invalid  password",
      });
    }

    const token = generateToken(findUser?._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    res.status(200).json({
      success: true,
      message: "User login successful",
    });
    next();
  } catch (error) 
  {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
}


const  generateToken = (userId) => {
    const secretKey = process.env.JWT_SECRET || 'your_secret_key'; // Replace with your own secret key
    const token = jwt.sign({ userId }, secretKey, { expiresIn: 3 * 24 * 60 * 60 }); // Token expires in 3 days
    return token;
}

const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};


module.exports = { registerUser, loginUser, logoutUser};
