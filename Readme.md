# VidTube - Full Stack Video Streaming Platform

VidTube is a complete YouTube-like video streaming platform built with the MERN stack (MongoDB, Express, React, Node.js). It features a robust backend API and a beautiful, modern frontend using Tailwind CSS. 

## 🚀 Key Features

### Frontend (React/Vite)
- **Modern UI/UX:** Built with Tailwind CSS, featuring a responsive, dark-mode first, glassmorphism design.
- **Video Player:** Custom video player integration using `Plyr` with HLS (HTTP Live Streaming) support for optimized video delivery, speed, and quality controls.
- **Real-Time Notifications:** Live push notifications for new video uploads using `Socket.io`.
- **Infinite Scrolling:** Seamlessly browse videos and search results without manual pagination.
- **Authentication:** Secure Google OAuth integration alongside traditional JWT-based login/signup.
- **State Management:** Powered by Redux Toolkit for efficient global state handling.

### Backend (Node.js/Express)
- **User Authentication:** Secure registration, login, and robust session management using Access and Refresh tokens (JWT), plus Google OAuth flow.
- **Video Management:** Upload, publish, edit, and delete videos with metadata. Support for large chunked uploads.
- **Real-Time WebSockets:** `Socket.io` server integration to instantly broadcast events (like new video publishes) to active subscribers.
- **Social Features:** Ability to post tweets, leave comments on videos, and like/dislike content (videos, comments, tweets).
- **Subscription Model:** Users can subscribe to channels and track their subscriptions/subscribers.
- **Playlists:** Create, update, and delete playlists to organize videos.
- **Robust File Uploads:** Supports uploading avatars, cover images, and videos via `Multer` and `Cloudinary`.

## 🛠️ Technologies & Packages Used

### Frontend Stack
- **React 19 & Vite:** Lightning-fast frontend tooling and component rendering.
- **Tailwind CSS:** Utility-first framework for styling.
- **Redux Toolkit:** State management.
- **React Router v7:** Client-side routing.
- **Plyr & HLS.js:** Advanced video player components.
- **Socket.io-client:** Real-time bi-directional event communication.
- **Axios:** API request handling.

### Backend Stack
- **Node.js & Express.js:** API layer and server routing.
- **MongoDB & Mongoose:** Database management and ODM schema modeling.
- **Socket.io:** Real-time event broadcasting.
- **Multer:** Middleware for handling `multipart/form-data` uploads.
- **Cloudinary:** Cloud media delivery service to securely host all user-uploaded files.
- **Bcrypt & JWT:** Password hashing and stateless API authentication.
- **Google Auth Library:** Verifying OAuth credentials securely.
- **mongoose-aggregate-paginate-v2:** Advanced Mongoose aggregation pipelines with pagination.

## 📂 Project Structure
```
VidTube/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Business logic for all routes
│   │   ├── db/            # Database connection setup
│   │   ├── middlewares/   # Custom middlewares (auth, validation, multer)
│   │   ├── models/        # Mongoose schemas (User, Video, Comment, etc.)
│   │   ├── routes/        # API Route definitions
│   │   ├── utils/         # Utility classes (ApiError, Cloudinary logic)
│   │   └── index.js       # Entry point and Socket.io setup
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/           # Axios interceptors and API wrapper functions
    │   ├── app/           # Redux store setup
    │   ├── components/    # Reusable UI components (VideoCard, Player, Layout)
    │   ├── contexts/      # React Contexts (SocketContext for real-time alerts)
    │   ├── features/      # Redux slices (authSlice, uiSlice)
    │   ├── pages/         # Page-level components (Home, Watch, Upload, Search)
    │   ├── styles/        # Global Tailwind CSS entry
    │   ├── App.jsx        # App routing and layout wrap
    │   └── main.jsx       # React DOM mount
    ├── tailwind.config.js
    └── package.json
```

## ⚙️ How to Setup Locally

### 1. Backend Setup
Navigate into the backend directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGODB_URI=<your-mongodb-connection-string>
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=<your-access-token-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```
Run the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```
Start the frontend development server:
```bash
npm run dev
```

Your app will now be running with the frontend accessible at `http://localhost:5173` and the backend at `http://localhost:3000`.

### Database ER Diagram
This is the database entity-relationship diagram followed for planning out the schemas:
![Image](./backend/public/temp/ErDiagram.png)
*(Note: adjust path to ER diagram image if applicable)*
