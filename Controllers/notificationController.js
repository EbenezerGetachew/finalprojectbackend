const catchAsync = require("./../ErrorHandler/catchAsync");
const AppError = require("./../ErrorHandler/appError");
const Notification = require("./../Models/notificationModel");
const Resident = require("./../Models/residentModel")

exports.getMyNotification = catchAsync(async (req, res, next) => {
	const residentId = res.locals.id;
	let notifications = [];
	if (residentId) {
		let resident = await Resident.findById(residentId);
		notifications = await Notification.find({resident: resident._id})
	}
	res.status(200).json({notifications});
});
