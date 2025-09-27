export const adminController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to Admin Panel!", user: req.user });
}
