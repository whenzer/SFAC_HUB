import Product from "../models/product.model.js";

export const protectedController = (req, res) => {
    res.status(200).json({ success: true, message: "access granted!" });
}

export const dashboardController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to dashboard!", user: req.user });
}

export const stockController = async (req, res) => {
    try{
        const products = await Product.find();
        //automated status update based on currentStock
        for (let product of products) {
            if (product.currentStock === 0 && product.status !== "Out") {
                product.status = "Out";
                await product.save();
            } else if (product.currentStock > 0 && product.currentStock <= 5 && product.status !== "Low") {
                product.status = "Low";
                await product.save();
            } else if (product.currentStock > 5 && product.status !== "Available") {
                product.status = "Available";
                await product.save();
            }
        }
        res.status(200).json({ success: true, message: "welcome to Stock Availability!", user: req.user, products });
    } catch (error) {
        console.error("Error fetching products: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const reservationController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to Reservation!", user: req.user });
}

export const lostandfoundController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to Lost and Found!", user: req.user });
}

export const stockreserveController = (req, res) => {
    res.status(200).json({ success: true, message: "Stock Reserved!", user: req.user });
}