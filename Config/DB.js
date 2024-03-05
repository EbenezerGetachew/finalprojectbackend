const mongoose = require("mongoose");
const config = require("./Keys");
const db = config.mongoURI;
const connectDB = async () => {
	try {
		await mongoose.connect(db);
		console.log("connected to db");
	} catch (err) {
		console.log(err);
		console.log("is not connected to DB");
		process.exit(1);
	}
};
module.exports = connectDB;
