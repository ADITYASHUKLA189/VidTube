import {v2 as cloudinary} from cloudinary;

//nodejs file system module help is read and write files
import fs from 'fs';


cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if(!filePath) throw new Error("File path is required");
        const result = await cloudinary.uploader.upload(filePath, { folder: "youtube-clone",resource_type: "auto" });
        //delete the file from local storage after uploading on cloudinary
        fs.unlinkSync(filePath);
        console.log('File uploaded to Cloudinary successfully:', result.secure_url);
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        throw error;
    }  
};

export default uploadOnCloudinary;