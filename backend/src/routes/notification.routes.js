import { Router } from 'express';
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead
} from "../controllers/notification.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);

router.route("/").get(getUserNotifications);
router.route("/read-all").patch(markAllAsRead);
router.route("/:notificationId/read").patch(markAsRead);

export default router;
