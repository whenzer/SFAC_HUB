import Reservation from "../models/product.reservation.model.js";
import User from "../models/user.model.js";

export const staffController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to Staff Panel!", user: req.user });
}

export const collectOrderController = async (req, res) => {
    const { reservationId } = req.params;
    const userId = req.user._id;
    try {
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({ success: false, message: "Reservation not found" });
        }
        if (reservation.status === 'Collected') {
            return res.status(400).json({ success: false, message: "Reservation already collected" });
        }
        reservation.status = 'Collected';
        reservation.collectedAt = new Date();
        await reservation.save();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        // Attach user information to the reservation
        reservation.collectedBy = user._id;
        await reservation.save();

        res.status(200).json({ success: true, message: "Order collected successfully", reservation });
    }
    catch (error) {
        console.error("Error collecting order: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}
