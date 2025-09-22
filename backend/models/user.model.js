import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    id: {
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
const User = mongoose.model('User', userSchema);
export default User;
