import { v2 as cloudinary } from 'cloudinary';

// 1. Define the configuration logic inside a function
export const configureCloudinary = () => {
    // This code will only execute when you call configureCloudinary()
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("Cloudinary has been successfully configured.");
};

// 2. Export the main cloudinary object so controllers can use its methods
export default cloudinary;