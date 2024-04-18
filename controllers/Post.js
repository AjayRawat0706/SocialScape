const Post=require("../models/Post");
const User=require("../models/User");
const cloudinary = require("cloudinary");
exports.createPost=async(req,res)=>{
  // console.log("hlo");
  try{
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "posts",
    });
    const newPostData={
        caption:req.body.caption,
        image:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url,
        },
        owner:req.user._id 
    }
    const post=await Post.create(newPostData);
    const user=await User.findById(req.user._id);
    user.posts.push(post._id)
    await user.save();
    res.status(201).json({
        success:true, 
        post,
    });
  }
  catch(error){
    res.status(500).json({
        success:false,
        message:error.message
    })
  }
};

exports.likeHandler=async(req,res)=>{
  try{
    const post =await Post.findById(req.params.id);
    // console.log(req.params.id);
    if(!post){
      return res.status(404).json({
        sucess:false,
        message:"Post not found",
      });
    }
    if(post.likes.includes(req.user._id)){
      const index=post.likes.indexOf(req.user._id);
      post.likes.splice(index,1);
      await post.save();
      return res.status(200).json({
        success:true,
        message:"post unliked",
      })
    }
    else{
      post.likes.push(req.user._id);
      await post.save();
      return res.status(200).json({
        success:true,
        message:"post liked",
      })
    }
  }
  catch(err){
    res.status(500).json({
      success:false,
      message:err.message,
    })
  }
}

exports.deletePost=async(req,res)=>{
  try{
    const post=await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({
        success:false,
        message:"post not found"
      })
    }
    if(post.owner.toString()!==req.user._id.toString()){
      return res.status(401).json({
        success:false,
        message:"unauthorized",
      })
    }
    
      await Post.findByIdAndDelete(req.params.id);
      const user=await User.findById(req.user._id);
      const index=user.posts.indexOf(req.params.id);
      user.posts.splice(index,1);
      await user.save();
      res.status(200).json({
        success:true,
        message:"Post deleted",
      })
    
  }
  catch(err){
    return res.status(500).json({
      success:false,
      message:err.message,
    })
  }
}

exports.getPostOfFollowing=async(req,res)=>{
  try{
    const user=await User.findById(req.user._id);
    const posts=await Post.find({
      owner:{
        $in:user.following,
      },
    }).populate("owner likes comments.user");
    res.status(200).json({
      success:true,
      posts:posts.reverse(),
    })
  }
  catch(err){
    return res.status(500).json({
      success:false,
      message:err.message,
    });
  }
}

exports.updateCaption=async(req,res)=>{
  try{
   const post= await Post.findById(req.params.id);
   if(!post){ 
    return res.status(404).json({
      success:false,
      message:"Post not found",
    })
   }
    
   if(post.owner.toString()!==req.user._id.toString()){
    return res.status(401).json({
      success:false,
      message:"Unauthorized",
    });
   }
   post.caption=req.body.caption;
   await post.save();
  return res.status(200).json({
    success:true,
    message:"Post updated",
  })
  }
  catch(err){
    return res.status(500).json({
      success:false,
      message:err.message,
    })
  }
}

exports.addComment =async(req,res)=>{
  try{
    const post =await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({
        success:false,
        message:"Post not found",
      });
    }

    else{
      post.comments.push({
        user:req.user._id,
        comment:req.body.comment,
      });
      await post.save();
      return res.status(200).json({
        success:true,
        message:"Comment added",
      })
    }
  }
  catch(err){
    res.status(500).json({
      success:false,
      message:err.message,
    });
  }
}

exports.deleteComment=async(req,res)=>{
  try{
    const post=await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({
        success:false,
        message:"post not found",
      })
    }
    if(post.owner.toString()===req.user._id.toString()){
      if(req.body.commentId==undefined){
        return res.status(400).json({
          success:false,
          message:"comment id is required"
        })
      }
      post.comments.forEach((item,index)=>{
        if(item._id.toString()===req.body.commentId.toString()){
          return post.comments.splice(index,1);
        }
      })
      await post.save();
      return res.status(200).json({
        success:true,
        message:"comment deleted"
      })
    }
    else{
      post.comments.forEach((item,index)=>{
        if(item.user.toString()===req.user._id.toString()){
          return post.comments.splice(index,1);
        }
      })
      await post.save();
       return res.status(200).json({
        success:true,
        message:"your comment deleted"
      })
    }
  }
  catch(err){
    res.status(500).json({
      success:false,
      message:err.message,
    });
  }
}
 
exports.suggestedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const randomPosts = await Post.find({
      owner: {
        $nin: user.following, 
        $ne: req.user._id 
      }
    }).populate("owner likes comments.user");
   
    res.status(200).json({
      success: true,
      randomPosts,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/******************************suffle function ********************** */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
/******************************************************** */