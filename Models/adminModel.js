const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// the time stamp will create the created and updated.
const adminSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: [true, " full name is required "]
	},
	lastName: {
		type: String,
		required: [true, " last name is required "]
	},
	profile: {
		type: String

	},
	email: {
		type: String,
		required: [false, "email is required"]
	},
	username: {
		type: String
	},
	phoneNumber: {
		type: String,
		unique: true,
		required: [true, "Phone number is required to create a new admin "]
	},
	password: {
		type: String,
		required: [
			true, "Password is required!"
		],
		minlength: 6,
		select: false
	},
	passwordResetToken: {
		type: String
	},
	kebele: {
		type: mongoose.Schema.ObjectId,
		ref: 'Kebele'
	},
	role: {
		type: String,
		enum: [
			"Super Admin", "Admin", "Kebele Admin"
		],
		default: "Kebele Admin"
	}
}, {timestamps: true});

adminSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 12);
	// this.confirmPassword = undefined;
	next();
});

// for checking the correctness of user password for logging them in .
adminSchema.methods.correctPassword = async function (canditatePassword, password) {
	return await bcrypt.compare(canditatePassword, password);
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
