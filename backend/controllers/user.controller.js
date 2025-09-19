import User from '../models/user.model.js';

export const userRegister = async (req, res) => {
    const user = req.body;

    

    const newUser = new User(user);
    try{
        await newUser.save();
        res.status(201).json({success: true, data: newUser});
    }catch(error){
        console.error("Error in Create User: ", error.message);
        res.status(500).json({success: false, message: error.message});
    }
}