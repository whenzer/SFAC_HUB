export const protectedController = (req, res, next) => {
    res.status(200).json({ success: true, message: "access granted!" });
    next();
}

export const dashboardController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to dashboard!", user: req.user });
}

export const stockController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to Stock Availability!", user: req.user });
}

export const reservationController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to Reservation!", user: req.user });
}

export const lostandfoundController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to Lost and Found!", user: req.user });
}