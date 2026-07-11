import monogoose from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new monogoose.Schema({
    content:{
        type: String,
        required: true,
    },
    video:{
        type: monogoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    parentComment: {
        type: monogoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    owner:{
        type: monogoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
},{timestamps:true});

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = monogoose.model("Comment", commentSchema);

