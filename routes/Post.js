const express=require("express");
const { createPost, likeHandler, deletePost, getPostOfFollowing, updateCaption, addComment, deleteComment, suggestedPosts } = require("../controllers/Post");
const {isAuthenticated}=require("../middleware/auth")
const router=express.Router();

router.route("/upload").post(isAuthenticated,createPost);
router.route("/posts").get(isAuthenticated,getPostOfFollowing);
router.route("/suggestion").get(isAuthenticated,suggestedPosts);
router.route("/comment/:id").put(isAuthenticated,addComment).delete(isAuthenticated,deleteComment);
router.route("/:id")
.get(isAuthenticated,likeHandler)
.put(isAuthenticated,updateCaption)
.delete(isAuthenticated,deletePost)

module.exports=router;     