import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/apiResponse.js"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.model.js"
import { Notification } from "../models/notification.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    
    const filter = { isPublished: true }
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } }
        ]
    }
    if (userId) {
        filter.owner = new mongoose.Types.ObjectId(userId)
    }

    const aggregate = Video.aggregate([
        { $match: filter },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        }
    ])

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortType === "asc" ? 1 : -1 }
    }

    const result = await Video.aggregatePaginate(aggregate, options)

    return res.status(200).json(
        new ApiResponse(200, result, "Videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, tags } = req.body
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(500, "Video upload failed")
    }
    if (!thumbnail) {
        throw new ApiError(500, "Thumbnail upload failed")
    }

    let parsedTags = [];
    if (tags) {
        // Handle if tags are sent as a comma separated string
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) : tags;
    }

    const video = await Video.create({
        title,
        description,
        tags: parsedTags,
        videoFile: (typeof videoFile === 'object' && videoFile !== null) ? videoFile.secure_url : videoFile,
        thumbnail: (typeof thumbnail === 'object' && thumbnail !== null) ? thumbnail.secure_url : thumbnail,
        duration: videoFile?.duration || 120,
        owner: req.user._id,
        isPublished: true
    })

    // Notification Logic
    const subscribers = await Subscription.find({ chanel: req.user._id });
    console.log(`[publishAVideo] Found ${subscribers.length} subscribers for channel ${req.user._id}`);
    
    const notificationDocs = subscribers.map((sub) => ({
        recipient: sub.subscriber,
        sender: req.user._id,
        video: video._id,
        message: `${req.user.fullname || req.user.username} uploaded a new video: ${video.title}`
    }));

    if (notificationDocs.length > 0) {
        const createdNotifications = await Notification.insertMany(notificationDocs);
        console.log(`[publishAVideo] Inserted ${createdNotifications.length} notifications`);
        
        const populatedNotifications = await Notification.populate(createdNotifications, [
            { path: 'sender', select: 'fullname username avatar' },
            { path: 'video', select: 'title thumbnail' }
        ]);

        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets');
        
        if (io && userSockets) {
            populatedNotifications.forEach((notification) => {
                const recipientId = notification.recipient.toString();
                const socketId = userSockets.get(recipientId);
                if (socketId) {
                    io.to(socketId).emit('new-notification', notification);
                }
            });
        }
    }

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const videoList = await Video.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "chanel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: { $size: "$subscribers" },
                            isSubscribed: {
                                $in: [req.user?._id || null, "$subscribers.subscriber"]
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                },
                owner: { $first: "$owner" }
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ])

    if (!videoList || videoList.length === 0) {
        throw new ApiError(404, "Video not found")
    }

    const videoObj = videoList[0]
    const video = await Video.findById(videoId);

    // Increment views logic
    if (req.user?._id?.toString() !== video.owner.toString()) {
        let shouldIncrement = true;
        if (req.user) {
            const user = await mongoose.model('User').findById(req.user._id);
            if (user && user.watchHistory.includes(videoId)) {
                shouldIncrement = false;
            }
        }
        if (shouldIncrement) {
            await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
            // update the local video object so the frontend gets the incremented count immediately
            videoObj.views += 1;
        }
    }

    // Add video to user's watch history (move to end if already exists)
    if (req.user) {
        await mongoose.model('User').findByIdAndUpdate(
            req.user._id,
            { $pull: { watchHistory: videoId } }
        );
        await mongoose.model('User').findByIdAndUpdate(
            req.user._id,
            { $push: { watchHistory: videoId } }
        );
    }

    return res.status(200).json(
        new ApiResponse(200, videoObj, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailLocalPath = req.file?.path

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this video")
    }

    const updateFields = {}
    if (title) updateFields.title = title
    if (description) updateFields.description = description

    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnail) {
            throw new ApiError(500, "Thumbnail upload failed")
        }
        updateFields.thumbnail = thumbnail.url

        // Delete old thumbnail
        const oldThumbnailUrl = video.thumbnail
        if (oldThumbnailUrl) {
            const publicId = oldThumbnailUrl.split("/").slice(-1)[0].split(".")[0]
            await deleteFromCloudinary(publicId)
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video details updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this video")
    }

    // Delete files from Cloudinary
    if (video.videoFile) {
        const publicId = video.videoFile.split("/").slice(-1)[0].split(".")[0]
        await deleteFromCloudinary(publicId, "video")
    }
    if (video.thumbnail) {
        const publicId = video.thumbnail.split("/").slice(-1)[0].split(".")[0]
        await deleteFromCloudinary(publicId)
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to toggle publish status")
    }

    video.isPublished = !video.isPublished
    await video.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, video, "Video publish status toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
