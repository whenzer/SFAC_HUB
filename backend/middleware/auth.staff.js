import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const authenticateStaff = async (req, res, next) => {
    try {
        // 1️⃣ Get token from headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        // 2️⃣ Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userRole = await User.findById(decoded._id).select('role');
        // 3️⃣ Check if user role is staff
        if (!userRole.role || (userRole.role !== 'staff' && userRole.role !== 'admin')) {
            return res.status(403).json({ success: false, message: 'Access denied. Staff only.' });
        }
        // 4️⃣ Attach user info to request object
        req.user = decoded;
        next(); // allow access
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export default authenticateStaff;