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
        enum: ["admin","teacher","staff", "student"],
        required: true
    },
    reservedItems: [{ 
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }
    }]
});

// // Virtual full name
// userSchema.virtual('name').get(function () {
//   return [this.firstname, this.middlename, this.lastname].filter(Boolean).join(' ');
// });

// // Ensure virtuals are included in JSON
// userSchema.set('toJSON', { virtuals: true });
// userSchema.set('toObject', { virtuals: true });

let conn;
try {
    conn = mongoose.createConnection(process.env.USERS_URI);
    console.log("Connected to Users database");
} catch (error) {
    console.error("Error connecting to Users database:", error);
}
export { conn };
const User = conn.model('User', userSchema);
export default User;
