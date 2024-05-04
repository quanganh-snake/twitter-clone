import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
// Models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

// 1. getUserProfile
export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password").lean();
		if (!user) {
			return res.status(404).json({
				message: "User not found",
			});
		}

		res.status(200).json(user);
	} catch (error) {
		console.error(">>> Error in getUserProfile: ", error.stack);
		res.status(500).json({
			error: error.message,
		});
	}
};

// 2. followUnfollowUser
export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);

		if (id === req.user._id.toString()) {
			return res.status(400).json({
				error: "You can't follow/unfollow yourself!",
			});
		}

		if (!userToModify || !currentUser) {
			return res.status(400).json({
				error: "User not found!",
			});
		}
		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// TODO: Unfollow user
			await User.findByIdAndUpdate(id, {
				$pull: {
					followers: req.user._id,
				},
			});
			await User.findByIdAndUpdate(req.user._id, {
				$pull: {
					following: id,
				},
			});
			res.status(200).json({
				message: "User unfollowed successfully!",
			});
		} else {
			// TODO: Follow user
			await User.findByIdAndUpdate(id, {
				$push: {
					followers: req.user._id,
				},
			});
			await User.findByIdAndUpdate(req.user._id, {
				$push: {
					following: id,
				},
			});
			// TODO: Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});
			await newNotification.save();

			// TODO: return response
			res.status(200).json({
				message: "User followed successfully!",
			});
		}
	} catch (error) {
		console.error(">>> Error in followUnfollowUser: ", error.stack);
		res.status(500).json({
			error: error.message,
		});
	}
};

// 3. getSuggetedUsers
export const getSuggetedUsers = async (req, res) => {
	try {
		const userId = req.user._id;
		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{
				$sample: {
					size: 10,
				},
			},
		]);

		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		console.error(">>> Error in getSuggetedUsers: ", error.stack);
		res.status(500).json({
			error: error.message,
		});
	}
};

// 4. updateUser
export const updateUser = async (req, res) => {
	const { fullname, email, username, currentPassword, newPassword, mobilePhone, bio, link } = req.body;

	let { profileImage, coverImage } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({
				error: "Please provide both current password and new password",
			});
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "New password must be at least 6 characters" });
			}

			const salt = await bcrypt.genSaltSync(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImage) {
			if (user.profileImage) {
				/**
				 * Storage cloudinary free: >150MB - 200MB
				 * update file -> delete file legacy -> insert file new
				 */
				await cloudinary.uploader.destroy(user.profileImage.split("/").prop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImage);
			profileImage = uploadedResponse.secure_url;
		}

		if (coverImage) {
			if (user.coverImage) {
				/**
				 * Storage cloudinary free: >150MB - 200MB
				 * update file -> delete file legacy -> insert file new
				 */
				await cloudinary.uploader.destroy(user.profileImage.split("/").prop().split(".")[0]);
			}
			const uploadedResponse = await cloudinary.uploader.upload(coverImage);
			coverImage = uploadedResponse.secure_url;
		}

		user.fullname = fullname || user.fullname;
		user.mobilePhone = mobilePhone || user.mobilePhone;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImage = profileImage || user.profileImage;
		user.coverImage = coverImage || user.coverImage;

		user = await user.save();

		// password should be null in response
		user.password = null;
		res.status(200).json({
			message: "User updated successfully",
		});
	} catch (error) {
		console.error(">>> Error in updateUser: ", error.stack);
		res.status(500).json({
			error: error.message,
		});
	}
};
