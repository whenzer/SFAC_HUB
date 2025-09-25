import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

const authenticateLogin = async (req, res, next) => {
    const user = req.body;

    if (!user.email || !user.password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try{
        const existingUser = await User.find({ email: user.email });

        if (existingUser.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(user.password, existingUser[0].password);
        
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (!existingUser[0].verifiedEmail || !existingUser[0].verifiedID){
            return res.status(401).json({ success: false, message: "Access denied: your account is not yet verified by the Admin" });
        }

        req.body.user = existingUser[0].toObject();

    }catch (error) {
        console.error("Error in User Login: ", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }

    next();
}

export default authenticateLogin;