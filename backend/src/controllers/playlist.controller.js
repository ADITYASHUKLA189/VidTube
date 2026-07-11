import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/apiResponse.js"
import { Playlist } from "../models/playlists.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required")
    }
    if (!description || description.trim() === "") {
        throw new ApiError(400, "Playlist description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    const playlist = await Playlist.findById(playlistId).populate({
        path: "videos",
        populate: {
            path: "owner",
            select: "username fullname avatar"
        }
    })

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required")
    }
    if (!description || description.trim() === "") {
        throw new ApiError(400, "Playlist description is required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this playlist")
    }

    playlist.name = name
    playlist.description = description
    await playlist.save()

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this playlist")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params
    if (!videoId || !playlistId) {
        throw new ApiError(400, "Video ID and Playlist ID are required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to add videos to this playlist")
    }

    // Check if video already exists in the playlist
    if (playlist.videos.includes(videoId)) {
        return res.status(200).json(
            new ApiResponse(200, playlist, "Video already exists in this playlist")
        )
    }

    playlist.videos.push(videoId)
    await playlist.save()

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params
    if (!videoId || !playlistId) {
        throw new ApiError(400, "Video ID and Playlist ID are required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to remove videos from this playlist")
    }

    playlist.videos = playlist.videos.filter((v) => v.toString() !== videoId.toString())
    await playlist.save()

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(400, "User ID is required")
    }

    const playlists = await Playlist.find({ owner: userId }).populate("videos")

    return res.status(200).json(
        new ApiResponse(200, playlists, "Playlists fetched successfully")
    )
})

export {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getUserPlaylists
}
