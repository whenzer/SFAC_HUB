import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
    const {location, name, description, price, stock, category, image } = req.body;
    

    try {
        const newProduct = new Product({ name, description, price, stock, category, image, location });
        await newProduct.save();
        res.json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}