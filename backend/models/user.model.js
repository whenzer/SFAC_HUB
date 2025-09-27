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
    },
    reservedItems: [{ 
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        email: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        reservationID: { type: String, required: true },
        purpose: { type: String, default: "N/A" },
        reservedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["Pending", "Collected", "Cancelled"], default: "Pending"}
    }]
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
