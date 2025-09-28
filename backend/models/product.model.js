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
    min: 0
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
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }
  }]
}, { timestamps: true });


let conn;
try {
    conn = mongoose.createConnection(process.env.PRODUCTS_URI);
    console.log("Connected to Products database");
} catch (error) {
    console.error("Error connecting to Products database:", error);
}

productSchema.pre('save', function(next) {
  if (this.currentStock > this.totalStock) {
    this.currentStock = this.totalStock;
  }
  next();
});

const Product = conn.model("Product", productSchema);

export {conn};

export default Product;