import mongoose from "mongoose";

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "users";
// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		password: {
			type: String,
			required: true,
			minLength: 6,
		},
		fullname: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		mobile: {
			type: String,
			required: true,
			unique: true,
		},
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: DOCUMENT_NAME,
				default: [],
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: DOCUMENT_NAME,
				default: [],
			},
		],
		profileImage: {
			type: String,
			default: "",
		},
		coverImage: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},
		link: {
			type: String,
			default: "",
		},
	},
	{
		timestamps: true,
		collection: COLLECTION_NAME,
	}
);

//Export the model
const User = mongoose.model(DOCUMENT_NAME, userSchema);
export default User;
