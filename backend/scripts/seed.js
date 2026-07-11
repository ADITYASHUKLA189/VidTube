import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const API_BASE_URL = `http://localhost:${PORT}/api/v1`;

const TEMP_DIR = path.resolve('./scripts/temp');

// 3 Small and fast public sample videos
const SAMPLE_VIDEOS = [
  {
    url: "https://download.samplelib.com/mp4/sample-5s.mp4",
    title: "Building a YouTube Clone with MERN Stack!",
    description: "Walkthrough of building a fully-featured YouTube clone using MongoDB, Express, React, Node, and Tailwind CSS. We cover CORS, JWTs, and file upload middlewares."
  },
  {
    url: "https://download.samplelib.com/mp4/sample-10s.mp4",
    title: "10 CSS Tricks You Must Know in 2026",
    description: "Discover 10 life-changing CSS properties and tricks that will level up your frontend styling game. Grid alignment, backdrop filters, custom scrollbars, and container queries explained simply."
  },
  {
    url: "https://download.samplelib.com/mp4/sample-15s.mp4",
    title: "A Day in the Life of a Software Engineer",
    description: "An honest look into the daily schedule of a remote software developer. Coding sessions, system architecture reviews, team syncs, and how to stay productive working from home."
  }
];

// Reusable avatar/thumbnail image endpoints
const AVATAR_URL = "https://picsum.photos/300/300";
const THUMBNAIL_URL = "https://picsum.photos/1280/720";

const DUMMY_USERS = [
  {
    fullname: "Alice Creator",
    username: "alice_creator",
    email: "alice@vidtube.com",
    password: "password123"
  },
  {
    fullname: "Bob Vlogger",
    username: "bob_vlogger",
    email: "bob@vidtube.com",
    password: "password123"
  },
  {
    fullname: "Charlie Streamer",
    username: "charlie_streamer",
    email: "charlie@vidtube.com",
    password: "password123"
  }
];

// Helper to download a file from URL using streams and browser User-Agent
const downloadFile = async (url, destPath) => {
  console.log(`Downloading: ${url} -> ${path.basename(destPath)}`);
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*'
    }
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);
    writer.on('finish', () => resolve(destPath));
    writer.on('error', (err) => {
      writer.close();
      reject(err);
    });
  });
};

async function main() {
  console.log("=== VidTube Database Seeding Script Starting ===");
  console.log(`Targeting base API URL: ${API_BASE_URL}`);

  // 1. Ensure temp directory exists
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  // 2. Download shared resources
  const avatarPath = path.join(TEMP_DIR, 'avatar.jpg');
  const coverPath = path.join(TEMP_DIR, 'cover.jpg');
  const thumbPath = path.join(TEMP_DIR, 'thumbnail.jpg');

  try {
    await downloadFile(AVATAR_URL, avatarPath);
    await downloadFile(THUMBNAIL_URL, coverPath);
    await downloadFile(THUMBNAIL_URL, thumbPath);
  } catch (err) {
    console.error("Failed to download prerequisite placeholder images:", err.message);
    process.exit(1);
  }

  // 3. Process each dummy user
  for (let i = 0; i < DUMMY_USERS.length; i++) {
    const user = DUMMY_USERS[i];
    console.log(`\n--- Processing User: ${user.username} ---`);

    // Download a unique video file for this user
    const videoData = SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length];
    const videoPath = path.join(TEMP_DIR, `video_${i}.mp4`);

    try {
      await downloadFile(videoData.url, videoPath);
    } catch (err) {
      console.error(`Failed to download sample video for ${user.username}:`, err.message);
      continue;
    }

    // A. Register User
    try {
      console.log(`Registering user ${user.username}...`);
      const form = new FormData();
      form.append('fullname', user.fullname);
      form.append('username', user.username);
      form.append('email', user.email);
      form.append('password', user.password);
      form.append('avatar', fs.createReadStream(avatarPath));
      form.append('coverImage', fs.createReadStream(coverPath));

      const registerRes = await axios.post(`${API_BASE_URL}/users/register`, form, {
        headers: form.getHeaders()
      });
      console.log(`✅ User registered successfully: ${registerRes.data?.message || 'Success'}`);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      if (status === 409) {
        console.log(`ℹ️ User ${user.username} already exists in DB. Skipping registration.`);
      } else {
        console.error(`❌ Registration failed for ${user.username}: ${msg}`);
        continue;
      }
    }

    let token = '';
    try {
      console.log(`Logging in ${user.username}...`);
      const loginRes = await axios.post(`${API_BASE_URL}/users/login`, {
        username: user.username,
        password: user.password
      });

      console.log("Login raw response data:", JSON.stringify(loginRes.data, null, 2));

      token = loginRes.data?.success?.accessToken || loginRes.data?.data?.accessToken || loginRes.data?.accessToken;
      if (!token) {
        throw new Error("AccessToken missing in response payload");
      }
      console.log("✅ Logged in successfully. Token acquired.");
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(`❌ Login failed for ${user.username}: ${msg}`);
      continue;
    }

    // C. Upload Video
    try {
      console.log(`Uploading video "${videoData.title}" for ${user.username}...`);
      const form = new FormData();
      form.append('title', videoData.title);
      form.append('description', videoData.description);
      form.append('videoFile', fs.createReadStream(videoPath));
      form.append('thumbnail', fs.createReadStream(thumbPath));

      const uploadRes = await axios.post(`${API_BASE_URL}/videos`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      });
      console.log(`✅ Video uploaded successfully! Video ID: ${uploadRes.data?.data?._id || 'Success'}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(`❌ Video upload failed for ${user.username}: ${msg}`);
    }
  }

  // 4. Cleanup temp folder
  console.log("\nCleaning up temp files...");
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log("✅ Cleanup completed.");
  } catch (err) {
    console.error("Warning: Failed to delete temp directory:", err.message);
  }

  console.log("\n=== Database Seeding Complete ===");
}

main().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
