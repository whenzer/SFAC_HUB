import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const protectedController = (req, res) => {
    res.status(200).json({ success: true, message: "access granted!" });
}

export const dashboardController = async (req, res) => {
try {
    const products = await Product.find().select('name category reservers');

    // 1️⃣ Per-product totals
    const perProduct = products.map(product => {
        const totalQuantity = product.reservers.reduce((sum, reserver) => sum + reserver.quantity, 0);
        return {
            Product: product.name,
            Category: product.category,
            Total: totalQuantity
        };
    });

    // 2️⃣ Per-category totals
    const categoryTotalsMap = {};
    products.forEach(product => {
        const totalQuantity = product.reservers.reduce((sum, reserver) => sum + reserver.quantity, 0);
        if (categoryTotalsMap[product.category]) {
            categoryTotalsMap[product.category] += totalQuantity;
        } else {
            categoryTotalsMap[product.category] = totalQuantity;
        }
    });

    const perCategory = Object.entries(categoryTotalsMap).map(([category, total]) => ({
        Category: category,
        Total: total
    }));

    res.status(200).json({
        success: true,
        message: "Dashboard data fetched!",
        user: req.user,
        perProduct,
        perCategory
    });
    } catch (error) {
        console.error("Error fetching products: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const stockController = async (req, res, next) => {
    try{
        const products = await Product.find();
        //automated status update based on currentStock
        for (let product of products) {
            const percentage = (product.currentStock / product.totalStock) * 100;
            if (percentage === 0 && product.status !== "Out") {
                product.status = "Out";
                await product.save();
            } else if (percentage > 0 && percentage < 30 && product.status !== "Low") {
                product.status = "Low";
                await product.save();
            } else if (percentage > 30 && product.status !== "Available") {
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
    //get user reserved items
    try {
        User.findById(req.user._id).then(async(user) => {
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            const reservedItems = await Promise.all(
            user.reservedItems.map(async (reservation) => {
                // Fetch the product, excluding reservers
                const product = await Product.findById(reservation.item, '-reservers -__v -currentStock -totalStock -status');
                
                reservation.item = product;
                
                console.log(reservation.item);
                return reservation;
            })
            );
            res.status(200).json({ success: true, message: "User reservations fetched successfully",user: req.user, reservations: reservedItems });
        });
    } catch (error) {
        console.error("Error fetching user reservations: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
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
}