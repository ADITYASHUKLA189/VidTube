import  asyncHandler  from '../utils/asyncHandler.js';
import  ApiError from '../utils/ApiError.js';
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import ApiResponse from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import {Subscription}  from '../models/subscription.model.js';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessAndRefreshToken =async(userId)=>{
      try{
        const user=await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return { accessToken, refreshToken };
      }catch(error){
          throw new ApiError(500, "Failed to generate access and refresh token");
      }
}


//creating register user controller here
const registerUser = asyncHandler(async (req, res) => {
       //1->get user detials from frontend(abhi ke liye postman se bhejenge)    
       //2->validate the user detials
       //check if user already exists in database:username email
       //check for image and avatar (check for avtar existence)
       //upload and check this to cloudinary and get the url(response se) of image and avatar
       //create user object-create entry in db
       //remove pass and refresh token from response
       //check for user creation success and failure
       //4->send response to frontend(without password and refresh token)

       const{fullname,email,username,password}=req.body;
       console.log("getting user data from frontend");
       
       //checking for empty fields
       if(
        [fullname,email,username,password].some((field) => !field || field.trim() === "")
       ){
           throw new ApiError(400, "All fields are required");
       }

       //checking for valid email and password
       if (!email.includes("@")) {
          throw new ApiError(400, "Please enter a valid email");
       }
       if (password.length < 6) {
          throw new ApiError(400, "Password must be at least 6 characters long");
       }
       

       //checking for existing user
       const existedUser = await User.findOne
       ({
        $or: [{ email }, { username }],
      });
      if (existedUser) {
          throw new ApiError(409, "User with this email or username already exists");
      }
      console.log(req.files);


      //now checking for avatar and cover image in req.files
      const avatarLocalPath = req.files?.avatar?.[0]?.path;
      const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
      if(!avatarLocalPath){
          throw new ApiError(400, "Avatar image is required");
        }
        
        
        //uploading avatar and cover image to cloudinary and getting the url
    const avatar= await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath?await uploadOnCloudinary(coverImageLocalPath):null;


    //ERROR BELOW THIS LINE IS COMING FROM CLOUDINARY UPLOAD FAILURE
    
    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar image");
    }
    console.log(avatar);
   const user = await User.create({
    fullname,
    avatar: avatar.url || avatar.secure_url,
    coverImage: coverImage ? (coverImage.url || coverImage.secure_url) : "",
    email,
    username: username.toLowerCase(),
    password,
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if(!createdUser){
        throw new ApiError(500, "Failed to create user while saving to database");
    }
    
    //finally sending response to frontend
    return res.status(201).json(new ApiResponse(200, "User registered successfully", createdUser));
             
});   



//creating login user controller here

const loginUser = asyncHandler(async (req, res) => {
    //things to do in login controller
    //1->get user detials from frontend(abhi ke liye postman se bhejenge)
    //2->validate the user detials
    //3->check for user existence in database:username email
    //4->compare password with hashed password in db
    //5->generate refresh token and access token
    //6->save refresh token in database
    //7->send cookies response to frontend(without password and refresh token)
    const {email,username,password} = req.body;
    if(!(email || username))
       {
           throw new ApiError(400, "username or email is required");
       }   
    if( email && !email.includes("@")) {
        throw new ApiError(400, "Please enter a valid email");
    }
    if(password.length < 6){
        throw new ApiError(400, "Password must be at least 6 characters long");
    }
    const user=await User.findOne({
         $or:[{email},{username}]
    });
    if(!user){
        throw new ApiError(404, "User does not exist");
    }
    const isPasswordMatch = await user.isPasswordCorrect(password);
    if(!isPasswordMatch){
        throw new ApiError(401, "Invalid password");
    }
    //generate refresh token and access token
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    
    //user does not have refresh token as we added it after accessing it
    const loggedInUser = await User.findByIdAndUpdate(user.id).select("-password -refreshToken");

    //sendign cookies response to frontend
    const options={
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    console.log("this is Tokens",accessToken, refreshToken);
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "User logged in successfully"));

});


//logout user controller
const logoutUser = asyncHandler(async (req, res) => {
      await User.findByIdAndUpdate(req.user._id,{
          $set:{refreshToken: 1}
      },
      {
        new: true
      }
    );
    const options={
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, "User logged out successfully"));
});


//refresh access token controller   

const refreshAccessToken = asyncHandler(async (req, res) => {
      const incomingRefreshToken = req.body.refreshToken || req.cookies.refreshToken;
      if(!incomingRefreshToken){
          throw new ApiError(401, "Unauthorized request");
      }
     try{
     const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
     const user = await User.findById(decodedToken?._id);
     if(!user){
        throw new ApiError(401, "Invalid refresh token");
     }
     
    if(user?.refreshToken !== incomingRefreshToken){
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const options={
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }
    const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id);
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(new ApiResponse(200, {accessToken, refreshToken: newrefreshToken}, "Access token refreshed successfully"));
}catch(error){
    throw new ApiError(500, "Failed to refresh access token");
}
});



//now adding some user related function

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {currentPassword, newPassword} = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user.password) {
        if (currentPassword) {
            throw new ApiError(400, "You signed up with Google. Please leave 'Current Password' blank to set a new password.");
        }
    } else {
        const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Entered password is incorrect");
        }
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password updated successfully"));
});

//get current user

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user , "Current user fetched successfully"));
});

//update account details of current user

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;
    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required");
    }
    if (!email.includes("@")) {
        throw new ApiError(400, "Please enter a valid email");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                email
            }
        },
        { new: true }
    ).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User details updated successfully"
        )
    );
});


//now halding how to update or change files
const updateUserAvatar = asyncHandler(async (req, res) => {
      const avatarLocalPath = req.file?.path;
      if(!avatarLocalPath){
          throw new ApiError(400, "Avatar image is required To Update");
      }
      const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath); 
      if(!uploadedAvatar){
          throw new ApiError(500, "Error while uploading avatar");
      }

      
      const user = await User.findByIdAndUpdate(
          req.user._id,
          {
              $set: {
                  avatar: uploadedAvatar.url
                }
            },
            { new: true }
        ).select("-password -refreshToken");
        //NOTE-> we need to delete the previous as we got new
        //to delete we need public id of previous image and we can get it from url by splitting it
          const previousAvatarUrl = req.user.avatar;
          if(previousAvatarUrl){
              const publicId = previousAvatarUrl.split("/").slice(-1)[0].split(".")[0];
              await deleteFromCloudinary(publicId);
          }
        return res.status(200).json(
            new ApiResponse(
                200,    
                user,
                "User avatar updated successfully"
            )
        );
});

//update coverimage of user
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image is required To Update");
    }
    const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!uploadedCoverImage){
        throw new ApiError(500, "Error while uploading cover image");
    }

    
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {   
            $set: {
                coverImage: uploadedCoverImage.url
            }   
        },
        { new: true }
    ).select("-password -refreshToken");
    //delete previous cover image if exists in cloud
    const previousCoverImageUrl = req.user.coverImage;
    if(previousCoverImageUrl){
        const publicId = previousCoverImageUrl.split("/").slice(-1)[0].split(".")[0];
        await deleteFromCloudinary(publicId);
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User cover image updated successfully"
        )
    );
});



//now from here i will start adding controller for the main interface of chanel
//handling count of subs and videos and all thing relate to that in channel

const getUserChannelProfile = asyncHandler(async (req, res) => {
      const {username} = req.params;
      if(!username?.trim()){
          throw new ApiError(404, "User not found or missing");
      }

    //   getting channel details with aggregate function of mongoose and lookup for subs and videos
      const channel = await User.aggregate([
         {
            $match: { username: username.toLowerCase() }
          },{
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "chanel",
                as: "subscribers"
            }
         },{
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
         },{
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }  
            }
         },{
            // this is for chanel info
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                email: 1,
                coverImage: 1
            }
         }
      ])
      console.log(channel);
      if(!channel || channel.length === 0){
          throw new ApiError(404, "Channel does not exist");
      }
      return res
         .status(200)
         .json(new ApiResponse(
                200,
                channel[0],
                "Channel profile fetched successfully"
            )   
         )
});


//now controller for watch history

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate({
        path: "watchHistory",
        populate: {
            path: "owner",
            select: "fullname username avatar"
        }
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Mongoose populate preserves the array order. 
    // We reverse it so the most recent is first.
    const history = user.watchHistory.reverse();

    return res
        .status(200)
        .json(new ApiResponse(200, history, "Watch history fetched successfully"));
});


const googleLogin = asyncHandler(async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        throw new ApiError(400, "Google credential is required");
    }

    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
        const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        let username = baseUsername;
        let counter = 1;
        while (await User.findOne({ username })) {
            username = `${baseUsername}${counter}`;
            counter++;
        }

        user = await User.create({
            fullname: name,
            email,
            username,
            avatar: picture,
        });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "Google login successful"
            )
        )
});

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    googleLogin
};