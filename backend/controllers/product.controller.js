import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
    let {location, name, totalStock, currentStock, description, price, stock, category, image } = req.body;
    

    try {
        // Validate required fields
        if (!location || !name || !description || !category) {
            return res.status(400).json({ success: false, message: 'location, name, description, and category are required' });
        }
        if (totalStock === undefined || currentStock === undefined) {
            return res.status(400).json({ success: false, message: 'totalStock and currentStock are required' });
        }
        const ts = Number(totalStock);
        const cs = Number(currentStock);
        if (Number.isNaN(ts) || Number.isNaN(cs)) {
            return res.status(400).json({ success: false, message: 'totalStock and currentStock must be numbers' });
        }
        if (ts < 0 || cs < 0) {
            return res.status(400).json({ success: false, message: 'Stock values must be non-negative' });
        }
        if (cs > ts) {
            return res.status(400).json({ success: false, message: 'currentStock cannot exceed totalStock' });
        }

        if(cloudinary.config().cloud_name === undefined) {
            return res.status(500).json({ success: false, message: "Cloudinary is not configured properly" });
        }
        if (!image || String(image).trim() === '') {
            return res.status(400).json({ success: false, message: 'image is required (base64)'});
        }
        let imageData = image;
        if (!imageData.startsWith('data:')) {
            // If only base64, add a default prefix (adjust if needed)
            imageData = `data:image/png;base64,${imageData}`;
        }
        const uploadResult = await cloudinary.uploader.upload(imageData, {
            folder: 'sfac_products',
            public_id: name.split(' ').join('_'), // optional
        });
        // Store only the Cloudinary URL
        const imageUrl = uploadResult.secure_url;
        const newProduct = new Product({ name, description, price, stock, category, image: imageUrl, location, totalStock: ts, currentStock: cs });
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