import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

export const createProduct = async (req, res) => {
    const {location, name, totalStock, currentStock, description, price, stock, category, image } = req.body;
    

    try {
        if(cloudinary.config().cloud_name === undefined) {
            return res.status(500).json({ success: false, message: "Cloudinary is not configured properly" });
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
        // Store only the Cloudinary URL in image
        image = uploadResult.secure_url;
        const newProduct = new Product({ name, description, price, stock, category, image, location, totalStock, currentStock });
        await newProduct.save();
        res.json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}