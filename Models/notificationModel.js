const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
	resident: {
		type: mongoose.Schema.ObjectId,
		ref: 'Resident'
	},
	message: {
		type: String
	}

}, {timestamps: true});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
