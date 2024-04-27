import { genarateTokenAndSetCookie } from "../lib/utils/genarateTokenAndSetCookie.js";
import User from "./../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res, next) => {
	try {
		const { fullname, username, email, password } = req.body;

		// Check format of email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(email)) {
			return res.status(400).json({
				error: "Invalid email format",
			});
		}

		// Check if the user already exists
		const existingUser = await User.findOne({ username }).lean();

		if (existingUser) {
			return res.status(400).json({
				error: "Username already exists",
			});
		}

		// Check if the email already exists
		const existingEmail = await User.findOne({ email }).lean();

		if (existingEmail) {
			return res.status(400).json({
				error: "Email already exists",
			});
		}

		// hashPassword
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			fullname,
			username,
			email,
			password: hashedPassword,
		});

		if (newUser) {
			genarateTokenAndSetCookie(newUser._id, res);
			await newUser.save();
			res.status(201).json({
				_id: newUser._id,
				fullname: newUser.fullname,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImage: newUser.profileImage,
				profileImage: newUser.profileImage,
				coverImage: newUser.coverImage,
			});
		} else {
		}
	} catch (error) {
		res.status(500).json({
			error: "Invalid user data",
		});
	}
};

export const login = async (req, res, next) => {
	res.json({
		msg: "login",
	});
};

export const logout = async (req, res, next) => {
	res.json({
		msg: "logout",
	});
};
