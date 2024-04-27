import { genarateTokenAndSetCookie } from "../lib/utils/genarateTokenAndSetCookie.js";
import User from "./../models/user.model.js";
import bcrypt from "bcryptjs";

// 1. Signup
export const signup = async (req, res) => {
	try {
		const { fullname, username, email, password, mobilePhone } = req.body;

		// Check format of email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(email)) {
			return res.status(400).json({
				error: "Invalid email format",
			});
		}

		if (password.length < 6) {
			return res.status(400).json({
				error: "Password must be at least 6 characters",
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
			mobilePhone,
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
				mobilePhone: newUser.mobilePhone,
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
		console.error(">>> Error in Signup Controller: ", error.stack);
		res.status(500).json({
			error: "Invalid user data",
		});
	}
};

// 2. Login
export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username }).lean();

		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({
				error: "Invalid username or password",
			});
		}

		genarateTokenAndSetCookie(user._id, res);
		res.status(200).json({
			_id: user._id,
			fullname: user.fullname,
			username: user.username,
			mobilePhone: user.mobilePhone,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImage: user.profileImage,
			profileImage: user.profileImage,
			coverImage: user.coverImage,
		});
	} catch (error) {
		console.error(">>> Error in Login Controller: ", error.stack);
		res.status(500).json({
			error: "Invalid user data",
		});
	}
};

// 3. Logout
export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({
			message: "Logout successfully!",
		});
	} catch (error) {
		console.error(">>> Error in Logout Controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

// 4. Get information about the account current
export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.error(">>> Error in getMe Controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};
