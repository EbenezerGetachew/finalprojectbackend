const catchAsync = require("./../ErrorHandler/catchAsync");
const AppError = require("./../ErrorHandler/appError");
const Id = require("./../Models/idModel");

exports.Create = catchAsync(async (req, res, next) => {
	const data = req.body;
	const newId = await Id.create(data);
	res.status(201).json({newId});
});

exports.Read = catchAsync(async (req, res, next) => {
	const id = req.params.id;
	const _id = await Id.findById(id);
	if (! _id) {
		next(new AppError("No id found", 404));
		return;
	}

	res.status(200).json({_id});
});

exports.ReadMany = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const ids = await Id.find();
	res.status(200).json(ids);
});


exports.Change = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const id = req.params.id;
	const _id = await Id.findById(id);
	if (! _id) {
		next(new AppError("Id is not found", 404));
		return;
	}
	const data = req.body;
	const updatedId = await Id.findByIdAndUpdate(id, data, {
		new: true,
		runValidators: false
	});
	res.status(201).json(updatedId);
});

exports.Erase = catchAsync(async (req, res, next) => { // !Authorization should be done here.
	const id = req.params.id;
	const _id = await Id.findById(id);
	if (! _id) {
		next(new AppError("Id do not exist with this id", 404));
		return;
	}
	await Id.findByIdAndDelete(id);
	res.status(201).json({msg: "sucess"});
});


exports.IdInKebele = catchAsync(async (req, res, next) => { // Retrieve the kebele ID from the currently authenticated admin
	const kebeleId = res.locals.admin.kebele.toString();
	const _idInKebele = await Id.find()
	// .populate('farmer', 'fullName kebele').exec();
	let _idsInKebele = [];
	_idInKebele.forEach(_id => { // console.log(kebeleId.toString());

		let kebeleNew = _id.resident.kebele.toString();
		if (kebeleNew == kebeleId) {
			_idsInKebele.push(_id);
		}
	})
	res.status(200).json({_idsInKebele});

});
