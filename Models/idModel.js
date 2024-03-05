const mongoose = require("mongoose");
const idSchema = new mongoose.Schema({
	resident: {
		type: mongoose.Schema.ObjectId,
		ref: 'Resident'
	},
	document: [
		{
			type: String
		}
	],
	reservationDate: {
		type: Date,
		required: true
	},
	statusChangeBy: {
		type: mongoose.Schema.ObjectId,
		ref: 'Admin'
	},
	idType: {
		type: String,
		enum: ["New", "Renewal"]
	},
	lastIdImage: {
		type: String
	},
	status: {
		type: String,
		enum: [
			"Up Coming", "Active", "Completed"
		],
		default: "Up Coming",
		required: true
	}
}, {timestamps: true});

const Id = mongoose.model("Id", idSchema);
module.exports = Id;
