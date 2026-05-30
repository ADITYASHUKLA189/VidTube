import {Router} from 'express';
import {loginUser,registerUser,logoutUser} from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { refreshAccessToken } from '../controllers/user.controller.js';
const router=Router();


//register se phele multer middleware chalega jo
//  ki image ko handle karega and then registerUser
//  controller chalega jo ki user registration ka logic handle karega
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);


//secured route 
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);




export default router;