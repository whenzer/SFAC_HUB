import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const userRegister = async (req, res) => {
    const user = req.body;

    try{
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
    }catch(error) {
        res.status(500).json({success: false, message: error.message});
    }

    const newUser = new User(user);
    try{
        await newUser.save();
        res.status(201).json({success: true, data: newUser});
    }catch(error){
        console.error("Error in Create User: ", error.message);
        res.status(500).json({success: false, message: error.message});
    }
}

export const userLogin = async (req, res) => {
    
}