const mongoose = require("mongoose");
const serviceSchema = new mongoose.Schema({
	resident: {
		type: mongoose.Schema.ObjectId,
		ref: 'Resident'
	},
	rating: {
		type: Number
	},
	comment: {
		type: String
	}

}, {timestamps: true});

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
