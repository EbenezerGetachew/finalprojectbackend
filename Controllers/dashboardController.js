const catchAsync = require("./../ErrorHandler/catchAsync");
const AppError = require("./../ErrorHandler/appError");
const Resident = require("./../Models/residentModel");
const Id = require("./../Models/idModel");
const Admin = require("./../Models/adminModel");


exports.Summary = catchAsync(async (req, res, next) => {
	const resident = await Resident.find().count();
	const admin = await Admin.find().count();
	const id = await Id.find().count();


	const dashboardSummary = {
		totalResident: resident,
		totalId: id,
		totalAdmin: admin
	};

	res.status(200).json({dashboardSummary});
});

exports.SummaryInKebele = catchAsync(async (req, res, next) => {
	const kebeleId = res.locals.admin.kebele;
	const resident = await Resident.find({kebele: kebeleId}).count();

	// add kebele filed to id.
	// const id = await id.find({kebele: kebeleId}).count();
	const id = 10;
	const admin = await Admin.find({kebele: kebeleId}).count();
	// const product = await Product.find().count();
	// !fix me
	const product = 10;

	const dashboardSummary = {
		totalIds: id,
		totalResident: resident,
		totalAdmin: admin
	};

	res.status(200).json({dashboardSummary});
});
