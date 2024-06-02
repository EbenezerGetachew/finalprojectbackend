const catchAsync = require("./../ErrorHandler/catchAsync");
const AppError = require("./../ErrorHandler/appError");
const Kebele = require("./../Models/kebeleModel");


// kebele should only created by super user .
// all kebele Admins should have kebele.
exports.Create = catchAsync(async (req, res, next) => {
	const data = req.body;
	const newKebele = await Kebele.create(data);
	res.status(201).json({newKebele});
});

exports.Read = catchAsync(async (req, res, next) => {
	const kebele = req.params.kebele;
	const _kebele = await Kebele.findByKebele(kebele);
	if (! _kebele) {
		next(new AppError("No kebele found", 404));
		return;
	}

	res.status(200).json({_kebele});
});

exports.ReadMany = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const kebeles = await Kebele.find();
	res.status(200).json(kebeles);
});


exports.Change = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const kebele = req.params.id;
	const _kebele = await Kebele.findById(kebele);
	if (! _kebele) {
		next(new AppError("Kebele is not found", 404));
		return;
	}
	const data = req.body;
	const updatedKebele = await Kebele.findByIdAndUpdate(kebele, data, {
		new: true,
		runValidators: false
	});
	res.status(201).json(updatedKebele);
});

exports.Erase = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const kebele = req.params.kebele;
	const _kebele = await Kebele.findByKebele(kebele);
	if (! _kebele) {
		next(new AppError("Kebele do not exist with this id", 404));
		return;
	}
	await Kebele.findByKebeleAndDelete(kebele);
	res.status(201).json({msg: "success"});
});
