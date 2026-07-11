import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname:{
        type: String,
        required: true,
        trim: true,
        index:true,
    },
    avatar:{
        type: String,//claudinary url
        required: true,
    },
    coverImage:{
        type: String,//claudinary url
    },
    watchHistory:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    }],
    password:{
        type: String,
    },
    refreshToken:{
        type: String,
    },
    
    
},{timestamps: true});


//hashing the password before saving the user
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});



//check password is correct or not
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}


//generate access token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({_id: this._id,email: this.email,username: this.username,fullname: this.fullname}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN});
}

//generate refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({_id: this._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN});
}

export const User = mongoose.model("User", userSchema);     