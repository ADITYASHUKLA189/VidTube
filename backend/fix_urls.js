import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const videoSchema = new mongoose.Schema({}, { strict: false });
const Video = mongoose.model('Video', videoSchema);

async function fixUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI + '/videotube');
    console.log('Connected to DB');
    
    // Find videos with sp_4k or sp_hd in URL
    const videos = await Video.find({ videoFile: { $regex: /\/sp_(4k|hd)\// } });
    console.log(`Found ${videos.length} videos to fix.`);
    
    for (const video of videos) {
      let url = video.get('videoFile');
      if (url) {
        url = url.replace(/\/sp_(4k|hd)\//, '/').replace(/\.m3u8$/, '.mp4');
        video.set('videoFile', url);
        await video.save();
        console.log(`Fixed URL for video: ${video._id}`);
      }
    }
    
    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

fixUrls();
