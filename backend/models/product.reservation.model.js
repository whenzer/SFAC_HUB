import mongoose from "mongoose";
import {conn} from './product.model.js';

// Stock/Product schema
const reservationSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email:{
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
    reservationID: {
        type: String,
        required: true
    },
    purpose:{
        type: String,
    },
    status: { type: String, enum: ["Pending", "Collected", "Cancelled", "Expired"], default: "Pending"},
    reservedAt: { type: Date, default: Date.now },
}, { timestamps: true });


const Reservation = conn.model("Reservation", reservationSchema);

export default Reservation;