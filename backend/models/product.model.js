import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Stock/Product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
    totalStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: function () {
      return this.totalStock;
    },
  },

  status: {
    type: String,
    enum: ["Available", "Low", "Out"],
    default: "Available"
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    required: true
  },
  reservers: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    reservationID: { type: String, required: true },
    purpose: { type: String, default: "N/A" },
    reservedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["Pending", "Collected", "Cancelled", "Expired"], default: "Pending"}
  }]
}, { timestamps: true });


let conn;
try {
    conn = mongoose.createConnection(process.env.PRODUCTS_URI);
    console.log("Connected to Products database");
} catch (error) {
    console.error("Error connecting to Products database:", error);
}

const Product = conn.model("Product", productSchema);

export default Product;