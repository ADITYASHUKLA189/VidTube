import {v2 as cloudinary} from "cloudinary";

//nodejs file system module help is read and write files
import fs from 'fs';


cloudinary.config({ 
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filePath, options = {}) => {
    try {
        if(!filePath) throw new Error("File path is required");
        const stats = fs.statSync(filePath);
        let result;
        
        if (stats.size > 20000000) { // If larger than 20MB, use chunked upload
            result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_large(filePath, {
                    folder: "youtube-clone",
                    resource_type: "auto",
                    chunk_size: 20000000,
                    ...options
                }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });
        } else {
            result = await cloudinary.uploader.upload(filePath, { 
                folder: "youtube-clone",
                resource_type: "auto",
                ...options
            });
        }
        //delete the file from local storage after uploading on cloudinary
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.log('File uploaded to Cloudinary successfully:', result.secure_url);
        return result;
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        // If the upload fails, ensure we also delete the local file so it doesn't pile up
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return null;
    }  
};


const deleteFromCloudinary = async (publicId) => {
    try {
        if(!publicId) throw new Error("Public ID is required");
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('File deleted from Cloudinary successfully:', result);
        return result;
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        throw error;
    }   
};

export { uploadOnCloudinary, deleteFromCloudinary };