const User = require("../models/User");
const Post=require("../models/Post");
const {sendEmail}=require("../middleware/sendEmail")
const cloudinary = require("cloudinary");
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            }) 
        }

        user = await User.create({
            name,
            email,
            password, 
            bio:null,
            phoneNumber:null,
            avatar: { public_id: "sample_id", url: "https://i.stack.imgur.com/l60Hf.png" },
            coverImage:{public_id: "sample_id", url: "https://answers.flexsim.com/themes/base/admin/img/default-coverImage.png"}
        });
        const token = await user.generateToken();
        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        }
        res.status(201).cookie("token", token, options).json({
            success: true,
            user,
            token,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "wrong password"
            });
        }

        const token = await user.generateToken();

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });

    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

exports.logout = async (req, res) => {
    try {
        res
            .status(200)
            .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
            .json({
                success: true,
                message: "Logged out",
            })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }

}

exports.followHandler = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedUser = await User.findById(req.user._id);
        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (loggedUser.following.includes(userToFollow._id)) {
            loggedUser.following.remove(userToFollow._id);
            userToFollow.followers.remove(loggedUser._id);
            await loggedUser.save();
            await userToFollow.save();
            return res.status(200).json({
                success: true,
                message: "Unfollowed successfully"
            })
        }

        else {
            loggedUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedUser._id);
            await loggedUser.save();
            await userToFollow.save();
            return res.status(200).json({
                success: true,
                message: "followed successfully"
            })
        }
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "provide old and new password",
            })
        }
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password",
            });
        }

        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password Updated",
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

exports.updateProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);
        const { name, email,avatar,coverImage,bio,phone } = req.body;
        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }
        if(avatar){
            const avatarImg = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatar",
              });

              user.avatar.public_id = avatarImg.public_id;
              user.avatar.url = avatarImg.secure_url;
        }
        if(coverImage){
            const coverImg = await cloudinary.v2.uploader.upload(coverImage, {
                folder: "coverImages",
              });

              user.coverImage.public_id = coverImg.public_id;
              user.coverImage.url = coverImg.secure_url;
        }
        if(bio){
            user.bio=bio;
        }
        if(phone){
            user.phoneNumber=phone;
        }
        
        await user.save();
        res.status(200).json({
            success: true,
            message: "profile updated"
        })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

exports.deleteMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followers=user.followers;
        const following=user.following;
        const userId=user._id;
        await User.deleteOne({ _id: req.user._id });

        for (let i = 0; i < posts.length; i++) {
            await Post.deleteOne({ _id: posts[i] });
        }
        for(let i=0;i<followers.length;i++){
            const follower=await User.findById(followers[i]);
            const index=follower.following.indexOf(userId);
            follower.following.splice(index,1);
            await follower.save();
        }

        for(let i=0;i<following.length;i++){
            const followed=await User.findById(following[i]);
            const index=followed.followers.indexOf(userId);
            followed.followers.splice(index,1);
            await followed.save();
        }
        res.clearCookie('token');

        return res.status(200).json({
            success: true,
            message: "Profile deleted",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

exports.myProfile=async(req,res)=>{
    try{
   const user=await User.findById(req.user._id).populate("posts following followers");
     res.status(200).json({
        success:true,
       user,
     })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}
exports.userProfile=async(req,res)=>{
    try{
   const user=await User.findById(req.params.id).populate("posts");;
   
   if(!user){
    return res.status(404).json({
        success:false,
        message:"User not found",
    })
   }
     res.status(200).json({
        success:true,
       userDetail:user,
     })
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}
exports.suggestedUsers=async(req,res)=>{
    try{
        const users=await User.find();
        const user = await User.findById(req.user._id);
        const following =user.following;
        const usersNotFollowed = users.filter(e => {
            return e._id.toString() !== req.user._id.toString();
        }).filter(e => !following.includes(e._id.toString()));

        const shuffledUsers = shuffleArray(usersNotFollowed);
        const randomUsers = shuffledUsers.slice(0, 15);
        res.status(200).json({
            succes:true,
            randomUsers,
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
      } 
}
/*****function to suffle the array every time for suggestion***********/
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
/*****************************************/
exports.forgotPassword=async(req,res)=>{
    try{
      const user=await User.findOne({email:req.body.email});
      if(!user){
        return res.status(404).json({
            success:false,
            message:"user not found",
        })
      }
      const resetPasswordToken =user.getResetPasswordToken();
      await user.save();
      const resetUrl=`${req.protocol}://${req.get("host")}/password/reset/${resetPasswordToken}`;
      const message=`Reset yout password by chilcking on the link below: \n\n ${resetUrl}`;
      try{
        await sendEmail({
            email:user.email,
            subject:"Reset password",
            message,
        })
        res.status(200).json({
            success:true,
            message:`email send to ${user.email}`
        }) 
      }
      catch(err){
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save();
        return res.status(500).json({
            success:false,
            message:err.message,
        })
      }
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        })
    }
}

exports.getMyPosts=async(req,res)=>{
 try{
  const user=await User.findById(req.user._id);
   const posts=[];
   for (let i = 0; i < user.posts.length; i++) {
    const post = await Post.findById(user.posts[i]).populate(
      "likes comments.user owner"
    );
    posts.push(post);
  }

  res.status(200).json({
    success: true,
    posts,
  });
 }
 catch(err){
    return res.status(500).json({
        success:false,
        message:err.message,
    })
}
}

exports.searchProfile=async(req,res)=>{
    try {
        const users = await User.find({
          name: { $regex: req.query.name, $options: "i" },
        });
    
        res.status(200).json({
          success: true,
          users,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
}