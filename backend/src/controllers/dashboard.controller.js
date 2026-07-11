import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Total videos uploaded
    const totalVideos = await Video.countDocuments({ owner: req.user._id })

    // Fetch all user videos to get IDs and calculate total views
    const videos = await Video.find({ owner: req.user._id })
    const totalViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0)

    // Total subscribers of this channel (using chanel schema field name)
    const totalSubscribers = await Subscription.countDocuments({ chanel: req.user._id })

    // Total likes across all owned videos
    const videoIds = videos.map((v) => v._id)
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } })

    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            totalViews,
            totalSubscribers,
            totalLikes
        }, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // Fetch all videos uploaded by user
    const videos = await Video.find({ owner: req.user._id }).sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos
}
