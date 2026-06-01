# YouTube Clone Backend

This repository contains the full backend code for a YouTube-like video hosting API, built predominantly with the MERN stack (focusing on the backend - Node.js/Express and MongoDB). 

## 🚀 Key Features
- **User Authentication & Authorization:** Secure registration, login, and robust session management using Access and Refresh tokens.
- **Video Management:** Upload, publish, edit, and delete videos with metadata (title, description, thumbnails).
- **Social Features:** Ability to post tweets, leave comments on videos, and like/dislike content (videos, comments, tweets).
- **Subscription Model:** Users can subscribe to channels and track their subscriptions/subscribers.
- **Playlists:** Create, update, and delete playlists to organize videos.
- **Robust File Uploads:** Supports uploading avatars, cover images, and videos.

## 🛠️ Technologies & Packages Used
- **[Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/):** For handling the API layer and the server.
- **[MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/):** For database management and ODM schema modeling.
- **[Multer](https://www.npmjs.com/package/multer):** Middleware for handling `multipart/form-data`, primarily used for local file uploads (avatars, covers, videos).
- **[Cloudinary](https://cloudinary.com/):** Cloud media delivery service to securely host all user-uploaded files (images and videos).
- **[Bcrypt](https://www.npmjs.com/package/bcrypt):** To securely hash passwords before saving them in the database.
- **[JSON Web Tokens (JWT)](https://jwt.io/):** Employed for stateless API authentication (Access and Refresh Tokens).
- **[cookie-parser](https://www.npmjs.com/package/cookie-parser):** To securely parse and manage cookies handling authentication.
- **[mongoose-aggregate-paginate-v2](https://www.npmjs.com/package/mongoose-aggregate-paginate-v2):** A powerful plugin to execute advanced Mongoose aggregation pipelines with pagination.
- **[CORS](https://www.npmjs.com/package/cors):** To enable cross-origin requests securely.

## 📂 Project Structure
```
src/
├── controllers/       # Business logic for all the routes
├── db/                # Database connection setup
├── middlewares/       # Custom middlewares (e.g., auth.middleware.js, multer.middleware.js)
├── models/            # Mongoose schemas (User, Video, Comment, Like, Playlist, Subscription, Tweet)
├── routes/            # API Route definitions
├── utils/             # Utility classes (ApiError, ApiResponse, asyncHandler, Cloudinary logic)
├── app.js             # Express app configuration
└── index.js           # Entry point and DB connection call
```

## ⚙️ How to Setup Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ADITYASHUKLA189/youtube_backend.git
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add the necessary configuration variables:
   ```env
   PORT=3000
   MONGODB_URI=<your-mongodb-connection-string>
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=<your-access-token-secret>
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   ```

4. **Run the Application:**
   ```bash
   npm run dev
   ```

### Database ER Diagram
This is the database entity-relationship diagram we followed for planning out schemas:
![Image](./ErDiagram.png)
