const { uploadOnCloudinary } = require('./src/utils/cloudinary.js');
const fs = require('fs');

(async () => {
    // Create a dummy file
    fs.writeFileSync('dummy.mp4', 'dummy data '.repeat(1000));
    console.log('Dummy file created');
    
    // Upload it
    const res = await uploadOnCloudinary('dummy.mp4', { resource_type: 'video' });
    console.log('Result keys:', Object.keys(res || {}));
    console.log('URL:', res?.url);
    console.log('Secure URL:', res?.secure_url);
    
    // Test upload_large manually
    fs.writeFileSync('dummy_large.mp4', 'dummy data '.repeat(2000000)); // Make it > 20MB
    const resLarge = await uploadOnCloudinary('dummy_large.mp4', { resource_type: 'video' });
    console.log('Large Result keys:', Object.keys(resLarge || {}));
    console.log('Large URL:', resLarge?.url);
    console.log('Large Secure URL:', resLarge?.secure_url);
})();
