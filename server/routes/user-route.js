const express=require('express');
const userRouter=express.Router();
const { registerUser,loginUser,logoutUser } = require('../controllers/user-controller.js');
const { userAuthVerification } = require('../middleware/auth-middleware.js');

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/auth', userAuthVerification);
userRouter.post('/logout', logoutUser);

module.exports=userRouter;
