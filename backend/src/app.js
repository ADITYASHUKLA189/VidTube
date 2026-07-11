import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

// Middleware-> how we are going to handle the request and response
//handling cors error
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(null, process.env.CORS_ORIGIN);
        }
    },
    credentials: true,
}));
//kitna json data lena hai
app.use(express.json({
    limit: '16kb',
}));
//handle url data
app.use(express.urlencoded({extended: true, limit: '16kb'}));
//handling files
app.use(express.static('public'));
//handling server cookies
app.use(cookieParser());

//routes
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import playlistRouter from './routes/playlist.routes.js';
import likeRouter from './routes/like.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import commentRouter from './routes/comment.routes.js';
import notificationRouter from './routes/notification.routes.js';

//routes declaration
app.get("/", (req, res) => {
    res.send("VidTube API is running successfully!");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/notifications", notificationRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
});

export default app;