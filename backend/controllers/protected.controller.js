import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const protectedController = (req, res) => {
    res.status(200).json({ success: true, message: "access granted!" });
}

export const dashboardController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to dashboard!", user: req.user });
}

export const stockController = async (req, res, next) => {
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

            if (req.originalUrl.endsWith("/stock")) {
                return res.status(200).json({
                success: true,
                message: "welcome to Stock Availability!",
                user: req.user,
                products,
            });
        }

    // Otherwise, pass control to the next handler (e.g., stockreserveController)
    next();

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
    
    const { productId, quantity, email, reservationID, purpose } = req.body;
    const userId = req.user._id;
    if (!productId || !quantity || !email || !reservationID) {
        return res.status(400).json({ success: false, message: "Product ID, quantity, email, and reservationID are required" });
    }
    if (quantity <= 0) {
        return res.status(400).json({ success: false, message: "Quantity must be greater than zero" });
    }
    try {
        // findbyid no longer accepts a callback
        Product.findById(productId).then(async (product) => {
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }
            if (product.currentStock < quantity) {
                return res.status(400).json({ success: false, message: "Insufficient stock available" });
            }
            // Deduct stock
            product.currentStock -= quantity;
            // Add reserver info
            product.reservers.push({ user: userId, email, quantity, reservationID, purpose });
            await product.save();
            res.status(200).json({ success: true, message: "Product reserved successfully", product });
        });
        // Also update user's reservedItems
        User.findById(userId).then(async (user) => {
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            user.reservedItems.push({ item: productId, email, quantity, reservationID, purpose });
            await user.save();
        });
        
    } catch (error) {
        console.error("Error reserving product: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
    // if (!productId || !quantity || !email) {
    //     return res.status(400).json({ success: false, message: "Product ID, quantity, and email are required" });
    // }
    // if (quantity <= 0) {
    //     return res.status(400).json({ success: false, message: "Quantity must be greater than zero" });
    // }
    // try {
    //     Product.findById(productId, async (err, product) => {
    //         if (err || !product) {
    //             return res.status(404).json({ success: false, message: "Product not found" });
    //         }
    //         if (product.currentStock < quantity) {
    //             return res.status(400).json({ success: false, message: "Insufficient stock available" });
    //         }
    //         // Deduct stock
    //         product.currentStock -= quantity;
    //         // Add reserver info
    //         product.reservers.push({ user: userId, email, quantity });
    //         await product.save();
    //         res.status(200).json({ success: true, message: "Product reserved successfully", product });
    //     });
    //     // Also update user's reservedItems
    //     User.findById(userId, async (err, user) => {
    //         if (err || !user) {
    //             return res.status(404).json({ success: false, message: "User not found" });
    //         }
    //         user.reservedItems.push({ item: productId, quantity });
    //         await user.save();
    //     });
    // } catch (error) {
    //     console.error("Error reserving product: ", error.message);
    //     res.status(500).json({ success: false, message: error.message });
    // }
}