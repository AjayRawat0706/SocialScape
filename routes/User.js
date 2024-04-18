const { register, login, followHandler, logout, updatePassword, updateProfile, deleteMyProfile, myProfile, forgotPassword, getMyPosts, suggestedUsers, userProfile, searchProfile } = require("../controllers/User");
const {isAuthenticated}=require("../middleware/auth")
const express=require("express");

const router=express.Router();
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/follow/:id").get(isAuthenticated,followHandler)
router.route("/update/password").put(isAuthenticated,updatePassword);
router.route("/update/profile").put(isAuthenticated,updateProfile);
router.route("/delete/me").delete(isAuthenticated,deleteMyProfile);
router.route("/my/posts").get(isAuthenticated,getMyPosts);
router.route("/profile").get(isAuthenticated,myProfile);
router.route("/profile/:id").get(isAuthenticated,userProfile);
router.route("/forgot/password").post(isAuthenticated,forgotPassword)
router.route("/suggestion").get(isAuthenticated,suggestedUsers)
router.route("/search").get(isAuthenticated,searchProfile)
module.exports=router;    