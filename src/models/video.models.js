import monogoose from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new monogoose.Schema({
    videoFile:{
        type: String,//claudinary url
        required: true,
    },
    thumbnail:{
        type: String,//claudinary url
        required: true,
    },
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    views:{
        type: Number,
        default: 0,
    },
    duration:{
        type: Number, //cludinary url will give this
        required: true,
    },
    isPublished:{
        type: Boolean,
        default: true,
    },
    owner:{
        type: monogoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, 
    }



},{timestamps:true});


videoSchema.plugin(mongooseAggregatePaginate);

export const Video = monogoose.model("Video", videoSchema); 