const mongoose = require("mongoose");
const contactSchema = new mongoose.Schema({

	firstName: {
		type: String
	},
	lastName: {
		type: String
	},
	email: {
		type: String
	},
	message: {
		type: String
	}

}, {timestamps: true});

const Contact = mongoose.model("Contact", contactSchema);
module.exports = Contact;
