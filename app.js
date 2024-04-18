const express =require("express");
const app=express();
const cookieParser=require("cookie-parser"); 
const post=require("./routes/Post")
const cors = require('cors');
const user=require("./routes/User")
if(process.env.NODE_ENV !=="production"){
    require("dotenv").config({path:"./config/config.env"});
}
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use("/post",post);
app.use("/user",user);
    
module.exports=app;