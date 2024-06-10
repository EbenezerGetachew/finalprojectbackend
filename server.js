const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./Config/DB");
// const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
// const rateLimit = require("express-rate-limit");
const globalErrorHandler = require("./ErrorHandler/errorController");
const AppError = require("./ErrorHandler/appError");

const PORT = process.env.PORT || 5001;
require("dotenv").config();
app.use(cors());
connectDB();

// mongoose.set("strictQuery", true);

app.use(express.json());
app.use(express.json({extended: false}));
app.use(express.json({limit: "50kb"}));
app.use(mongoSanitize());

/*
General error handling for syncronus code.

! REMEMBER: it should be set in the beginning.

*/
process.on("uncaughtException", (err) => {
	console.log(err);
	console.log("Uncaught Exception");
	console.log("SHUTTING DOWN");
	process.exit(1);
});


const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')
// ? SWagger UI
app.use('/api/v1/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
// ? 4-12  ROUTE ENDPOINTS
app.use("/api/v1/id", require("./Routers/idRoute"));
app.use("/api/v1/kebele", require("./Routers/kebeleRoute"));
app.use("/api/v1/resident", require("./Routers/residentRoute"));
app.use("/api/v1/serviceReview", require("./Routers/ServiceReviewRoute"));
app.use("/api/v1/admin", require("./Routers/systemAdminRoute"));
app.use("/api/v1/contact", require("./Routers/contactRoute"));


// For showing the client 404 not found when searched for invalid  url.
app.all("*", (req, res, next) => {
	next(new AppError(`can't find ${
		req.originalUrl
	} on our server`, 404));
});

// Global error handler for handling errors globally.
app.use(globalErrorHandler);
app.listen(PORT, () => {
	console.log("app is listenning");
});

// The error handler for all asynchronous codes.
process.on("unhandledRejection", (err) => {
	console.log(err.name, err.message),
	console.log("Unhandled error happened and shutting down ....");
	process.exit(1);
});
