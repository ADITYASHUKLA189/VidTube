import monogoose from 'mongoose';

const tweetSchema = new monogoose.Schema({
    content:{
        type: String,
        required: true,
    },
    owner:{
        type: monogoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
},{timestamps:true});

export const Tweet = monogoose.model("Tweet", tweetSchema);