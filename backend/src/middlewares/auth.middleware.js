
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT=asyncHandler(async (req,res,next)=>{
    try{
    const Token= req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ", "");
    if(!Token){
        throw new ApiError(401, "Unauthorized");
    }

    const decodedToken= jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);
    
   const user= await User.findById(decodedToken._id).select("-password -refreshToken");
    if(!user){
        throw new ApiError(401, "Unauthorized");
    }
    req.user=user;   //user ko request object me attach kr diya taki aage ke controllers me use kr ske(very important step)
    next();
    }catch(error){
        throw new ApiError(401,error?.message || "invalid token");
    }

});

export const optionalVerifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!Token) {
            return next();
        }

        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if (user) {
            req.user = user;
        }
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid token");
    }
});