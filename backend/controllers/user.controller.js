import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import cloudinary from '../config/cloudinary.js';
import jwt from 'jsonwebtoken';
import Token from '../models/user.token.model.js';

// User Registration

export const userRegister = async (req, res) => {
    const user = req.body;
    
    try {
        const existingUser = await User.find({ email: user.email });
        
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        // check cloudinary config
        if(cloudinary.config().cloud_name === undefined) {
            return res.status(500).json({ success: false, message: "Cloudinary is not configured properly" });
        }

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

// User Login
export const userLogin = async (req, res) => {
    
    try {
        const userPayload = req.body.user;
        delete userPayload.password; // Remove password from payload
        delete userPayload.__v; // Remove __v from payload 
        delete userPayload.reservedItems; // Remove reservedItems from payload
        const refreshToken = jwt.sign(
            userPayload,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        Token.create({ refreshToken, userId: userPayload._id });
        delete userPayload._id; // Remove _id from payload
        // Generate JWT token
        const accessToken = jwt.sign(
            userPayload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        

        // Send tokens to client 

        res.status(200).json({ success: true, accessToken, refreshToken });
    } catch (error) {
        console.error("Error in User Login: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const userToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Token is required" });
    }
    try {
        const existingToken = await Token.findOne({ refreshToken });
        if (!existingToken) {
            return res.status(403).json({ success: false, message: "Invalid token" });
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json({ success: false, message: "Invalid token" });
            const { iat, exp, ...userPayload } = user; // Exclude iat and exp from payload
            const accessToken = jwt.sign(
                userPayload,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );
            res.status(200).json({ success: true, accessToken });
        });
    }
    catch (error) {
        console.error("Error in Token Generation: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const userLogout = (req, res) => {

    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: "Token is required" });
    }
    //find one and delete no longer accepts a callback
    Token.findOneAndDelete({ refreshToken: token })
        .then(deletedToken => {
            if (!deletedToken) {
                return res.status(404).json({ success: false, message: "Token not found" });
            }
            res.status(200).json({ success: true, message: "Logged out successfully" });
        })
        .catch(error => {
            console.error("Error in User Logout: ", error.message);
            res.status(500).json({ success: false, message: error.message });
        });
}