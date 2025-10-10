import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Reservation from "../models/product.reservation.model.js";

export const protectedController = (req, res) => {
    res.status(200).json({ success: true, message: "access granted!" });
}

export const dashboardController = async (req, res) => {
    
    try {
        // 1️⃣ Get all pending reservations and populate the product info
        let reservations = await Reservation.find({ status: "Pending" }).populate('item', 'name category').lean();
        reservations = reservations.filter(r => r.item !== null);
        // 2️⃣ Per-product totals
        const perProductMap = {};
        reservations.forEach(res => {
            const productName = res.item.name;
            const category = res.item.category;
            if (perProductMap[productName]) {
            perProductMap[productName].Total += res.quantity;
            } else {
            perProductMap[productName] = { Product: productName, Category: category, Total: res.quantity };
            }
        });
        const perProduct = Object.values(perProductMap);

        // 3️⃣ Per-category totals
        const perCategoryMap = {};
        perProduct.forEach(p => {
            if (perCategoryMap[p.Category]) {
            perCategoryMap[p.Category] += p.Total;
            } else {
            perCategoryMap[p.Category] = p.Total;
            }
        });
        const perCategory = Object.entries(perCategoryMap).map(([Category, Total]) => ({ Category, Total }));

        // 4️⃣ Overall total
        const overallTotal = perProduct.reduce((sum, item) => sum + item.Total, 0);

        res.status(200).json({
            success: true,
            message: "Dashboard data fetched!",
            user: req.user,
            perProduct,
            perCategory,
            overallTotal
        });
        } catch (error) {
            console.error("Error fetching dashboard data: ", error.message);
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

export const reservationController = async (req, res) => {
    //get user reserved items
    try {
        let reservedItems = await Reservation.find({ user: req.user._id }).populate('item', '-reservers -__v -currentStock -totalStock -status').lean();
        reservedItems.forEach(r => {
            if (!r.item) {
                r.item = { name: "Product not found or Deleted", category: "N/A", price: 0};
                r.status = "Expired";
            }
        });
        res.status(200).json({ success: true, message: "User reservations fetched successfully",user: req.user, reservations: reservedItems });
        
    } catch (error) {
        console.error("Error fetching user reservations: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const stockreserveController = async (req, res) => {
    const { productId, quantity, email, reservationID, purpose } = req.body;

    if (!productId || !quantity || !email || !reservationID) {
    return res.status(400).json({
        success: false,
        message: "Product ID, quantity, email, and reservationID are required"
    });
    }

    if (quantity <= 0) {
    return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero"
    });
    }

    try {
        // 1️⃣ Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (product.currentStock < quantity) {
            return res.status(400).json({ success: false, message: "Insufficient stock available" });
        }

        // 2️⃣ Decrement stock
        product.currentStock -= quantity;

        // 3️⃣ Create reservation
        const reservation = await Reservation.create({
            item: productId,
            user: req.user._id,
            email,
            quantity,
            reservationID,
            purpose,
            status: "Pending"
        });

        // 4️⃣ Push to product.reservers
        product.reservers.push({ user: req.user._id, reservation: reservation._id });
        await product.save();

        // 5️⃣ Push to user.reservedItems
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.reservedItems.push({ item: productId, reservation: reservation._id });
        await user.save();

        res.status(200).json({
            success: true,
            message: "Product reserved successfully",
            reservationId: reservation._id
    });

    } catch (error) {
        console.error("Error reserving product: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }

    
    // const { productId, quantity, email, reservationID, purpose } = req.body;
    // const userId = req.user._id;
    // if (!productId || !quantity || !email || !reservationID) {
    //     return res.status(400).json({ success: false, message: "Product ID, quantity, email, and reservationID are required" });
    // }
    // if (quantity <= 0) {
    //     return res.status(400).json({ success: false, message: "Quantity must be greater than zero" });
    // }
    // try {

    //     Product.findById(productId).then(async (product) => {
    //         if (!product) {
    //             return res.status(404).json({ success: false, message: "Product not found" });
    //         }
    //         if (product.currentStock < quantity) {
    //             return res.status(400).json({ success: false, message: "Insufficient stock available" });
    //         }

    //         product.currentStock -= quantity;

    //         product.reservers.push({ user: userId, email, quantity, reservationID, purpose });
    //         await product.save();
    //         res.status(200).json({ success: true, message: "Product reserved successfully", product });
    //     });

    //     User.findById(userId).then(async (user) => {
    //         if (!user) {
    //             return res.status(404).json({ success: false, message: "User not found" });
    //         }
    //         user.reservedItems.push({ item: productId, email, quantity, reservationID, purpose });
    //         await user.save();
    //     });
        
    // } catch (error) {
    //     console.error("Error reserving product: ", error.message);
    //     res.status(500).json({ success: false, message: error.message });
    // }
}

export const cancelreservationController = async (req, res) => {
    const { reservationId } = req.params;
    const userId = req.user._id;

    if (!reservationId) {
        return res.status(400).json({ success: false, message: "Reservation ID is required" });
    }
    try {
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ success: false, message: "Reservation not found" });
        }
        if (reservation.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You can only cancel your own reservations" });
        }
        if (reservation.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Only pending reservations can be cancelled" });
        }
        const product = await Product.findById(reservation.item);
        if (!product) {
            return res.status(404).json({ success: false, message: "Associated product not found" });
        }
        product.currentStock += reservation.quantity;
        product.reservers = product.reservers.filter(r => r.reservation.toString() !== reservationId);
        // set reservation status to Cancelled
        reservation.status = "Cancelled";
        await reservation.save();
        await product.save();

        res.status(200).json({ success: true, message: "Reservation cancelled successfully" });
    } catch (error) {
        console.error("Error cancelling reservation: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
