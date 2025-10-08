export const staffController = (req, res) => {
    res.status(200).json({ success: true, message: "welcome to Staff Panel!", user: req.user });
}

