const Joi = require('joi');
const User = require('../models/users.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//import { User } from '../models/user.js';
const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().max(30).required(),
    password: Joi.string().min(6).max(20).required()
});

const registerUser= async (req, res, next) => {
  
        const { name, email, password } =await req.body;
        
        const {error} = registerSchema.validate({ name, email, password });

        if (error) {
            return res.status(400).json({success:false, message: error.details[0].message });
        }
  try {
        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        else{
            const hashedPassword= await bcrypt.hash(password, 12);
            const newUser =  User.create({ name, email, password: hashedPassword });
            if(!newUser){
                const token = generateToken(newUser._id);

                res.cookie('token', token, {
                    withCredentials: true,
                    httpOnly: false,
                });

                res.status(201).json({ success: true, message: 'User registered successfully', userData:{
                    name: newUser.name,
                    email: newUser.email,
                } });
            }
        }
        //res.status(201).json({ success: true, message: 'User registered successfully' });
        await next();
    }catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const  generateToken = (userId) => {
    const secretKey = process.env.JWT_SECRET || 'your_secret_key'; // Replace with your own secret key
    const token = jwt.sign({ userId }, secretKey, { expiresIn: 3 * 24 * 60 * 60 }); // Token expires in 3 days
    return token;
}


module.exports = {
    registerUser
};
