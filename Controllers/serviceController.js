const catchAsync = require("./../ErrorHandler/catchAsync");
const AppError = require("./../ErrorHandler/appError");
const Service = require("./../Models/serviceModel");

exports.Create = catchAsync(async (req, res, next) => {
	const data = req.body;
	const newService = await Service.create(data);
	res.status(201).json({newService});
});

exports.Read = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	// !Authorization should be done here.
	const _service = await Service.findById(id);
	if (! _service) {
		next(new AppError("No service found", 404));
		return;
	}
	res.status(200).json({_service});
});

exports.ReadMany = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const services = await Service.find();
	res.status(200).json({services});
});

exports.Change = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const id = req.params.id;
	const _service = await Service.findById(id);
	if (! _service) {
		next(new AppError("Service is not found", 404));
		return;
	}
	const data = req.body;
	const updatedService = await Service.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: false
	});

	res.status(201).json(updatedService);
});


exports.Erase = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const id = req.params.id;
	const _service = await Service.findById(id);
	if (! _service) {
		next(new AppError("Service do not exist with this id", 404));
		return;
	}
	await Service.findByIdAndDelete(id);
	res.status(201).json({msg: "success"});
});
