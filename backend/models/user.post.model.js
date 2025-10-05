import {conn} from "./user.model.js";
import mongoose from 'mongoose';


const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { 
        postType:{
            type: String,
            enum: ["Lost", "Found"],
            required: true
        },
        briefTitle: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ["Electronics", "Clothing", "Accessories", "Books & Materials", "Documents", "Other"],
            required: true
        },
        location: {
            type: String,
            required: true
        },
        photo: {
            filename: {
                type: String,
                required: true
            },
            image: {
                type: String,
                required: true
            }
        },
        status: { 
            type: String, 
            enum: ["Open", "Resolved"],
            default: "Open" 
        },
        likes: { users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], count: { type: Number, default: 0 }},
        comments: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, comment: String, commentedAt: { type: Date, default: Date.now } }],
        claimedby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
},{ timestamps: true});
const Post = conn.model('Post', postSchema);
export default Post;
