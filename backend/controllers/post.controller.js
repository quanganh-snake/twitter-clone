import { v2 as cloudinary } from "cloudinary";
// Models
import User from "./../models/user.model.js";
import Post from "./../models/post.model.js";
import Notification from "../models/notification.model.js";

// 0. getAllPosts
export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({
				createdAt: -1,
			})
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.error(">>> Error in getAllPosts controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

// 1. Create post
export const createPost = async (req, res) => {
	try {
		const { text } = req.body;
		let { image } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({
				message: "User not found!",
			});
		}

		if (!text && !image) {
			return res.status(400).json({
				error: "Post must have text or image",
			});
		}

		if (image) {
			const updatedResopnse = await cloudinary.uploader.upload(image);
			image = updatedResopnse.secure_url;
		}

		const newPost = new Post({
			user: userId,
			text,
			image,
		});
		await newPost.save();
		res.status(201).json(newPost);
	} catch (error) {
		console.error(">>> Error in createPost controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

// 2. Like post
export const likePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;
		const post = await Post.findById(postId);

		if (!post) return res.status(404).json({ error: "Post not found" });

		const checkUserLikedPost = post.likes.includes(userId);

		if (checkUserLikedPost) {
			// Unlike post
			await Post.updateOne(
				{ _id: postId },
				{
					$pull: {
						likes: userId,
					},
				}
			);
			await User.updateOne(
				{ _id: userId },
				{
					$pull: {
						likedPosts: postId,
					},
				}
			);

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());

			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne(
				{ _id: userId },
				{
					$push: {
						likedPosts: postId,
					},
				}
			);
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});

			await notification.save();
			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.error(">>> Error in likePost controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

// 3. Comment post
export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text) {
			return res.status(400).json({
				error: "Text field is required",
			});
		}

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({
				error: "Post not found",
			});
		}

		const comment = { user: userId, text };
		post.comments.push(comment);
		await post.save();
		res.status(200).json(post);
	} catch (error) {
		console.error(">>> Error in commentOnPost controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

// 4. Delete post
export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.json(404).json({ error: "Post not Found" });

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		// Check post have image -> delete image
		if (post.image) {
			const imageId = post.image.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imageId);
		}

		await Post.findByIdAndDelete(req.params.id);
		res.status(200).json({
			message: "Post deleted successfully!",
		});
	} catch (error) {
		console.error(">>> Error in deletePost controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

// 5. getLikedPosts: Lấy danh sách những bài viết bạn thích
export const getLikedPosts = async (req, res) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});
		res.status(200).json(likedPosts);
	} catch (error) {
		console.error(">>> Error in getLikedPosts controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

// 6. Lấy danh sách những bài viết từ những người bạn đang follow
export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const followingPosts = user.following;
		const feedPosts = await Post.find({ user: { $in: followingPosts } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({ path: "comments.user", select: "-password" });
		res.status(200).json(feedPosts);
	} catch (error) {
		console.error(">>> Error in getFollowingPosts controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

// 7. Lấy danh sách bài viết theo username
export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const posts = await Post.find({ user: user._id })
			.sort({
				createdAt: -1,
			})
			.populate({ path: "user", select: "-password" })
			.populate({ path: "comments.user", select: "-password" });
		res.status(200).json(posts);
	} catch (error) {
		console.error(">>> Error in getUserPosts controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};
