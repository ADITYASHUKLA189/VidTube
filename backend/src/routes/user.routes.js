import {Router} from 'express';
import { registerUser,loginUser,logoutUser,refreshAccessToken,
         changeCurrentPassword,getCurrentUser,updateAccountDetails,
         updateUserAvatar,updateUserCoverImage,getUserChannelProfile,
         getWatchHistory, googleLogin
       } from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js';
import { verifyJWT, optionalVerifyJWT } from '../middlewares/auth.middleware.js';
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
router.route("/google-login").post(googleLogin);


//secured route 
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/channel/:username").get(optionalVerifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;