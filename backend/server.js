import express from "express";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";
import dotenv from "dotenv";

// Routes Important
import routerIndex from "./routes/index.js";
import connectMongoDB from "./db/connectMongoDB.js";

const app = express();
const PORT = process.env.PORT || 8000;
dotenv.config();
// middleware

// routes
app.use("", routerIndex);

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
