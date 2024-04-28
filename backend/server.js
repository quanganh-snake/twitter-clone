import express from "express";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Routes Important
import routerIndex from "./routes/index.js";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";

// config server
const app = express();
const PORT = process.env.PORT || 8000;
dotenv.config();
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// middleware
app.use(express.json()); // parse req.body
app.use(express.urlencoded({ extended: true })); // parse req.body : x-www-form-urlencoded
app.use(cookieParser());
// routes
app.use("/", routerIndex);

// root server
const __dirname = dirname(fileURLToPath(import.meta.url));
app.get("/", (req, res) => {
	const indexPath = path.join(__dirname, "index.html");
	res.sendFile(indexPath);
});
app.listen(PORT, (res) => {
	console.log(`Server listening on PORT: ${PORT}`);
	connectMongoDB();
});
