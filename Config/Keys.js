// keys
// to expose the constants in the .env for the other modules.
require("dotenv").config({path: "./Config/.env"});
module.exports = {
	mongoURI: process.env.DB_PRODUCTION,
	jwtSecret: process.env.JWT_SECRET,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN
};
