import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    subscriber: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //jo subscrone ker rha hai
    chanel: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // wo user jisko subscribe kiya
}, { timestamps: true });


export const Subscription = mongoose.model('Subscription', subscriptionSchema);
