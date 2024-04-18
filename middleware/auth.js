const User=require("../models/User");
const jwt=require("jsonwebtoken");

exports.isAuthenticated=async(req,res,next)=>{
  try{
    const {token}=req.cookies;
    // console.log(token);
    if(!token){
      return res.status(401).json({
          message:"Login first"
      });
    }
  
       const decoded=await jwt.verify(token,process.env.JWT_KEY);
       req.user= await User.findById(decoded._id);
       next();
      }

      
  catch(err){
    res.status(500).json({
      message:err.message,
    })
  }
};