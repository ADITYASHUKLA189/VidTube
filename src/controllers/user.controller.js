import  asyncHandler  from '../utils/asyncHandler.js';
import  ApiError from '../utils/ApiError.js';
import { User } from "../models/user.models.js";
import uploadOnCloudinary from '../utils/cloudinary.js';
import ApiResponse from '../utils/apiResponse.js';

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
    avatar: avatar,
    coverImage: coverImage || "",
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

export { registerUser };