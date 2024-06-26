const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// the time stamp will create the created and updated.
const residentSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: [true, " first name is required "]
	},
	lastName: {
		type: String,
		required: [true, " last name is required "]
	},
	dob: {
		type: Date,
		required: true
	},
	gender: {
		type: String,
		enum: ["Male", "Female"]
	},
	placeOfBirth: {
		type: String
	},
	countryFrom: {
		type: String
	},
	emergencyContact: {
		type: String
	},
	bloodGroup: {
		type: String
	},
	houseNo: {
		type: String
	},
	motherName: {
		type: String
	},
	job: {
		type: String
	},
	residentAddress: {
		subcity: {
			type: String
		},
		woreda: {
			type: String
		},
		street: {
			type: String
		}

	},
	profile: {
		type: String

	},
	phoneNumber: {
		type: String,
		unique: true,
		required: [true, "Phone number is required to create a new resident account "]
	},

	kebele: {
		type: mongoose.Schema.ObjectId,
		ref: 'Kebele',
		required: true
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
	status: {
		type: String,
		enum: [
			"Active", "Inactive"
		],
		default: "Active"
	}
}, {timestamps: true});

residentSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		return next();
	}
	this.password = await bcrypt.hash(this.password, 12);
	// this.confirmPassword = undefined;
	next();
});

// for checking the correctness of user password for logging them in .
residentSchema.methods.correctPassword = async function (canditatePassword, password) {
	return await bcrypt.compare(canditatePassword, password);
};

const Resident = mongoose.model("Resident", residentSchema);
module.exports = Resident;
