import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const adminController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to Admin Panel!", user: req.user });
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password -__v -reservedItems'); // Exclude sensitive fields
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const verifyUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.verifiedEmail = true;
        user.verifiedID = true;
        await user.save();
        res.status(200).json({ success: true, message: "User verified successfully" });
    } catch (error) {
        console.error("Error verifying user: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const resetUserPassword = async (req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ success: true, message: "User password reset successfully" });
    } catch (error) {
        console.error("Error resetting user password: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

