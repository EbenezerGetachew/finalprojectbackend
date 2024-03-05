// ! it doesn't work for me in this way.
// require("dotenv").config();
// ?  when you push comment mine.
require("dotenv").config({path: "./Config/.env"});
module.exports = {
	mongoURI: process.env.DB_PRODUCTION,
	jwtSecret: process.env.JWT_SECRET,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN
};
