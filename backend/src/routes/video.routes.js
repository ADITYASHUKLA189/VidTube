import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import upload from "../middlewares/multer.middleware.js"
import { validateRequest } from "../middlewares/validation.middleware.js"
import {
    publishVideoSchema,
    updateVideoSchema,
    getVideoSchema,
    deleteVideoSchema,
    togglePublishStatusSchema,
    getAllVideosSchema,
} from "../validations/video.validation.js"

const router = Router();
import { optionalVerifyJWT } from "../middlewares/auth.middleware.js";

router
    .route("/")
    .get(optionalVerifyJWT, validateRequest(getAllVideosSchema), getAllVideos)
    .post(
        verifyJWT,
        validateRequest(publishVideoSchema),
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(optionalVerifyJWT, validateRequest(getVideoSchema), getVideoById)
    .delete(verifyJWT, validateRequest(deleteVideoSchema), deleteVideo)
    .patch(verifyJWT, validateRequest(updateVideoSchema), upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(verifyJWT, validateRequest(togglePublishStatusSchema), togglePublishStatus);

export default router