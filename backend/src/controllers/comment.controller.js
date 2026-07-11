import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/apiResponse.js"
import { Comment } from "../models/comment.model.js"
import mongoose from "mongoose"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const aggregate = Comment.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(videoId), parentComment: null } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
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
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "parentComment",
                as: "replies"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                repliesCount: { $size: "$replies" },
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
                likes: 0,
                replies: 0
            }
        }
    ])

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
    }

    const result = await Comment.aggregatePaginate(aggregate, options)

    return res.status(200).json(
        new ApiResponse(200, result, "Comments fetched successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this comment")
    }

    comment.content = content
    await comment.save()

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)
    // delete all replies recursively?
    await Comment.deleteMany({ parentComment: commentId })

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )
})

const getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }

    const aggregate = Comment.aggregate([
        { $match: { parentComment: new mongoose.Types.ObjectId(commentId) } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
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

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: 1 } // oldest first for replies
    }

    const result = await Comment.aggregatePaginate(aggregate, options)

    return res.status(200).json(
        new ApiResponse(200, result, "Replies fetched successfully")
    )
})

const addReply = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!commentId) {
        throw new ApiError(400, "Parent comment ID is required")
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }

    const parentComment = await Comment.findById(commentId)
    if (!parentComment) {
        throw new ApiError(404, "Parent comment not found")
    }

    const reply = await Comment.create({
        content,
        video: parentComment.video,
        parentComment: commentId,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, reply, "Reply added successfully")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
    getCommentReplies,
    addReply
}
