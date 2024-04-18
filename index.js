const express =require("express");

const cloudinary = require("cloudinary");
const mongoose=require('mongoose');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const app=express();
const cookieParser=require("cookie-parser"); 
const post=require("./routes/Post")
const path=require("path");
const user=require("./routes/User")

if(process.env.NODE_ENV !=="production"){
    require("dotenv").config({path:"./config/config.env"});
}
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());
app.use("/post",post);
app.use("/user",user);
app.use(express.static(path.join(__dirname,"./build")));

app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"./build/index.html"));
})
  
main().catch((err)=>console.log(err))
async function main(){
  await mongoose.connect(process.env.MONGO_URI);
  console.log("database connected")
}

app.listen(process.env.PORT,()=>{
    console.log("server started")
}) 