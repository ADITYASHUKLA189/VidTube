import monogoose from 'mongoose';

const likeSchema = new monogoose.Schema({
    video:{
        type: monogoose.Schema.Types.ObjectId,
        ref: "Video",
    },  
    comment:{
        type: monogoose.Schema.Types.ObjectId,
        ref: "Comment",
    },
    tweet:{
        type: monogoose.Schema.Types.ObjectId,
        ref: "Tweet",
    },
    likedBy:{
        type: monogoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},{timestamps:true});

export const Like = monogoose.model("Like", likeSchema);
