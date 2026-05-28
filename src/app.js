import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

// Middleware-> how we are going to handle the request and response

//handling cors error
app.use(cors({
    origin: process.env.CORS_ORIGIN,
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

export default app;