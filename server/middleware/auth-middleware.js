const jwt=require('jsonwebtoken');
const User = require('../models/users.js');

const userAuthVerification=async (req,res,next)=>{
    const token=req.cookies.token;
    if(!token){ 
        return res.status(400).json({
            success:false,
            message:"Token not found or expired!"
        })
    }

    try{
        const secretKey = process.env.JWT_SECRET || 'your_secret_key'; // Replace with your own secret key
        const decoded= jwt.verify(token,secretKey);
        console.log('Decoded Token:',decoded);

        const userInfo=await User.findById(decoded.userId);
        console.log('User Info:',userInfo);
        if(userInfo){
            return res.status(200).json({
                success:true,
                userInfo
            })
        }
         next();
    }catch (e){
        console.log(e);
        return res.status(401).json({
            success:false,
            message:"User Not authenticated!"
        })
    }
}


module.exports={userAuthVerification};