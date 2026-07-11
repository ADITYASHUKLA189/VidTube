import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/apiResponse.js"
import { Subscription } from "../models/subscription.model.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    const existingSub = await Subscription.findOne({
        subscriber: req.user._id,
        chanel: channelId
    })

    if (existingSub) {
        await Subscription.findByIdAndDelete(existingSub._id)
        return res.status(200).json(
            new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
        )
    } else {
        const newSub = await Subscription.create({
            subscriber: req.user._id,
            chanel: channelId
        })
        return res.status(201).json(
            new ApiResponse(201, { subscribed: true, subscription: newSub }, "Subscribed successfully")
        )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params // Note: backend route: /u/:subscriberId -> but this gets subscribers of that channel!
    if (!subscriberId) {
        throw new ApiError(400, "Subscriber ID / Channel ID is required")
    }

    const subscribers = await Subscription.find({
        chanel: subscriberId
    }).populate("subscriber", "username fullname avatar")

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )
})

// controller to return channel list to which a user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params // Note: backend route: /c/:channelId -> subscriber user id!
    if (!channelId) {
        throw new ApiError(400, "Channel ID / User ID is required")
    }

    const subscribedTo = await Subscription.find({
        subscriber: channelId
    }).populate("chanel", "username fullname avatar")

    return res.status(200).json(
        new ApiResponse(200, subscribedTo, "Subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
