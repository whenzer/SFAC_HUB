import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import cloudinary from '../config/cloudinary.js';

export const userRegister = async (req, res) => {
    const user = req.body;

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;

        // Ensure the image is a Data URI
        let imageData = user.idpic.image;
        if (!imageData.startsWith('data:')) {
            // If only base64, add a default prefix (adjust if needed)
            imageData = `data:image/png;base64,${imageData}`;
        }

        // Upload idpic image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(imageData, {
            folder: 'sfac_users',
            public_id: user.idpic.filename.split('.')[0], // optional
        });

        // Store only the Cloudinary URL in idpic.image
        user.idpic.image = uploadResult.secure_url;

        const newUser = new User(user);
        await newUser.save();
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        console.error("Error in Create User: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const userLogin = async (req, res) => {
    
}