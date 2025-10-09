import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
    const {location, name, totalStock, currentStock, description, price, category, imageData } = req.body;
    

    try {
        if(cloudinary.config().cloud_name === undefined) {
            return res.status(500).json({ success: false, message: "Cloudinary is not configured properly" });
        }
        if (!imageData.startsWith('data:')) {
            // If only base64, add a default prefix (adjust if needed)
            imageData = `data:image/png;base64,${imageData}`;
        }
        const uploadResult = await cloudinary.uploader.upload(imageData, {
            folder: 'sfac_products',
            public_id: name.split(' ').join('_'), // optional
        });
        // Store only the Cloudinary URL in image
        let image = uploadResult.secure_url;
        const newProduct = new Product({ name, description, price, category, image, location, totalStock, currentStock });
        await newProduct.save();
        res.json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export const restockProduct = async (req, res) => {
    const { productId, additionalStock } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        product.currentStock += additionalStock;
        await product.save();
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export const setTotalStock = async (req, res) => {
    const { productId, newTotalStock } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        product.totalStock = newTotalStock;
        if (product.currentStock > newTotalStock) {
            product.currentStock = newTotalStock;
        }
        await product.save();
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}