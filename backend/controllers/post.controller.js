import Post from "../models/user.post.model.js";
import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";

export const lostandfoundController = async (req, res) => {
    try {
        //firstname, middlename, lastname, email, role
        const posts = await Post.find().populate('user', 'firstname middlename lastname email role').populate("content.claimedby", "firstname lastname email role").lean();
        posts.forEach(post => {
            post.content.likedbyme = post.content.likes.users.some(id => id.toString() === req.user._id.toString());
        });

        res.status(200).json({ success: true, data: posts, user: req.user });
    } catch (error) {
        console.error("Error fetching posts: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const createPostController = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user._id;
        if (!content || !content.postType || !content.briefTitle || !content.description || !content.category || !content.location || !content.photo) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Upload photo to Cloudinary
        if(cloudinary.config().cloud_name === undefined) {
            return res.status(500).json({ success: false, message: "Cloudinary is not configured properly" });
        }
        let imageData = content.photo.image;
        if (!imageData.startsWith('data:')) {
            // If only base64, add a default prefix (adjust if needed)
            imageData = `data:image/png;base64,${imageData}`;
        }
        const uploadResult = await cloudinary.uploader.upload(imageData, {
            folder: 'sfac_lostandfound',
            public_id: content.photo.filename.split('.')[0], // optional
        });
        // Store only the Cloudinary URL in photo.image
        content.photo.image = uploadResult.secure_url;

        // Create new post
        const newPost = new Post({ user: userId, content });
        await newPost.save();
        res.status(201).json({ success: true, message: "Post created successfully", data: newPost });
    } catch (error) {
        console.error("Error creating post: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const likePostController = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        if (post.content.likes.users.includes(userId)) {
            return res.status(400).json({ success: false, message: "You have already liked this post" });
        }
        post.content.likes.users.push(userId);
        post.content.likes.count += 1;
        await post.save();
        res.status(200).json({ success: true, message: "Post liked successfully", data: post });
    } catch (error) {
        console.error("Error liking post: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const unlikePostController = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        if (!post.content.likes.users.includes(userId)) {
            return res.status(400).json({ success: false, message: "You have not liked this post" });
        }
        post.content.likes.users = post.content.likes.users.filter(id => id.toString() !== userId.toString());
        post.content.likes.count -= 1;
        await post.save();
        res.status(200).json({ success: true, message: "Post unliked successfully", data: post });
    } catch (error) {
        console.error("Error unliking post: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const commentPostController = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        const { comment } = req.body;
        if (!comment) {
            return res.status(400).json({ success: false, message: "Comment cannot be empty" });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        post.content.comments.push({ user: userId, comment });
        await post.save();
        res.status(200).json({ success: true, message: "Comment added successfully", data: post });
    }
    catch (error) {
        console.error("Error commenting on post: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteCommentController = async (req, res) => {
    try {
        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        const comment = post.content.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You can only delete your own comments" });
        }

        post.content.comments.pull(commentId);

        await post.save();
        res.status(200).json({ success: true, message: "Comment deleted successfully", data: post });
    }
    catch (error) {
        console.error("Error deleting comment: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}

export const claimItemController = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        if (post.content.claimedby) {
            return res.status(400).json({ success: false, message: "Item has already been claimed" });
        }
        post.content.claimedby = userId;
        await post.save();
        res.status(200).json({ success: true, message: "Item claimed successfully", data: post });
    } catch (error) {
        console.error("Error claiming item: ", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}