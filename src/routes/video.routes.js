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
import {upload} from "../middlewares/multer.middleware.js"
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
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(validateRequest(getAllVideosSchema), getAllVideos)
    .post(
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
    .get(validateRequest(getVideoSchema), getVideoById)
    .delete(validateRequest(deleteVideoSchema), deleteVideo)
    .patch(validateRequest(updateVideoSchema), upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(validateRequest(togglePublishStatusSchema), togglePublishStatus);

export default router