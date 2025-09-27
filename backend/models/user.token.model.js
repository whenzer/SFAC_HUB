import mongoose from "mongoose";
// This file defines the Token model for the Tokens database
// It includes fields for userId and refreshToken
// Importing mongoose to define the schema
const TokenSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    refreshToken: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7 * 24 * 60 * 60 
    }
});

let conn;
try {
    conn = mongoose.createConnection(process.env.USERS_URI);
    console.log("Connected to Users database for Tokens");
} catch (error) {
    console.error("Error connecting to Users database for Tokens:", error);
}

const Token = conn.model('Refresh', TokenSchema);
export default Token;
