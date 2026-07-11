import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
    getCommentReplies,
    addReply
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
import { optionalVerifyJWT } from "../middlewares/auth.middleware.js";

router.route("/:videoId").get(optionalVerifyJWT, getVideoComments).post(verifyJWT, addComment);
router.route("/c/:commentId").delete(verifyJWT, deleteComment).patch(verifyJWT, updateComment);
router.route("/c/:commentId/reply").post(verifyJWT, addReply);
router.route("/c/:commentId/replies").get(optionalVerifyJWT, getCommentReplies);

export default router;