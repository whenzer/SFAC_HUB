export const dashboardController = (req, res) => {
    res.status(200).json({ success: true, message: "Welcome to the dashboard!", user: req.user });
}