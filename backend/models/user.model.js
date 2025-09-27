import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    middlename:{
        type: String,
        default: ""
    },
    lastname:{
        type:String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    idpic: {
        filename: {
            type: String,
            required: true 
        },
        image: {
            type: String,
            required: true
        }
    },
    verifiedEmail: {
        type: Boolean,
        default: false
    },
    verifiedID: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: true
    }
});

let conn;
try {
    conn = mongoose.createConnection(process.env.USERS_URI);
    console.log("Connected to Users database");
} catch (error) {
    console.error("Error connecting to Users database:", error);
}

const User = conn.model('User', userSchema);
export default User;
