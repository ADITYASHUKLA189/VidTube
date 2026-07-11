import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/apiResponse.js"
import { Like } from "../models/like.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Video unliked successfully")
        )
    } else {
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        return res.status(201).json(
            new ApiResponse(201, { liked: true, like: newLike }, "Video liked successfully")
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Comment unliked successfully")
        )
    } else {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        return res.status(201).json(
            new ApiResponse(201, { liked: true, like: newLike }, "Comment liked successfully")
        )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Tweet unliked successfully")
        )
    } else {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        return res.status(201).json(
            new ApiResponse(201, { liked: true, like: newLike }, "Tweet liked successfully")
        )
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    // Find all likes by req.user._id that have a video reference, and populate video
    const likedVideos = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true, $ne: null }
    }).populate({
        path: "video",
        populate: {
            path: "owner",
            select: "username fullname avatar"
        }
    }).sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}
