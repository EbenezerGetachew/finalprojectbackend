const mongoose = require("mongoose");
const kebeleSchema = new mongoose.Schema({
	name: {
		type: String
	},
	description: {
		type: String
	},
	status: {
		type: String,
		enum: [
			"Active", "InActive"
		],
		default: "Active",
		required: true
	}
}, {timestamps: true});

const Kebele = mongoose.model("Kebele", kebeleSchema);
module.exports = Kebele;
